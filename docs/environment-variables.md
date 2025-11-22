# Environment Variables

This document describes all environment variables required to run OpenChat.

## Required Variables

### AI Provider API Keys

**Description**: API keys for each AI provider you want to use. Add only the providers you need.

#### `OPENAI_API_KEY` (Recommended)

Required for GPT models and DALL-E image generation.

**How to get it**:
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key

**Example**:
```bash
OPENAI_API_KEY=sk-proj-abc123def456...
```

#### `ANTHROPIC_API_KEY` (Optional)

Required for Claude models (Sonnet, Opus, etc.).

**How to get it**:
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Navigate to API Keys
3. Create a new API key

**Example**:
```bash
ANTHROPIC_API_KEY=sk-ant-abc123def456...
```

#### `GOOGLE_GENERATIVE_AI_API_KEY` (Optional)

Required for Gemini models.

**How to get it**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key

**Example**:
```bash
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

---

### `CONVEX_DEPLOYMENT`

**Description**: Your Convex deployment URL.

**How to get it**:
1. Run `bunx convex dev` in your project
2. Copy the deployment URL from the output
3. Or find it in your [Convex Dashboard](https://dashboard.convex.dev)

**Example**:
```bash
CONVEX_DEPLOYMENT=https://happy-animal-123.convex.cloud
```

---

### `NEXT_PUBLIC_CONVEX_URL`

**Description**: Public Convex URL for client-side access (must start with `NEXT_PUBLIC_`).

**How to get it**:
Same as `CONVEX_DEPLOYMENT` - use the same URL.

**Example**:
```bash
NEXT_PUBLIC_CONVEX_URL=https://happy-animal-123.convex.cloud
```

**Note**: This variable is exposed to the browser, so it's safe to prefix with `NEXT_PUBLIC_`.

---

## Optional Variables

### `TAVILY_API_KEY`

**Description**: API key for Tavily web search service (required for web search tool).

**How to get it**:
1. Sign up at [Tavily](https://tavily.com)
2. Generate an API key from your dashboard

**Example**:
```bash
TAVILY_API_KEY=tvly_abc123def456...
```

**What happens without it?**
The web search tool will return an error. Image generation and regular chat will still work.

---

## Setup Instructions

### 1. Create `.env.local` file

```bash
cp .env.example .env.local
```

### 2. Fill in the values

```bash
# Required
AI_GATEWAY_API_KEY=your_key_here
CONVEX_DEPLOYMENT=your_convex_url
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Optional
TAVILY_API_KEY=your_tavily_key
```

### 3. Verify Configuration

```bash
# Check if Convex can access the variables
bunx convex env ls

# For local development, they should be in .env.local
# For production, set them in Convex dashboard
```

---

## Production Deployment

### Vercel (Frontend)

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_CONVEX_URL`

### Convex (Backend)

1. Go to your [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `AI_GATEWAY_API_KEY`
   - `TAVILY_API_KEY` (optional)

**Command Line Method:**
```bash
bunx convex env set AI_GATEWAY_API_KEY vgw_abc123...
bunx convex env set TAVILY_API_KEY tvly_abc123...
```

---

## Environment Variable Best Practices

### ✅ Do:
- Use `.env.local` for local development
- Add `.env.local` to `.gitignore`
- Use Vercel/Convex dashboards for production secrets
- Rotate keys periodically for security

### ❌ Don't:
- Commit `.env.local` to git
- Share API keys in public repositories
- Hardcode keys in your code
- Use production keys in development

---

## Troubleshooting

### "AI_GATEWAY_API_KEY not configured"

**Problem**: The key is missing or not loaded correctly.

**Solution**:
```bash
# Check if it exists
echo $AI_GATEWAY_API_KEY

# Verify .env.local file exists
ls -la .env.local

# Restart dev server
bun dev
```

### "CONVEX_DEPLOYMENT is required"

**Problem**: Convex isn't configured.

**Solution**:
```bash
# Initialize Convex
bunx convex dev

# This will generate the deployment URL and add it to .env.local
```

### "Tavily API key not configured" (but web search still needed)

**Problem**: Web search tool requires Tavily API key.

**Solution**:
1. Get a key from [Tavily](https://tavily.com)
2. Add to `.env.local`:
   ```bash
   TAVILY_API_KEY=your_key_here
   ```
3. Restart server

### Environment variables not updating

**Problem**: Changes to `.env.local` not reflected.

**Solution**:
```bash
# Stop all dev servers
# Ctrl+C to kill processes

# Restart Convex
bunx convex dev

# In another terminal, restart Next.js
bun dev
```

---

## Security Notes

### AI Gateway API Key

- **What it can do**: Access all AI models via Vercel's gateway, track usage
- **Where it's used**: Backend only (Convex actions)
- **Never exposed to**: Browser/client-side
- **Rotate**: Every 90 days recommended

### Tavily API Key

- **What it can do**: Search the web, get current information
- **Where it's used**: Backend only (Convex actions)
- **Never exposed to**: Browser/client-side
- **Rate limits**: Check Tavily plan limits

### Convex URLs

- **Public**: `NEXT_PUBLIC_CONVEX_URL` is safe to expose
- **Private**: `CONVEX_DEPLOYMENT` should stay server-side (though same value)
- **Security**: Convex has built-in authentication and CORS protection

---

## Example `.env.local` File

```bash
# Vercel AI Gateway - REQUIRED
# Get from: https://vercel.com/dashboard → Your Project → AI
AI_GATEWAY_API_KEY=vgw_1234567890abcdef

# Convex - REQUIRED
# Get from: bunx convex dev (auto-generated)
CONVEX_DEPLOYMENT=https://happy-animal-123.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://happy-animal-123.convex.cloud

# Tavily - OPTIONAL (for web search)
# Get from: https://tavily.com/dashboard
TAVILY_API_KEY=tvly_9876543210fedcba
```

---

## Next Steps

- Read [Convex Setup](./convex-setup.md) to initialize your backend
- Read [AI Gateway Integration](./ai-gateway-integration.md) to understand how the gateway works
- Read [Deployment](./deployment.md) for production deployment
