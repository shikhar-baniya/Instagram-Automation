const axios = require('axios');

// Simulate a comment webhook payload from Meta
const payload = {
    object: 'instagram',
    entry: [
        {
            time: Date.now(),
            id: '1234567890', // Your page/account ID
            changes: [
                {
                    field: 'comments',
                    value: {
                        id: 'fake_comment_id_123',
                        text: 'LINK', // Change this text to test different rules!
                        from: {
                            id: 'fake_user_id',
                            username: 'test_user'
                        }
                    }
                }
            ]
        }
    ]
};

async function testWebhook() {
    try {
        console.log(`Sending simulated comment: "${payload.entry[0].changes[0].value.text}"`);
        const response = await axios.post('http://localhost:3001/api/webhook', payload);
        console.log('Server responded with:', response.data);
    } catch (error) {
        console.error('Error sending test webhook:', error.message);
    }
}

testWebhook();
