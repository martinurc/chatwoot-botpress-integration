# Chatwoot-Botpress Integration Middleware

A Node.js/Express middleware that bridges self-hosted Chatwoot with Botpress Cloud using webhooks.

## Architecture

```
Chatwoot (receives message) 
    ↓ (webhook POST)
Your Middleware Server
    ↓ (API call)
Botpress Cloud / Your AI Agent
    ↓ (response)
Your Middleware Server
    ↓ (API call)
Chatwoot (sends reply back)
```

## Features

✅ Automatic message forwarding from Chatwoot to Botpress  
✅ Bot responses automatically posted back to Chatwoot  
✅ Webhook signature validation for security  
✅ Error handling and logging  
✅ Docker support  
✅ Health check endpoint  

## Prerequisites

- **Self-hosted Chatwoot** instance with working URL and API access
- **Botpress Cloud** account with a deployed bot
- **Node.js 18+** (for local development)
- **Docker** (optional, for containerized deployment)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/martinurc/chatwoot-botpress-integration.git
cd chatwoot-botpress-integration
```

### 2. Get Your Credentials

#### Chatwoot

1. Go to your Chatwoot admin panel
2. Navigate to **Settings → API → Access Tokens**
3. Create a new token with permissions:
   - `conversation_list`
   - `conversation_read`
   - `messages_write`
4. Copy the token
5. Go to **Settings → Integrations → Webhooks**
6. Note the webhook signing key (if available)

#### Botpress Cloud

1. Go to https://app.botpress.cloud
2. Select your bot
3. Go to **Integrations → API**
4. Create an API token
5. Copy your **Bot ID** and **API Token**

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Chatwoot Configuration
CHATWOOT_API_URL=https://your-chatwoot-domain.com/api/v1
CHATWOOT_API_TOKEN=your_api_token_here
CHATWOOT_WEBHOOK_SECRET=your_webhook_secret_here

# Botpress Configuration
BOTPRESS_BOT_ID=your_bot_id
BOTPRESS_API_TOKEN=your_api_token
BOTPRESS_API_URL=https://api.botpress.cloud/v1

# Server Configuration
PORT=3001
NODE_ENV=production
```

## Deployment

### Option 1: Local Development

```bash
npm install
npm start
```

Server will run on `http://localhost:3001`

### Option 2: Docker

```bash
docker-compose up -d
```

### Option 3: Cloud Deployment (Heroku, Railway, etc.)

1. Push to GitHub
2. Connect your GitHub repo to your cloud platform
3. Set environment variables in the dashboard
4. Deploy

## Configure Chatwoot Webhook

1. In your Chatwoot admin panel
2. Go to **Settings → Integrations → Webhooks**
3. Click **Add New Webhook**
4. Set:
   - **Events to Subscribe:** `message_created`
   - **Target URL:** `https://your-middleware-domain.com/chatwoot-webhook`
5. Save and test

## Testing

1. Send a message in your Chatwoot inbox
2. Check logs:
   ```bash
   # Local
   npm start
   
   # Docker
   docker-compose logs -f middleware
   ```
3. You should see:
   - Webhook received from Chatwoot
   - Message sent to Botpress
   - Response from Botpress
   - Message posted back to Chatwoot

## Health Check

```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status": "ok"}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not triggering | Check Chatwoot admin webhook status; verify URL is reachable |
| Botpress API 401 error | Verify `BOTPRESS_API_TOKEN` is correct and bot is deployed |
| Chatwoot API 401 error | Verify `CHATWOOT_API_TOKEN` has correct permissions |
| No response from Botpress | Check if Botpress bot is deployed and conversations are enabled |
| Messages not in Chatwoot | Verify webhook secret matches and `message_type: 'outgoing'` is set |
| Connection refused | Check if middleware is running and ports are correct |

## Logs

The middleware logs all interactions for debugging:

```
[Chatwoot] New message from John: Hello
[Botpress] Response: Hi there! How can I help?
[Chatwoot] Message sent to conversation 123
```

## Security Considerations

- ✅ Webhook signature validation enabled
- ✅ API tokens stored in `.env` (never commit)
- ✅ Error messages don't expose sensitive data
- ⚠️ Use HTTPS in production
- ⚠️ Restrict webhook endpoint to Chatwoot IP if possible

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Open an issue on GitHub
