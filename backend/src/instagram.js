const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GRAPH_API_VERSION = 'v25.0'; 

class MetaApiError extends Error {
    constructor(message, statusCode, metaErrorCode, metaErrorSubcode, isTransient) {
        super(message);
        this.name = 'MetaApiError';
        this.statusCode = statusCode;
        this.metaErrorCode = metaErrorCode;
        this.metaErrorSubcode = metaErrorSubcode;
        this.isTransient = isTransient;
    }
}

function formatMetaErrorMessage(metaCode, subcode, rawMsg) {
    const msg = rawMsg || "";

    // Code 100, subcode 2534015 or Arabic/localized "التعليق غير صالح"
    if (metaCode === 100 && (subcode === 2534015 || msg.includes("غير صالح") || msg.toLowerCase().includes("invalid comment"))) {
        return "Invalid comment for private reply. The comment may be deleted, already replied to, or older than 7 days.";
    }
    if (metaCode === 100) {
        return "Invalid parameter or expired comment ID. Private replies are only allowed within 7 days of comment creation.";
    }
    if (metaCode === 10 || subcode === 2534001 || msg.toLowerCase().includes("privacy")) {
        return "User's Instagram privacy settings restrict receiving message requests from public accounts.";
    }
    if (metaCode === 613 || metaCode === 4 || msg.toLowerCase().includes("rate limit")) {
        return "Instagram hourly rate limit (250 DMs/hour) exceeded. Remaining messages will queue for retries.";
    }
    if (metaCode === 200 || msg.toLowerCase().includes("permission")) {
        return "Page lacks permission to DM this user or user has not opted into receiving DMs.";
    }

    // If message contains non-ASCII characters (e.g. Arabic, Chinese, etc.), map to clean English
    if (/[^\x00-\x7F]/.test(msg)) {
        return `Instagram API Error (Code ${metaCode || '100'}): Private reply failed for this comment.`;
    }

    return msg || "Delivery rejected by Instagram Graph API.";
}

function parseMetaError(error) {
    if (error.response && error.response.data && error.response.data.error) {
        const metaErr = error.response.data.error;
        const statusCode = error.response.status;
        const metaCode = metaErr.code;
        const subcode = metaErr.error_subcode;
        const rawMessage = metaErr.message || error.message;
        const formattedMessage = formatMetaErrorMessage(metaCode, subcode, rawMessage);
        
        // Transient errors: 5xx server errors, HTTP 429 / Meta Code 613 (rate limit), network timeouts
        const isTransient = statusCode >= 500 || statusCode === 429 || metaCode === 613 || metaCode === 4 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
        
        return new MetaApiError(formattedMessage, statusCode, metaCode, subcode, isTransient);
    }
    const isTransient = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || !error.response;
    return new MetaApiError(error.message || "Delivery rejected by Instagram API.", error.response ? error.response.status : 500, null, null, isTransient);
}

async function sendPrivateReply(commentId, messageText) {
    if (!PAGE_ACCESS_TOKEN) {
        throw new MetaApiError("Missing PAGE_ACCESS_TOKEN. Please add it to your .env file.", 401, null, null, false);
    }

    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages`;
        const payload = {
            recipient: {
                comment_id: commentId
            },
            message: {
                text: messageText
            }
        };

        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${PAGE_ACCESS_TOKEN}`
            }
        });

        console.log(`Successfully sent reply to comment ${commentId}`);
        return response.data;
    } catch (error) {
        const parsed = parseMetaError(error);
        console.error('Error sending private reply:', parsed.message);
        throw parsed;
    }
}

async function getRecentPosts() {
    if (!PAGE_ACCESS_TOKEN) return [];
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/media`;
        const response = await axios.get(url, {
            params: {
                fields: 'id,caption,media_url,media_type,timestamp,permalink,thumbnail_url,like_count,comments_count',
                access_token: PAGE_ACCESS_TOKEN,
                limit: 25
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching recent posts:', error.response ? error.response.data : error.message);
        return [];
    }
}

async function getPaginatedPosts(afterCursor) {
    if (!PAGE_ACCESS_TOKEN) return { data: [], paging: {} };
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/media`;
        const params = {
            fields: 'id,caption,media_url,media_type,timestamp,permalink,thumbnail_url,like_count,comments_count',
            access_token: PAGE_ACCESS_TOKEN,
            limit: 25
        };
        if (afterCursor) {
            params.after = afterCursor;
        }
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching paginated posts:', error.response ? error.response.data : error.message);
        return { data: [], paging: {} };
    }
}

async function sendPrivateReplyWithButton(commentId, messageText, buttonText, ruleId) {
    if (!PAGE_ACCESS_TOKEN) {
        throw new MetaApiError("Missing PAGE_ACCESS_TOKEN.", 401, null, null, false);
    }
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages`;
        const payload = {
            recipient: { comment_id: commentId },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: messageText,
                        buttons: [
                            {
                                type: "postback",
                                title: buttonText,
                                payload: `RULE_${ruleId}`
                            }
                        ]
                    }
                }
            }
        };
        const response = await axios.post(url, payload, { headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` } });
        console.log(`Successfully sent opening DM with button to comment ${commentId}`);
        return response.data;
    } catch (error) {
        const parsed = parseMetaError(error);
        console.error('Error sending private reply with button:', parsed.message);
        throw parsed;
    }
}

async function sendButtonTemplate(recipientId, messageText, buttonText, payloadString) {
    if (!PAGE_ACCESS_TOKEN) {
        throw new MetaApiError("Missing PAGE_ACCESS_TOKEN.", 401, null, null, false);
    }
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages`;
        const payload = {
            recipient: { id: recipientId },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: messageText,
                        buttons: [
                            {
                                type: "postback",
                                title: buttonText,
                                payload: payloadString
                            }
                        ]
                    }
                }
            }
        };
        const response = await axios.post(url, payload, { headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` } });
        console.log(`Successfully sent button template to ${recipientId}`);
        return response.data;
    } catch (error) {
        const parsed = parseMetaError(error);
        console.error('Error sending button template:', parsed.message);
        throw parsed;
    }
}

async function sendMessage(recipientId, messageText) {
    if (!PAGE_ACCESS_TOKEN) {
        throw new MetaApiError("Missing PAGE_ACCESS_TOKEN.", 401, null, null, false);
    }
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages`;
        const payload = {
            recipient: { id: recipientId },
            message: { text: messageText }
        };
        const response = await axios.post(url, payload, { headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` } });
        console.log(`Successfully sent message to ${recipientId}`);
        return response.data;
    } catch (error) {
        const parsed = parseMetaError(error);
        console.error('Error sending message:', parsed.message);
        throw parsed;
    }
}

async function checkFollowStatus(instagramScopedUserId) {
    if (!PAGE_ACCESS_TOKEN) return false;
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/${instagramScopedUserId}`;
        const response = await axios.get(url, {
            params: {
                fields: 'is_user_follow_business',
                access_token: PAGE_ACCESS_TOKEN
            }
        });
        console.log(`Follow status for ${instagramScopedUserId}:`, response.data);
        return response.data.is_user_follow_business === true;
    } catch (error) {
        console.error('Error checking follow status:', error.response ? error.response.data : error.message);
        return false;
    }
}

async function sendUrlButtonTemplate(recipientId, messageText, buttonText, urlString) {
    if (!PAGE_ACCESS_TOKEN) {
        throw new MetaApiError("Missing PAGE_ACCESS_TOKEN.", 401, null, null, false);
    }
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages`;
        const payload = {
            recipient: { id: recipientId },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: messageText,
                        buttons: [
                            {
                                type: "web_url",
                                title: buttonText,
                                url: urlString
                            }
                        ]
                    }
                }
            }
        };
        const response = await axios.post(url, payload, { headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` } });
        console.log(`Successfully sent url button template to ${recipientId}`);
        return response.data;
    } catch (error) {
        const parsed = parseMetaError(error);
        console.error('Error sending url button template:', parsed.message);
        throw parsed;
    }
}

async function replyToComment(commentId, messageText) {
    if (!PAGE_ACCESS_TOKEN) return;
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/${commentId}/replies`;
        const payload = {
            message: messageText,
            access_token: PAGE_ACCESS_TOKEN
        };
        const response = await axios.post(url, payload);
        console.log(`Successfully publicly replied to comment ${commentId}`);
        return response.data;
    } catch (error) {
        console.error('Error replying to comment:', error.response ? error.response.data : error.message);
    }
}

async function getUserProfile() {
    if (!PAGE_ACCESS_TOKEN) return null;
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me`;
        const response = await axios.get(url, {
            params: {
                fields: 'id,username,followers_count,media_count,profile_picture_url',
                access_token: PAGE_ACCESS_TOKEN
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function setIceBreakers(iceBreakersList) {
    if (!PAGE_ACCESS_TOKEN) return;
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messenger_profile`;
        const payload = {
            ice_breakers: iceBreakersList
        };
        const response = await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` }
        });
        console.log(`Successfully updated Ice Breakers`, response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting ice breakers:', error.response ? error.response.data : error.message);
    }
}

async function getInsights(igUserId) {
    if (!PAGE_ACCESS_TOKEN || !igUserId) return null;
    try {
        const insightsUrl = `https://graph.instagram.com/${GRAPH_API_VERSION}/${igUserId}/insights`;
        const until = Math.floor(Date.now() / 1000);
        const since = until - (30 * 24 * 60 * 60);
        
        const reachRes = await axios.get(insightsUrl, {
            params: {
                metric: 'reach,profile_views',
                period: 'day',
                since,
                until,
                access_token: PAGE_ACCESS_TOKEN
            }
        });
        
        const followerRes = await axios.get(insightsUrl, {
            params: {
                metric: 'follower_count',
                period: 'day',
                since,
                until,
                access_token: PAGE_ACCESS_TOKEN
            }
        });
        
        return {
            reach: reachRes.data.data[0]?.values || [],
            followers: followerRes.data.data[0]?.values || []
        };
    } catch (error) {
        console.error('Error fetching insights:', error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = { MetaApiError, sendPrivateReply, sendPrivateReplyWithButton, sendButtonTemplate, sendUrlButtonTemplate, sendMessage, getRecentPosts, getPaginatedPosts, checkFollowStatus, replyToComment, getUserProfile, setIceBreakers, getInsights };
