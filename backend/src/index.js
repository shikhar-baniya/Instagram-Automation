require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const { sendPrivateReply, sendPrivateReplyWithButton, sendButtonTemplate, sendUrlButtonTemplate, sendMessage, getRecentPosts, checkFollowStatus, replyToComment, setIceBreakers } = require('./instagram');

async function syncIceBreakers() {
    if (!db) return;
    try {
        const result = await db.query("SELECT * FROM rules WHERE is_active = true AND trigger_type = 'ice_breaker' ORDER BY created_at DESC LIMIT 1");
        const rule = result.rows[0];
        
        let iceBreakersList = [];
        if (rule && rule.ice_breakers_config) {
            let configArray = rule.ice_breakers_config;
            if (typeof configArray === 'string') configArray = JSON.parse(configArray);
            
            iceBreakersList = configArray.map((item, index) => ({
                question: item.question.substring(0, 80), // Meta limit is 80 chars
                payload: `ICEBREAKER_${rule.id}_${index}`
            }));
        }

        await setIceBreakers(iceBreakersList);
    } catch (err) {
        console.error('Failed to sync ice breakers:', err);
    }
}

const app = express();
const PORT = process.env.PORT || 3001;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_verify_token';

app.use(cors());
app.use(express.json());

let db;

function normalizeText(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function sendWithRetry(sendFn, maxRetries = 3) {
    let attempt = 0;
    while (attempt < maxRetries) {
        attempt++;
        try {
            return await sendFn();
        } catch (err) {
            if (err.isTransient && attempt < maxRetries) {
                const backoffMs = Math.pow(2, attempt) * 1000;
                console.log(`[Retry] Transient error: ${err.message}. Retrying attempt ${attempt + 1}/${maxRetries} after ${backoffMs}ms...`);
                await new Promise(r => setTimeout(r, backoffMs));
            } else {
                throw err;
            }
        }
    }
}

async function claimExecution({ eventId, senderId, mediaId = null, text, triggerType }) {
    if (!eventId) throw new Error(`Cannot safely process ${triggerType}: Meta did not provide an event ID.`);

    const result = await db.query(
        `INSERT INTO automation_executions
            (comment_id, sender_id, media_id, comment_text, normalized_comment_text, trigger_type, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'received')
         ON CONFLICT (comment_id) DO NOTHING
         RETURNING id`,
        [eventId.toString(), senderId, mediaId ? mediaId.toString() : null, text || '', normalizeText(text), triggerType]
    );
    return result.rows[0]?.id || null;
}

async function markExecutionFailed(executionId, error) {
    if (!executionId) return;
    await db.query(
        `UPDATE automation_executions
         SET status = 'failed', error_message = $1, meta_error_message = $2,
             meta_error_code = $3, meta_error_subcode = $4, meta_http_status = $5,
             is_transient_error = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7`,
        [error.message || 'Delivery rejected by Instagram API.', error.rawMessage || error.message || null,
         error.metaErrorCode?.toString() || null, error.metaErrorSubcode?.toString() || null,
         error.statusCode || null, error.isTransient || false, executionId]
    );
}

let cachedProfile = null;
let lastProfileFetch = 0;
async function getCachedProfile() {
    if (!cachedProfile || Date.now() - lastProfileFetch > 300000) {
        try {
            const profile = await getUserProfile();
            if (profile) {
                cachedProfile = profile;
                lastProfileFetch = Date.now();
            }
        } catch (e) {}
    }
    return cachedProfile;
}

app.post('/api/webhook', async (req, res) => {
    let body = req.body;
    console.log("--- INCOMING WEBHOOK ---");
    console.log(JSON.stringify(body, null, 2));

    if (body.object === 'instagram' || body.object === 'page') {
        if (Array.isArray(body.entry)) {
            for (const entry of body.entry) {
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.field === 'comments' && change.value) {
                            const commentValue = change.value;
                            const commentId = commentValue.id;
                            const commentText = commentValue.text || "";
                            const mediaId = commentValue.media ? commentValue.media.id : null;
                            const senderId = commentValue.from ? commentValue.from.id?.toString() : null;
                            const senderHandle = commentValue.from ? (commentValue.from.username || commentValue.from.id) : "user";

                            // 0. Skip reply comments (e.g. public replies posted by page/bot or user replies to comments)
                            if (commentValue.parent_id) {
                                console.log(`[Skip] Comment ${commentId} is a reply comment (parent_id: ${commentValue.parent_id}). Skipping.`);
                                continue;
                            }

                            // 0b. Skip comments posted by page's own business account
                            const myProfile = await getCachedProfile();
                            if (myProfile) {
                                const myId = myProfile.id?.toString();
                                const myUsername = myProfile.username?.toLowerCase();
                                const currentSenderHandle = senderHandle.toLowerCase();

                                if ((myId && senderId === myId) || (entry.id && senderId === entry.id.toString()) || (myUsername && currentSenderHandle === myUsername)) {
                                    console.log(`[Skip] Comment ${commentId} posted by page's own account (@${senderHandle}). Skipping.`);
                                    continue;
                                }
                            }
                            
                            console.log(`Received comment: "${commentText}" by @${senderHandle} on media: ${mediaId}`);

                            const normalizedInput = normalizeText(commentText);

                            // 3. Find matching rule
                            const result = await db.query('SELECT * FROM rules WHERE is_active = true AND trigger_type = $1', ['post_comment']);
                            const rules = result.rows;
                            let matchedRule = null;

                            for (const rule of rules) {
                                let postMatches = false;
                                if (rule.target_post_type === 'any' || rule.target_post_type === 'next') {
                                    postMatches = true;
                                } else if (rule.target_post_type === 'specific' && mediaId && rule.target_media_id) {
                                    const targetIds = rule.target_media_id.split(',').map(id => id.trim());
                                    if (targetIds.includes(mediaId.toString())) {
                                        postMatches = true;
                                    }
                                }

                                if (!postMatches) continue;

                                const normalizedKeyword = normalizeText(rule.trigger_keyword);

                                if (rule.match_type === 'any') {
                                    matchedRule = rule;
                                    break;
                                } else if (rule.match_type === 'exact') {
                                    if (commentText.trim().toLowerCase() === rule.trigger_keyword.toLowerCase() || (normalizedKeyword && normalizedInput === normalizedKeyword)) {
                                        matchedRule = rule;
                                        break;
                                    }
                                } else if (rule.match_type === 'partial') {
                                    if (commentText.toLowerCase().includes(rule.trigger_keyword.toLowerCase()) || (normalizedKeyword && normalizedInput.includes(normalizedKeyword))) {
                                        matchedRule = rule;
                                        break;
                                    }
                                }
                            }

                            if (!matchedRule) {
                                console.log(`No post automation matched comment ${commentId}; not storing activity.`);
                                continue;
                            }

                            // Only matched automations are persisted. The atomic claim still
                            // happens before the first public reply or DM side effect.
                            let executionId;
                            try {
                                executionId = await claimExecution({
                                    eventId: commentId,
                                    senderId: `@${senderHandle}`,
                                    mediaId,
                                    text: commentText,
                                    triggerType: 'post_comment'
                                });
                            } catch (e) {
                                console.error(`Unable to claim comment ${commentId}:`, e.message);
                                continue;
                            }
                            if (!executionId) {
                                console.log(`[Idempotency] Comment ${commentId} was already claimed. Skipping.`);
                                continue;
                            }

                            console.log(`Matched rule ${matchedRule.id} for comment ${commentId}`);
                            await db.query(`UPDATE automation_executions SET status = 'matched', rule_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [matchedRule.id, executionId]);

                            // Check public reply
                            let publicReplySent = false;
                            if (matchedRule.public_reply_text) {
                                try {
                                    await replyToComment(commentId, matchedRule.public_reply_text);
                                    publicReplySent = true;
                                } catch (e) {
                                    console.error("Public reply error:", e.message);
                                }
                            }

                            // Stage: send_attempted
                            if (executionId) {
                                await db.query(`UPDATE automation_executions SET status = 'send_attempted', public_reply_sent = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [publicReplySent, executionId]);
                            }

                            // Attempt DM
                            try {
                                let hasButton = false;
                                if (matchedRule.opening_message && matchedRule.button_text) {
                                    hasButton = true;
                                    const buttonPayload = executionId ? `RULE_${matchedRule.id}_EXEC_${executionId}` : `RULE_${matchedRule.id}`;
                                    await sendWithRetry(() => sendPrivateReplyWithButton(commentId, matchedRule.opening_message, matchedRule.button_text, matchedRule.id, buttonPayload));
                                } else {
                                    await sendWithRetry(() => sendPrivateReply(commentId, matchedRule.response_message));
                                }

                                const finalStatus = hasButton ? 'pending_button_click' : 'accepted_by_meta';
                                if (executionId) {
                                    await db.query(`UPDATE automation_executions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [finalStatus, executionId]);
                                }
                                // Increment dms_sent ONLY on Meta success!
                                await db.query('UPDATE rules SET dms_sent = dms_sent + 1 WHERE id = $1', [matchedRule.id]);

                            } catch (metaErr) {
                                console.error(`Meta send failed for comment ${commentId}:`, metaErr.message);
                                await markExecutionFailed(executionId, metaErr);
                                // Track failure on rule
                                await db.query('UPDATE rules SET failed_dms = COALESCE(failed_dms, 0) + 1 WHERE id = $1', [matchedRule.id]);
                            }
                        }
                    }
                }

                // Handle Direct Messages / Postbacks / Story Replies
                if (entry.messaging) {
                    for (const messagingEvent of entry.messaging) {
                        let payload = null;
                        let messageText = null;
                        let isStoryReply = false;

                        if (messagingEvent.postback && messagingEvent.postback.payload) {
                            payload = messagingEvent.postback.payload;
                        } else if (messagingEvent.message && messagingEvent.message.quick_reply) {
                            payload = messagingEvent.message.quick_reply.payload;
                        } else if (messagingEvent.message && messagingEvent.message.text) {
                            messageText = messagingEvent.message.text;
                            isStoryReply = !!(messagingEvent.message.reply_to && messagingEvent.message.reply_to.story);
                        }

                        if (messageText) {
                            const senderId = messagingEvent.sender.id;
                            const mid = messagingEvent.message && messagingEvent.message.mid;
                            if (!mid) {
                                console.warn('Skipping inbound DM without a Meta message ID; it cannot be processed idempotently.');
                                continue;
                            }
                            const triggerType = isStoryReply ? 'story_reply' : 'dm_keyword';

                            const myProfile = await getCachedProfile();
                            if ((myProfile?.id && senderId.toString() === myProfile.id.toString()) || (entry.id && senderId.toString() === entry.id.toString())) {
                                console.log(`[Skip] Ignoring inbound message from the connected account (${senderId}).`);
                                continue;
                            }

                            console.log(`Received DM message: "${messageText}" from ${senderId}`);
                            {
                                const normalizedInput = normalizeText(messageText);

                                const triggerTypes = isStoryReply ? ['story_reply'] : ['dm_keyword', 'ice_breaker'];
                                const result = await db.query('SELECT * FROM rules WHERE is_active = true AND trigger_type = ANY($1)', [triggerTypes]);
                                const rules = result.rows;
                                let matchedRule = null;

                                for (const rule of rules) {
                                    if (isStoryReply && rule.target_story_type !== 'any') continue;

                                    if (rule.trigger_type === 'ice_breaker') {
                                        let configArray = rule.ice_breakers_config;
                                        if (typeof configArray === 'string') configArray = JSON.parse(configArray);
                                        if (configArray) {
                                            for (let item of configArray) {
                                                if (messageText.trim().toLowerCase() === item.question.toLowerCase() || normalizeText(item.question) === normalizedInput) {
                                                    matchedRule = {
                                                        ...rule,
                                                        response_message: item.response,
                                                        opening_message: null,
                                                        button_text: null
                                                    };
                                                    break;
                                                }
                                            }
                                        }
                                        if (matchedRule) break;
                                        continue;
                                    }

                                    const normalizedKeyword = normalizeText(rule.trigger_keyword);

                                    if (rule.match_type === 'any') {
                                        matchedRule = rule;
                                        break;
                                    } else if (rule.match_type === 'exact') {
                                        if (messageText.trim().toLowerCase() === rule.trigger_keyword.toLowerCase() || (normalizedKeyword && normalizedInput === normalizedKeyword)) {
                                            matchedRule = rule;
                                            break;
                                        }
                                    } else if (rule.match_type === 'partial') {
                                        if (messageText.toLowerCase().includes(rule.trigger_keyword.toLowerCase()) || (normalizedKeyword && normalizedInput.includes(normalizedKeyword))) {
                                            matchedRule = rule;
                                            break;
                                        }
                                    }
                                }

                                if (!matchedRule) {
                                    console.log(`No automation matched inbound DM ${mid}; not storing activity.`);
                                    continue;
                                }

                                let dmExecId;
                                try {
                                    dmExecId = await claimExecution({
                                        eventId: mid,
                                        senderId: `@user_${senderId.slice(-4)}`,
                                        text: messageText,
                                        triggerType
                                    });
                                } catch (e) {
                                    console.error(`Unable to claim inbound DM ${mid}:`, e.message);
                                    continue;
                                }
                                if (!dmExecId) {
                                    console.log(`[Idempotency] Inbound DM ${mid} was already claimed. Skipping.`);
                                    continue;
                                }

                                console.log(`Matched rule ${matchedRule.id} for DM`);
                                await db.query(`UPDATE automation_executions SET status = 'matched', rule_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [matchedRule.id, dmExecId]);

                                try {
                                        let hasButton = false;
                                        if (matchedRule.opening_message && matchedRule.button_text) {
                                            hasButton = true;
                                            const buttonPayload = dmExecId ? `RULE_${matchedRule.id}_EXEC_${dmExecId}` : `RULE_${matchedRule.id}`;
                                            await sendWithRetry(() => sendButtonTemplate(senderId, matchedRule.opening_message, matchedRule.button_text, buttonPayload));
                                        } else {
                                            await sendWithRetry(() => sendMessage(senderId, matchedRule.response_message));
                                        }

                                        const finalStatus = hasButton ? 'pending_button_click' : 'accepted_by_meta';
                                        if (dmExecId) {
                                            await db.query(`UPDATE automation_executions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [finalStatus, dmExecId]);
                                        }
                                        await db.query('UPDATE rules SET dms_sent = dms_sent + 1 WHERE id = $1', [matchedRule.id]);
                                    } catch (err) {
                                        console.error("Error sending DM:", err.message);
                                        await markExecutionFailed(dmExecId, err);
                                        await db.query('UPDATE rules SET failed_dms = COALESCE(failed_dms, 0) + 1 WHERE id = $1', [matchedRule.id]);
                                }
                            }
                        }

                        if (payload) {
                            const senderId = messagingEvent.sender.id;
                            console.log(`Received postback/button click: ${payload} from user ${senderId}`);
                            
                            if (payload.startsWith('RULE_')) {
                                const parts = payload.split('_');
                                const ruleId = parseInt(parts[1], 10);
                                let execId = null;
                                if (parts.length >= 4 && parts[2] === 'EXEC') {
                                    execId = parseInt(parts[3], 10);
                                }

                                const result = await db.query('SELECT * FROM rules WHERE id = $1', [ruleId]);
                                const rule = result.rows[0];
                                
                                if (rule) {
                                    let canSend = true;
                                    if (rule.require_follow) {
                                        const follows = await checkFollowStatus(senderId);
                                        if (!follows) {
                                            canSend = false;
                                            await sendButtonTemplate(senderId, "Please follow our page to receive the link, then tap the button again!", rule.button_text || "Send me the link", payload);
                                        }
                                    }

                                    if (canSend) {
                                        try {
                                            if (rule.main_button_text && rule.main_button_url) {
                                                await sendUrlButtonTemplate(senderId, rule.response_message, rule.main_button_text, rule.main_button_url);
                                            } else {
                                                await sendMessage(senderId, rule.response_message);
                                            }
                                            
                                            // New buttons carry their exact execution ID. Older buttons
                                            // safely fall back to the pending executions for this rule.
                                            const statusUpdate = execId
                                                ? await db.query(
                                                    `UPDATE automation_executions
                                                     SET status = 'accepted_by_meta', error_message = NULL,
                                                         updated_at = CURRENT_TIMESTAMP
                                                     WHERE id = $1 AND rule_id = $2 AND status = 'pending_button_click'
                                                     RETURNING id`,
                                                    [execId, rule.id]
                                                )
                                                : await db.query(
                                                    `UPDATE automation_executions
                                                     SET status = 'accepted_by_meta', error_message = NULL,
                                                         updated_at = CURRENT_TIMESTAMP
                                                     WHERE rule_id = $1 AND status = 'pending_button_click'
                                                     RETURNING id`,
                                                    [rule.id]
                                                );
                                            console.log(`[Postback] Final DM accepted; marked ${statusUpdate.rowCount} execution(s) as sent.`);
                                            await db.query('UPDATE rules SET clicks = clicks + 1 WHERE id = $1', [rule.id]);
                                        } catch (e) {
                                            console.error("Error sending postback response:", e.message);
                                            if (execId) await markExecutionFailed(execId, e);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Used by Meta App to verify webhook URL
app.get('/api/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// --- API Endpoints for Frontend Dashboard ---

app.get('/api/media', async (req, res) => {
    try {
        const { getPaginatedPosts } = require('./instagram');
        const after = req.query.after;
        const postsData = await getPaginatedPosts(after);
        res.json(postsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const { getUserProfile, getRecentPosts, getInsights } = require('./instagram');
        const profile = await getUserProfile();
        const posts = await getRecentPosts();
        
        let insights = null;
        if (profile && profile.id) {
            insights = await getInsights(profile.id);
        }
        
        // Calculate basic engagement metrics
        let totalLikes = 0;
        let totalComments = 0;
        posts.forEach(post => {
            totalLikes += (post.like_count || 0);
            totalComments += (post.comments_count || 0);
        });

        res.json({
            profile: profile || { followers_count: 0, media_count: 0, username: 'Unknown' },
            posts: posts.slice(0, 10), // Return top 10 for charts
            insights: insights,
            metrics: {
                totalLikes,
                totalComments,
                avgEngagement: posts.length > 0 ? ((totalLikes + totalComments) / posts.length).toFixed(1) : 0
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const result = await db.query('SELECT SUM(dms_sent) as total_dms FROM rules');
        res.json({ total_dms: parseInt(result.rows[0].total_dms) || 0, limit: 500 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/executions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const status = req.query.status;

        // The activity feed is for automations that actually matched a rule.
        // Received/not-matched comments and ordinary DMs are operational noise.
        let countQuery = `SELECT COUNT(*) FROM automation_executions e WHERE e.rule_id IS NOT NULL`;
        let dataQuery = `
            SELECT e.*, r.trigger_keyword, r.trigger_type as rule_trigger_type, r.response_message
            FROM automation_executions e
            LEFT JOIN rules r ON e.rule_id = r.id
            WHERE e.rule_id IS NOT NULL
        `;
        let countParams = [];
        let dataParams = [];

        const statusFilters = {
            sent: ["accepted_by_meta"],
            pending: ["pending_button_click"],
            failed: ["failed"],
            skipped: ["not_matched"]
        };
        const statuses = statusFilters[status];

        if (statuses) {
            countQuery += ` AND e.status = ANY($1)`;
            dataQuery += ` AND e.status = ANY($1)`;
            countParams.push(statuses);
            dataParams.push(statuses, limit, offset);
            dataQuery += ` ORDER BY e.created_at DESC LIMIT $2 OFFSET $3`;
        } else {
            dataParams.push(limit, offset);
            dataQuery += ` ORDER BY e.created_at DESC LIMIT $1 OFFSET $2`;
        }

        const [countRes, dataRes] = await Promise.all([
            db.query(countQuery, countParams),
            db.query(dataQuery, dataParams)
        ]);

        const total = parseInt(countRes.rows[0].count) || 0;
        const totalPages = Math.ceil(total / limit) || 1;

        res.json({
            executions: dataRes.rows,
            total,
            page,
            limit,
            totalPages
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/executions/stats', async (req, res) => {
    try {
        const totalAttempted = await db.query('SELECT COUNT(*) FROM automation_executions WHERE rule_id IS NOT NULL');
        const accepted = await db.query("SELECT COUNT(*) FROM automation_executions WHERE rule_id IS NOT NULL AND status = 'accepted_by_meta'");
        const failed = await db.query("SELECT COUNT(*) FROM automation_executions WHERE rule_id IS NOT NULL AND status = 'failed'");
        const pendingClicks = await db.query("SELECT COUNT(*) FROM automation_executions WHERE rule_id IS NOT NULL AND status = 'pending_button_click'");

        const attemptedCount = parseInt(totalAttempted.rows[0].count) || 0;
        const acceptedCount = parseInt(accepted.rows[0].count) || 0;
        const failedCount = parseInt(failed.rows[0].count) || 0;
        const pendingCount = parseInt(pendingClicks.rows[0].count) || 0;

        res.json({
            total_attempted: attemptedCount,
            accepted_count: acceptedCount,
            failed_count: failedCount,
            pending_clicks: pendingCount,
            success_rate: attemptedCount > 0 ? ((acceptedCount / attemptedCount) * 100).toFixed(1) : "100.0"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/rules', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM rules ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rules', async (req, res) => {
    try {
        const { trigger_keyword, match_type, response_message, target_post_type, target_media_id, opening_message, button_text, require_follow, main_button_text, main_button_url, public_reply_text, trigger_type, target_story_type, ice_breakers_config } = req.body;
        
        let configJson = null;
        if (ice_breakers_config) {
            configJson = typeof ice_breakers_config === 'string' ? ice_breakers_config : JSON.stringify(ice_breakers_config);
        }

        const result = await db.query(
            `INSERT INTO rules (trigger_keyword, match_type, response_message, target_post_type, target_media_id, opening_message, button_text, require_follow, main_button_text, main_button_url, public_reply_text, trigger_type, target_story_type, ice_breakers_config) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
            [trigger_keyword || '', match_type || 'exact', response_message || '', target_post_type || 'any', target_media_id || null, opening_message, button_text, require_follow ? true : false, main_button_text, main_button_url, public_reply_text, trigger_type || 'post_comment', target_story_type || 'any', configJson]
        );
        
        if (trigger_type === 'ice_breaker') {
            await syncIceBreakers();
        }

        res.status(201).json({ id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/rules/:id', async (req, res) => {
    try {
        const { trigger_keyword, match_type, response_message, is_active, target_post_type, target_media_id, opening_message, button_text, require_follow, main_button_text, main_button_url, public_reply_text, trigger_type, target_story_type, ice_breakers_config } = req.body;
        
        // If it's just a toggle, handle that
        if (Object.keys(req.body).length === 1 && is_active !== undefined) {
            await db.query('UPDATE rules SET is_active = $1 WHERE id = $2', [is_active ? true : false, req.params.id]);
        } else {
            let configJson = null;
            if (ice_breakers_config) {
                configJson = typeof ice_breakers_config === 'string' ? ice_breakers_config : JSON.stringify(ice_breakers_config);
            }

            await db.query(
                `UPDATE rules 
                 SET trigger_keyword = $1, match_type = $2, response_message = $3, is_active = $4, target_post_type = $5, target_media_id = $6, opening_message = $7, button_text = $8, require_follow = $9, main_button_text = $10, main_button_url = $11, public_reply_text = $12, trigger_type = $13, target_story_type = $14, ice_breakers_config = $15 
                 WHERE id = $16`,
                [trigger_keyword || '', match_type || 'exact', response_message || '', is_active ? true : false, target_post_type || 'any', target_media_id || null, opening_message, button_text, require_follow ? true : false, main_button_text, main_button_url, public_reply_text, trigger_type || 'post_comment', target_story_type || 'any', configJson, req.params.id]
            );
        }
        
        // Sync if this rule is an ice breaker, or if we are potentially turning off an ice breaker
        const checkTypeRes = await db.query('SELECT trigger_type FROM rules WHERE id = $1', [req.params.id]);
        if (checkTypeRes.rows[0] && checkTypeRes.rows[0].trigger_type === 'ice_breaker') {
            await syncIceBreakers();
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rules/:id/copy', async (req, res) => {
    try {
        const ruleRes = await db.query('SELECT * FROM rules WHERE id = $1', [req.params.id]);
        const rule = ruleRes.rows[0];
        if (!rule) return res.status(404).json({ error: 'Rule not found' });
        
        const result = await db.query(
            'INSERT INTO rules (trigger_keyword, match_type, response_message, target_post_type, target_media_id, opening_message, button_text, require_follow, main_button_text, main_button_url, public_reply_text, trigger_type, target_story_type, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id',
            [rule.trigger_keyword, rule.match_type, rule.response_message, rule.target_post_type, rule.target_media_id, rule.opening_message, rule.button_text, rule.require_follow, rule.main_button_text, rule.main_button_url, rule.public_reply_text, rule.trigger_type, rule.target_story_type, false] // Copy is inactive by default
        );
        res.json({ id: result.rows[0].id, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/rules/:id', async (req, res) => {
    try {
        const checkTypeRes = await db.query('SELECT trigger_type FROM rules WHERE id = $1', [req.params.id]);
        const triggerType = checkTypeRes.rows[0] ? checkTypeRes.rows[0].trigger_type : null;

        await db.query('DELETE FROM rules WHERE id = $1', [req.params.id]);
        
        if (triggerType === 'ice_breaker') {
            await syncIceBreakers();
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function startServer() {
    db = await initDB();
    app.listen(PORT, () => {
        console.log(`Backend is running on port ${PORT}`);
    });
}

startServer();
