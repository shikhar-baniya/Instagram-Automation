require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.PAGE_ACCESS_TOKEN;
const API = 'https://graph.instagram.com/v25.0';

async function subscribeApp() {
    try {
        console.log("Fetching account details...");
        const meRes = await axios.get(`${API}/me?access_token=${TOKEN}`);
        const igUserId = meRes.data.id;
        console.log(`Found Instagram User ID: ${igUserId}`);

        console.log("Subscribing app to webhooks for this user...");
        const subRes = await axios.post(`${API}/${igUserId}/subscribed_apps?subscribed_fields=comments,messages&access_token=${TOKEN}`);
        console.log("Subscription Response:", subRes.data);

        console.log("Checking active subscriptions...");
        const checkRes = await axios.get(`${API}/${igUserId}/subscribed_apps?access_token=${TOKEN}`);
        console.log("Currently subscribed apps:", checkRes.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

subscribeApp();
