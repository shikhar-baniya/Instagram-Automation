require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const { sendPrivateReply, sendPrivateReplyWithButton, sendButtonTemplate, sendUrlButtonTemplate, sendMessage, getRecentPosts, checkFollowStatus, replyToComment } = require('./instagram');

const app = express();
const PORT = process.env.PORT || 3001;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_verify_token';

app.use(cors());
app.use(express.json());

let db;

app.post('/api/webhook', async (req, res) => {
    let body = req.body;
    console.log("--- INCOMING WEBHOOK ---");
    console.log(JSON.stringify(body, null, 2));

    if (body.object === 'instagram' || body.object === 'page') {
        body.entry.forEach(async function(entry) {
            if (entry.changes) {
                entry.changes.forEach(async function(change) {
                    if (change.field === 'comments' && change.value) {
                        const commentValue = change.value;
                        const commentId = commentValue.id;
                        const commentText = commentValue.text || "";
                        const mediaId = commentValue.media ? commentValue.media.id : null;
                        
                        console.log(`Received comment: ${commentText} on media: ${mediaId}`);

                        // Find matching rule
                        const result = await db.query('SELECT * FROM rules WHERE is_active = true');
                        const rules = result.rows;
                        let matchedRule = null;

                        for (const rule of rules) {
                            // 1. Check if post target matches
                            let postMatches = false;
                            if (rule.target_post_type === 'any') {
                                postMatches = true;
                            } else if (rule.target_post_type === 'specific' && mediaId && rule.target_media_id) {
                                // Support comma-separated IDs
                                const targetIds = rule.target_media_id.split(',').map(id => id.trim());
                                if (targetIds.includes(mediaId.toString())) {
                                    postMatches = true;
                                }
                            } else if (rule.target_post_type === 'next') {
                                // For MVP, 'next' behaves similar to 'any' but in a real system you'd lock it to the next published post
                                postMatches = true;
                            }

                            if (!postMatches) continue;

                            // 2. Check if keyword target matches
                            if (rule.match_type === 'any') {
                                matchedRule = rule;
                                break;
                            } else if (rule.match_type === 'exact' && commentText.trim().toLowerCase() === rule.trigger_keyword.toLowerCase()) {
                                matchedRule = rule;
                                break;
                            } else if (rule.match_type === 'partial' && commentText.toLowerCase().includes(rule.trigger_keyword.toLowerCase())) {
                                matchedRule = rule;
                                break;
                            }
                        }

                        if (matchedRule) {
                            console.log(`Matched rule ${matchedRule.id}, initiating DM...`);
                            
                            // Check if we should reply publicly
                            if (matchedRule.public_reply_text) {
                                await replyToComment(commentId, matchedRule.public_reply_text);
                            }

                            // Send DM (either opening button or full response)
                            if (matchedRule.opening_message && matchedRule.button_text) {
                                await sendPrivateReplyWithButton(commentId, matchedRule.opening_message, matchedRule.button_text, matchedRule.id);
                            } else {
                                await sendPrivateReply(commentId, matchedRule.response_message);
                            }
                            
                            // Track DM sent
                            await db.query('UPDATE rules SET dms_sent = dms_sent + 1 WHERE id = $1', [matchedRule.id]);
                        }
                    }
                });
            }

            // Handle Direct Messages (like Button taps / Quick Replies)
            if (entry.messaging) {
                entry.messaging.forEach(async function(messagingEvent) {
                    let payload = null;
                    if (messagingEvent.postback && messagingEvent.postback.payload) {
                        payload = messagingEvent.postback.payload; // Button Template click
                    } else if (messagingEvent.message && messagingEvent.message.quick_reply) {
                        payload = messagingEvent.message.quick_reply.payload; // Legacy Quick Reply click
                    }

                    if (payload) {
                        const senderId = messagingEvent.sender.id;
                        
                        console.log(`Received postback/button click: ${payload} from user ${senderId}`);
                        
                        if (payload.startsWith('RULE_')) {
                            const ruleId = parseInt(payload.replace('RULE_', ''), 10);
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
                                    if (rule.main_button_text && rule.main_button_url) {
                                        await sendUrlButtonTemplate(senderId, rule.response_message, rule.main_button_text, rule.main_button_url);
                                    } else {
                                        await sendMessage(senderId, rule.response_message);
                                    }
                                    
                                    // Track Click
                                    await db.query('UPDATE rules SET clicks = clicks + 1 WHERE id = $1', [rule.id]);
                                }
                            }
                        }
                    }
                });
            }
        });

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
        const posts = await getRecentPosts();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const { getUserProfile } = require('./instagram');
        const profile = await getUserProfile();
        const posts = await getRecentPosts();
        
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
        const { trigger_keyword, match_type, response_message, target_post_type, target_media_id, opening_message, button_text, require_follow, main_button_text, main_button_url, public_reply_text } = req.body;
        const result = await db.query(
            `INSERT INTO rules (trigger_keyword, match_type, response_message, target_post_type, target_media_id, opening_message, button_text, require_follow, main_button_text, main_button_url, public_reply_text) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [trigger_keyword, match_type || 'exact', response_message, target_post_type || 'any', target_media_id || null, opening_message, button_text, require_follow ? true : false, main_button_text, main_button_url, public_reply_text]
        );
        res.status(201).json({ id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/rules/:id', async (req, res) => {
    try {
        const { trigger_keyword, match_type, response_message, is_active, target_post_type, target_media_id, opening_message, button_text, require_follow, main_button_text, main_button_url, public_reply_text } = req.body;
        
        // If it's just a toggle, handle that
        if (Object.keys(req.body).length === 1 && is_active !== undefined) {
            await db.query('UPDATE rules SET is_active = $1 WHERE id = $2', [is_active ? true : false, req.params.id]);
        } else {
            await db.query(
                `UPDATE rules 
                 SET trigger_keyword = $1, match_type = $2, response_message = $3, is_active = $4, target_post_type = $5, target_media_id = $6, opening_message = $7, button_text = $8, require_follow = $9, main_button_text = $10, main_button_url = $11, public_reply_text = $12 
                 WHERE id = $13`,
                [trigger_keyword, match_type || 'exact', response_message, is_active ? true : false, target_post_type || 'any', target_media_id || null, opening_message, button_text, require_follow ? true : false, main_button_text, main_button_url, public_reply_text, req.params.id]
            );
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
            'INSERT INTO rules (trigger_keyword, match_type, response_message, target_post_type, target_media_id, opening_message, button_text, require_follow, main_button_text, main_button_url, public_reply_text, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
            [rule.trigger_keyword, rule.match_type, rule.response_message, rule.target_post_type, rule.target_media_id, rule.opening_message, rule.button_text, rule.require_follow, rule.main_button_text, rule.main_button_url, rule.public_reply_text, false] // Copy is inactive by default
        );
        res.json({ id: result.rows[0].id, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/rules/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM rules WHERE id = $1', [req.params.id]);
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
