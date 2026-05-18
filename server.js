const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Environment Variables
const CHATWOOT_API_URL = process.env.CHATWOOT_API_URL;
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN;
const BOTPRESS_BOT_ID = process.env.BOTPRESS_BOT_ID;
const BOTPRESS_API_TOKEN = process.env.BOTPRESS_API_TOKEN;
const BOTPRESS_API_URL = process.env.BOTPRESS_API_URL || 'https://api.botpress.cloud/v1';
const WEBHOOK_SECRET = process.env.CHATWOOT_WEBHOOK_SECRET;

// Verify Chatwoot Webhook Signature (optional but recommended)
function verifyWebhookSignature(req) {
  const crypto = require('crypto');
  const signature = req.headers['x-chatwoot-webhook-signature'];
  
  if (!signature || !WEBHOOK_SECRET) return true; // Skip if no secret configured
  
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  return hash === signature;
}

// Chatwoot Webhook Endpoint
app.post('/chatwoot-webhook', async (req, res) => {
  try {
    // Verify signature
    if (!verifyWebhookSignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const data = req.body.data;

    // Only process incoming messages (not bot's own responses)
    if (event !== 'message_created' || data.message_type !== 'incoming') {
      return res.status(200).json({ status: 'ignored' });
    }

    const conversationId = data.conversation_id;
    const messageContent = data.content;
    const contactName = data.sender?.name || 'User';
    const contactId = data.sender?.id;

    console.log(`[Chatwoot] New message from ${contactName}: ${messageContent}`);

    // Get conversation context (optional, for better context)
    const conversationData = await getConversationContext(conversationId);

    // Send to Botpress Cloud
    const botpressResponse = await sendToBotpress(messageContent, contactId);

    // Send Botpress response back to Chatwoot
    await sendToChatwoot(conversationId, botpressResponse);

    res.status(200).json({ status: 'processed' });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Send message to Botpress Cloud
async function sendToBotpress(userMessage, userId) {
  try {
    const payload = {
      messages: [
        {
          type: 'text',
          text: userMessage,
        },
      ],
    };

    const response = await axios.post(
      `${BOTPRESS_API_URL}/bots/${BOTPRESS_BOT_ID}/converse/${userId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${BOTPRESS_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract bot's text response
    const botResponses = response.data.responses || [];
    const textResponse = botResponses
      .filter((r) => r.type === 'text')
      .map((r) => r.text)
      .join('\n');

    console.log(`[Botpress] Response: ${textResponse}`);
    return textResponse || 'I did not understand that.';
  } catch (error) {
    console.error('Botpress API Error:', error.response?.data || error.message);
    return 'Sorry, I encountered an error processing your request.';
  }
}

// Send response back to Chatwoot
async function sendToChatwoot(conversationId, messageContent) {
  try {
    await axios.post(
      `${CHATWOOT_API_URL}/conversations/${conversationId}/messages`,
      {
        content: messageContent,
        message_type: 'outgoing',
        private: false,
      },
      {
        headers: {
          'api_access_token': CHATWOOT_API_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[Chatwoot] Message sent to conversation ${conversationId}`);
  } catch (error) {
    console.error('Chatwoot API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Get conversation context (optional)
async function getConversationContext(conversationId) {
  try {
    const response = await axios.get(
      `${CHATWOOT_API_URL}/conversations/${conversationId}`,
      {
        headers: {
          'api_access_token': CHATWOOT_API_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation context:', error.message);
    return null;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Middleware server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/chatwoot-webhook`);
});