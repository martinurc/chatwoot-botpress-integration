# Chatwoot ↔ Botpress Integration Middleware

Bridge your self-hosted Chatwoot instance with Botpress Cloud using webhooks and API calls.

## Architecture

```
Chatwoot (receives message) 
    ↓ (webhook POST)
Middleware Server (this)
    ↓ (API call)
Botpress Cloud / AI Agent
    ↓ (response)
Middleware Server
    ↓ (API call)
Chatwoot (sends reply back)
```

## Prerequisites

- Self-hosted Chatwoot instance running
- Botpress Cloud account with a deployed bot
- Node.js 18+ or Docker
- Public URL for webhook access

## Installation

### Option 1: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/martinurc/chatwoot-botpress-integration.git
   cd chatwoot-botpress-integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Option 2: Docker

1. Create `.env` file with your configuration

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Chatwoot API endpoint
CHATWOOT_API_URL=https://your-chatwoot-domain.com/api/v1

# Get from Chatwoot: Settings → API → Access Tokens
CHATWOOT_API_TOKEN=your_api_token

# Get from Chatwoot: Settings → Integrations → Webhooks
CHATWOOT_WEBHOOK_SECRET=your_webhook_secret

# Botpress Cloud credentials
BOTPRESS_BOT_ID=your_bot_id
BOTPRESS_API_TOKEN=your_api_token

# Server port
PORT=3001
```

## Setup Instructions

### 1. Create Chatwoot API Token

1. Go to your Chatwoot instance
2. Navigate to **Settings → API → Access Tokens**
3. Create new token with permissions:
   - `conversation_list`
   - `conversation_read`
   - `messages_write`
4. Copy the token to `.env` as `CHATWOOT_API_TOKEN`

### 2. Create Chatwoot Webhook

1. Go to **Settings → Integrations → Webhooks**
2. Click **Add New Webhook**
3. **Events:** Select `message_created`
4. **Target URL:** `https://your-middleware-url.com/chatwoot-webhook`
5. Copy the signing key to `.env` as `CHATWOOT_WEBHOOK_SECRET`
6. Save webhook

### 3. Get Botpress Credentials

1. Go to Botpress Cloud console
2. Select your bot
3. Go to **Integrations → API**
4. Get your Bot ID and API Token
5. Add to `.env`

### 4. Deploy Middleware

- **Local:** `npm start`
- **Docker:** `docker-compose up -d`
- **Cloud:** Deploy to Heroku, Railway, AWS, etc.

## Testing

1. Send a message in your Chatwoot inbox
2. Check logs for:
   ```
   [Chatwoot] New message from User: ...
   [Botpress] Response: ...
   [Chatwoot] Message sent to conversation ...
   ```
3. Response should appear in Chatwoot conversation

## Health Check

Check if middleware is running:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok"}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not triggering | Check Chatwoot webhook logs; verify URL is publicly accessible |
| Botpress API 401 | Verify `BOTPRESS_API_TOKEN` is correct and bot is deployed |
| Chatwoot API 401 | Verify `CHATWOOT_API_TOKEN` has required permissions |
| No response from Botpress | Check Botpress bot status and logs |
| Messages not in Chatwoot | Verify API token has `messages_write` permission |

## Logs

### Local
```bash
npm start
```

### Docker
```bash
docker-compose logs -f middleware
```

## Advanced Configuration

### Custom Botpress API URL

If using self-hosted Botpress, set:
```env
BOTPRESS_API_URL=https://your-botpress-instance.com/api/v1
```

### Webhook Validation

The middleware validates webhook signatures using HMAC-SHA256. This is optional but recommended for security.

## Future Enhancements

- [ ] Conversation context history
- [ ] Support for multiple AI providers
- [ ] Rich message formatting
- [ ] File upload handling
- [ ] Custom field mapping
- [ ] Rate limiting
- [ ] Message queue system

## License

MIT

## Support

For issues and questions, open an issue on GitHub.
