# Vercel AI Gateway Integration

## Overview

Vercel AI Gateway is a unified API that provides access to **100+ AI models** from multiple providers (OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, and more) through a single endpoint and API key.

## Why AI Gateway?

### Traditional Approach (BYOK - Bring Your Own Key) ❌

```typescript
// Need separate keys and SDKs for each provider
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Different APIs for each provider
const gptResponse = await openai.chat.completions.create({...});
const claudeResponse = await anthropic.messages.create({...});
const geminiResponse = await google.generateContent({...});
```

**Problems**:
- ❌ Manage multiple API keys
- ❌ Learn different APIs for each provider
- ❌ No automatic failover
- ❌ Complex error handling
- ❌ Separate billing/tracking for each

### AI Gateway Approach ✅

```typescript
import { createGateway } from 'ai';

// Single gateway instance with one API key
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,  // Only 1 key needed!
  baseURL: 'https://ai-gateway.vercel.sh/v1/ai',
});

// Same API for all providers
const gptResponse = await gateway('openai/gpt-4o').generateText({...});
const claudeResponse = await gateway('anthropic/claude-sonnet-4-5').generateText({...});
const geminiResponse = await gateway('google/gemini-2.0-flash').generateText({...});
```

**Benefits**:
- ✅ One API key for all providers
- ✅ Unified API (OpenAI-compatible)
- ✅ Automatic failover
- ✅ Smart routing
- ✅ Centralized observability

---

## How It Works

```
Your App → AI Gateway → Provider
           ↓
      [Routing, Failover, Caching]
           ↓
      [Usage Tracking]
           ↓
      [Cost Attribution]
```

### 1. Request Flow

```typescript
// Your code
const result = await gateway('openai/gpt-4o').generateText({
  prompt: "Hello world",
});
```

**What happens**:
1. Request sent to `https://ai-gateway.vercel.sh/v1/ai`
2. Gateway authenticates using `AI_GATEWAY_API_KEY`
3. Gateway routes to OpenAI with optimal endpoint
4. Response transformed to unified format
5. Usage tracked in Vercel dashboard
6. Response returned to your app

### 2. Model Format

All models follow the pattern: `provider/model-name`

```typescript
"openai/gpt-4o"                  // OpenAI GPT-4o
"openai/gpt-4o-mini"             // OpenAI GPT-4o mini
"openai/gpt-5"                   // OpenAI GPT-5
"anthropic/claude-sonnet-4-5"    // Anthropic Claude Sonnet 4.5
"google/gemini-2.0-flash"        // Google Gemini 2.0 Flash
"deepseek/deepseek-chat"         // DeepSeek V3
"xai/grok-4"                     // xAI Grok-4
"meta/llama-3.3-70b-instruct"    // Meta Llama 3.3
```

---

## Key Features

### 1. Automatic Failover

If one provider is down, Gateway automatically tries another:

```typescript
const result = await gateway('anthropic/claude-sonnet-4-5').generateText({
  prompt: "Explain quantum computing",
  providerOptions: {
    gateway: {
      order: ['anthropic', 'openai'],  // Try Anthropic first, fallback to OpenAI
    }
  }
});
```

**What happens**:
- If Anthropic is down → automatically tries OpenAI GPT-4o
- User sees no error
- Logged in Gateway dashboard

### 2. Smart Routing

Gateway routes requests based on:
- **Latency**: Chooses fastest provider
- **Cost**: Optimizes for your budget
- **Availability**: Avoids rate-limited providers
- **Geography**: Routes to nearest endpoint

```typescript
// Gateway automatically chooses optimal provider
const result = await gateway('openai/gpt-4o').generateText({...});
// Latency: ~15-20ms (Gateway overhead)
```

### 3. Usage Tracking & Observability

All requests logged in Vercel dashboard:

```typescript
// Check credits balance
const credits = await gateway.getCredits();
console.log(`Balance: ${credits.balance} credits`);
console.log(`Total used: ${credits.total_used} credits`);
```

**Dashboard shows**:
- Requests per model
- Token usage
- Cost per request
- Error rates
- Latency percentiles

### 4. Provider-Specific Options

```typescript
const result = await gateway('anthropic/claude-sonnet-4-5').generateText({
  prompt: "Solve this problem",
  providerOptions: {
    gateway: {
      user: 'user-123',           // Track per-user usage
      tags: ['math', 'homework'], // Tag for analytics
    },
    anthropic: {
      thinking: {                 // Claude-specific thinking mode
        type: 'enabled',
        budgetTokens: 5000,
      }
    }
  }
});
```

---

## Integration with Convex Agents

### Setup

```typescript
// convex/agents/chatAgent.ts
import { createGateway } from 'ai';
import { Agent } from '@convex-dev/agent';

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY!,
  baseURL: 'https://ai-gateway.vercel.sh/v1/ai',
});

const agent = new Agent(components.agent, {
  name: "OpenChat Assistant",
  languageModel: gateway('openai/gpt-4o-mini'),
  instructions: "You are a helpful assistant",
  tools: { webSearch, imageGeneration },
});
```

### Dynamic Model Switching

```typescript
// convex/agents/chatAgent.ts
export function createAgentWithModel(modelId: string) {
  return new Agent(components.agent, {
    name: "OpenChat Assistant",
    languageModel: gateway(modelId),  // Switch models dynamically!
    instructions: "...",
    tools: { webSearch, imageGeneration },
  });
}

// convex/chat.ts
export const sendMessage = action({
  args: { threadId: v.id("threads"), message: v.string(), modelId: v.string() },
  handler: async (ctx, { threadId, message, modelId }) => {
    const agent = createAgentWithModel(modelId);  // Create agent with selected model
    const result = await agent.generateText(ctx, { threadId }, { prompt: message });
    return result;
  },
});
```

---

## Available Models via Gateway

Use `gateway.getAvailableModels()` to fetch current list:

```typescript
const models = await gateway.getAvailableModels();

models.models.forEach(model => {
  console.log(`${model.id}: ${model.name}`);
  if (model.pricing) {
    console.log(`  Input: $${model.pricing.input}/token`);
    console.log(`  Output: $${model.pricing.output}/token`);
  }
});
```

**Example output**:
```
openai/gpt-4o: GPT-4o
  Input: $0.000005/token
  Output: $0.000015/token

anthropic/claude-sonnet-4-5: Claude Sonnet 4.5
  Input: $0.000003/token
  Output: $0.000015/token

google/gemini-2.0-flash: Gemini 2.0 Flash
  Input: $0.000001/token
  Output: $0.000003/token
```

---

## Cost Management

### 1. Monitor Credits

```typescript
// convex/models.ts
export const getCredits = action({
  handler: async () => {
    const gateway = createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY!,
      baseURL: 'https://ai-gateway.vercel.sh/v1/ai',
    });

    const credits = await gateway.getCredits();

    return {
      balance: credits.balance,
      totalUsed: credits.total_used,
    };
  },
});
```

### 2. Track Usage per User

```typescript
// In convex/schema.ts
usage: defineTable({
  userId: v.string(),
  modelId: v.string(),
  inputTokens: v.number(),
  outputTokens: v.number(),
  totalTokens: v.number(),
  cost: v.number(),  // Calculate from pricing
  timestamp: v.number(),
})
```

### 3. Set Budget Alerts

In Vercel AI Gateway dashboard:
- Set monthly spending limits
- Get email alerts at 50%, 75%, 90%
- Auto-disable at 100% (optional)

---

## Error Handling

```typescript
try {
  const result = await gateway('openai/gpt-4o').generateText({
    prompt: "Hello",
  });
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Provider rate limit → try different provider
    const result = await gateway('anthropic/claude-sonnet-4-5').generateText({
      prompt: "Hello",
    });
  } else if (error.message.includes('insufficient credits')) {
    // Out of Gateway credits
    console.error('Please add more credits to AI Gateway');
  } else {
    // Other error
    console.error('AI Gateway error:', error);
  }
}
```

---

## Best Practices

### ✅ Do:

1. **Use failover**: Always specify backup providers
   ```typescript
   providerOptions: {
     gateway: { order: ['anthropic', 'openai', 'google'] }
   }
   ```

2. **Tag requests**: For better analytics
   ```typescript
   providerOptions: {
     gateway: { tags: ['chat', 'user-query'] }
   }
   ```

3. **Monitor usage**: Check credits regularly
   ```typescript
   const credits = await gateway.getCredits();
   ```

4. **Track per-user**: Attribute costs correctly
   ```typescript
   providerOptions: {
     gateway: { user: userId }
   }
   ```

### ❌ Don't:

1. **Don't hardcode models**: Use dynamic selection
   ```typescript
   // Bad
   const model = 'openai/gpt-4o';

   // Good
   const model = userSelectedModel || defaultModel;
   ```

2. **Don't ignore errors**: Handle gracefully
   ```typescript
   // Bad
   await gateway(model).generateText({...});

   // Good
   try {
     await gateway(model).generateText({...});
   } catch (error) {
     // Handle error
   }
   ```

3. **Don't skip usage tracking**: Always log token usage

---

## Troubleshooting

### "AI Gateway authentication failed"

**Problem**: Invalid or missing API key

**Solution**:
```bash
# Check key exists
echo $AI_GATEWAY_API_KEY

# Regenerate in Vercel dashboard if needed
# Update .env.local or Convex environment
```

### "Rate limit exceeded"

**Problem**: Hit provider's rate limit

**Solution**:
```typescript
// Use failover
providerOptions: {
  gateway: { order: ['anthropic', 'openai'] }
}
```

### "Insufficient credits"

**Problem**: Ran out of AI Gateway credits

**Solution**:
1. Add credits in Vercel dashboard
2. Set up auto-recharge
3. Monitor usage proactively

---

## Next Steps

- Read [Models](./models.md) to understand which model to use when
- Read [Agents and Tools](./agents-and-tools.md) to customize your agent
- Check [Vercel AI Gateway Docs](https://vercel.com/docs/ai-gateway) for latest features
