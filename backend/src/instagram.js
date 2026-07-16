const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GRAPH_API_VERSION = 'v25.0'; 

async function sendPrivateReply(commentId, messageText) {
    if (!PAGE_ACCESS_TOKEN) {
        console.error("Missing PAGE_ACCESS_TOKEN. Please add it to your .env file.");
        return;
    }

    try {
        // Send a private reply to a specific comment using the Instagram Graph API
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
        console.error('Error sending private reply:', error.response ? error.response.data : error.message);
    }
}

async function getRecentPosts() {
    if (!PAGE_ACCESS_TOKEN) return [];
    
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/media`;
        const response = await axios.get(url, {
            params: {
                fields: 'id,caption,media_url,media_type,timestamp,permalink,thumbnail_url,like_count,comments_count',
                access_token: PAGE_ACCESS_TOKEN
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching recent posts:', error.response ? error.response.data : error.message);
        return [];
    }
}

async function sendPrivateReplyWithButton(commentId, messageText, buttonText, ruleId) {
    if (!PAGE_ACCESS_TOKEN) return;
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
        await axios.post(url, payload, { headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` } });
        console.log(`Successfully sent opening DM with button to comment ${commentId}`);
    } catch (error) {
        console.error('Error sending private reply with button:', error.response ? error.response.data : error.message);
    }
}

async function sendButtonTemplate(recipientId, messageText, buttonText, payloadString) {
    if (!PAGE_ACCESS_TOKEN) return;
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
        await axios.post(url, payload, { headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` } });
        console.log(`Successfully sent button template to ${recipientId}`);
    } catch (error) {
        console.error('Error sending button template:', error.response ? error.response.data : error.message);
    }
}

async function sendMessage(recipientId, messageText) {
    if (!PAGE_ACCESS_TOKEN) return;
    try {
        const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me/messages`;
        const payload = {
            recipient: { id: recipientId },
            message: { text: messageText }
        };
        await axios.post(url, payload, { headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` } });
        console.log(`Successfully sent message to ${recipientId}`);
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
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
    if (!PAGE_ACCESS_TOKEN) return;
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
        await axios.post(url, payload, { headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` } });
        console.log(`Successfully sent url button template to ${recipientId}`);
    } catch (error) {
        console.error('Error sending url button template:', error.response ? error.response.data : error.message);
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
        await axios.post(url, payload);
        console.log(`Successfully publicly replied to comment ${commentId}`);
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

module.exports = { sendPrivateReply, sendPrivateReplyWithButton, sendButtonTemplate, sendUrlButtonTemplate, sendMessage, getRecentPosts, checkFollowStatus, replyToComment, getUserProfile };
