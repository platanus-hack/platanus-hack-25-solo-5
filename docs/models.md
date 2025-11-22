# AI Models Guide

This document describes the available AI models in OpenChat and when to use each one.

## Available Models

| Model ID | Name | Provider | Best For | Speed | Cost |
|----------|------|----------|----------|-------|------|
| `openai/gpt-4o-mini` | GPT-4o mini | OpenAI | General tasks, fast responses | ⚡⚡⚡ | 💰 |
| `openai/gpt-4o` | GPT-4o | OpenAI | Complex tasks, coding, analysis | ⚡⚡ | 💰💰 |
| `openai/gpt-5` | GPT-5 | OpenAI | Most advanced tasks | ⚡ | 💰💰💰 |
| `anthropic/claude-sonnet-4-5` | Claude Sonnet 4.5 | Anthropic | Reasoning, writing, analysis | ⚡⚡ | 💰💰 |
| `google/gemini-2.0-flash` | Gemini 2.0 Flash | Google | Fast multimodal tasks | ⚡⚡⚡ | 💰 |
| `deepseek/deepseek-chat` | DeepSeek V3 | DeepSeek | Coding, math, technical | ⚡⚡ | 💰 |

---

## Model Comparison

### OpenAI GPT-4o mini
```typescript
modelId: "openai/gpt-4o-mini"
```

**Strengths**:
- Fastest response times
- Most cost-effective
- Good for everyday tasks
- 128K context window

**Best for**:
- General chat
- Simple questions
- Quick responses
- High-volume usage

**Use when**:
- User needs fast answers
- Task doesn't require deep reasoning
- Budget is a concern
- High request volume

**Example prompts**:
- "What's the weather like?"
- "Summarize this text"
- "Translate to Spanish"
- "Write a short email"

---

### OpenAI GPT-4o
```typescript
modelId: "openai/gpt-4o"
```

**Strengths**:
- Most capable OpenAI model
- Excellent reasoning
- Strong coding abilities
- 128K context window
- Multimodal (vision + text)

**Best for**:
- Complex problem-solving
- Code generation
- Data analysis
- Long-form content

**Use when**:
- Task requires deep reasoning
- Need accurate code
- Working with images
- Quality over speed

**Example prompts**:
- "Debug this code and explain the fix"
- "Analyze this data and find patterns"
- "Write a comprehensive technical doc"
- "What's in this image?"

---

### OpenAI GPT-5
```typescript
modelId: "openai/gpt-5"
```

**Strengths**:
- Latest and most advanced
- State-of-the-art reasoning
- Best instruction following
- 128K+ context window

**Best for**:
- Cutting-edge tasks
- Highest quality output
- Complex multi-step problems

**Use when**:
- Need absolute best quality
- Other models aren't sufficient
- Budget allows premium pricing
- Task is mission-critical

**Example prompts**:
- "Design a complete system architecture"
- "Solve this complex math problem"
- "Write production-ready code"

---

### Anthropic Claude Sonnet 4.5
```typescript
modelId: "anthropic/claude-sonnet-4-5"
```

**Strengths**:
- Excellent reasoning abilities
- Strong writing skills
- Great at following instructions
- 200K context window
- Extended thinking mode

**Best for**:
- Analysis and reasoning
- Long-form writing
- Research tasks
- Ethical considerations

**Use when**:
- Need thoughtful analysis
- Writing quality matters
- Large context needed
- Prefer Anthropic's approach

**Example prompts**:
- "Analyze the pros and cons of this approach"
- "Write a research paper on X"
- "Think through this ethical dilemma"
- "Review this long document"

---

### Google Gemini 2.0 Flash
```typescript
modelId: "google/gemini-2.0-flash"
```

**Strengths**:
- Very fast responses
- Cost-effective
- Native multimodal (text, images, video)
- 1M context window

**Best for**:
- Multimodal tasks
- Fast responses
- Long context
- Google services integration

**Use when**:
- Working with images/video
- Need huge context window
- Speed is critical
- Cost optimization important

**Example prompts**:
- "Describe this video"
- "Analyze these charts"
- "Process this PDF"
- "Quick fact-checking"

---

### DeepSeek V3
```typescript
modelId: "deepseek/deepseek-chat"
```

**Strengths**:
- Excellent at coding
- Strong math abilities
- Very cost-effective
- Good reasoning

**Best for**:
- Programming tasks
- Mathematical problems
- Technical documentation
- Cost-sensitive coding

**Use when**:
- Coding assistance needed
- Math/logic problems
- Technical writing
- Budget is tight

**Example prompts**:
- "Write a sorting algorithm"
- "Solve this calculus problem"
- "Explain this code"
- "Debug this function"

---

## Model Selection Guide

### Decision Tree

```
Need coding help?
├─ Yes → DeepSeek V3 or GPT-4o
└─ No → Continue

Need multimodal (images/video)?
├─ Yes → Gemini 2.0 Flash or GPT-4o
└─ No → Continue

Need deep reasoning/analysis?
├─ Yes → Claude Sonnet 4.5 or GPT-5
└─ No → Continue

Need fast, cheap responses?
└─ Yes → GPT-4o mini or Gemini Flash
```

### By Use Case

**General Chat**: GPT-4o mini, Gemini Flash

**Coding**:
- Simple: DeepSeek V3
- Complex: GPT-4o
- Production: GPT-5

**Writing**:
- Quick: GPT-4o mini
- Quality: Claude Sonnet 4.5
- Best: GPT-5

**Analysis**:
- Data: GPT-4o
- Text: Claude Sonnet 4.5
- Images: Gemini Flash

**Research**:
- Quick facts: GPT-4o mini
- Deep dive: Claude Sonnet 4.5
- Cutting edge: GPT-5

---

## Cost Optimization

### Estimated Pricing (per 1M tokens)

| Model | Input | Output | Total (avg) |
|-------|-------|--------|-------------|
| GPT-4o mini | $0.15 | $0.60 | $0.38 |
| Gemini Flash | $0.08 | $0.30 | $0.19 |
| DeepSeek V3 | $0.14 | $0.28 | $0.21 |
| GPT-4o | $5.00 | $15.00 | $10.00 |
| Claude Sonnet 4.5 | $3.00 | $15.00 | $9.00 |
| GPT-5 | $10.00 | $30.00 | $20.00 |

*Note: Prices are approximate and may vary. Check AI Gateway dashboard for current pricing.*

### Saving Money

1. **Start with cheaper models**:
   ```typescript
   // Try GPT-4o mini first
   let result = await agent('openai/gpt-4o-mini').generateText({...});

   // Upgrade if needed
   if (result.quality < threshold) {
     result = await agent('openai/gpt-4o').generateText({...});
   }
   ```

2. **Use appropriate model for task**:
   - Simple questions → GPT-4o mini
   - Coding → DeepSeek V3
   - Analysis → Claude Sonnet 4.5

3. **Implement caching**:
   - Cache common responses
   - Reuse previous answers
   - Store tool results

4. **Set token limits**:
   ```typescript
   maxTokens: 500,  // Limit response length
   ```

---

## Performance Comparison

### Speed (Tokens per Second)

| Model | Approximate TPS |
|-------|----------------|
| Gemini Flash | ~100-150 |
| GPT-4o mini | ~80-120 |
| DeepSeek V3 | ~60-100 |
| GPT-4o | ~50-80 |
| Claude Sonnet 4.5 | ~40-70 |
| GPT-5 | ~30-60 |

*Note: Actual speed depends on request complexity, load, and network.*

### Context Window Sizes

| Model | Context Window |
|-------|---------------|
| Claude Sonnet 4.5 | 200,000 tokens |
| GPT-4o / GPT-5 | 128,000 tokens |
| GPT-4o mini | 128,000 tokens |
| DeepSeek V3 | 64,000 tokens |
| Gemini Flash | 1,000,000 tokens |

---

## Dynamic Model Selection

### In Code

```typescript
// convex/agents/chatAgent.ts
export function selectModelForTask(task: string): string {
  if (task.includes('code') || task.includes('programming')) {
    return 'deepseek/deepseek-chat';
  }

  if (task.includes('analyze') || task.includes('reasoning')) {
    return 'anthropic/claude-sonnet-4-5';
  }

  if (task.includes('image') || task.includes('video')) {
    return 'google/gemini-2.0-flash';
  }

  // Default to fast, cheap model
  return 'openai/gpt-4o-mini';
}
```

### In UI

```typescript
// components/main-chat.tsx
const modelDropdown = (
  <DropdownMenu>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => setModel('openai/gpt-4o-mini')}>
        GPT-4o mini (Fast & Cheap)
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setModel('openai/gpt-4o')}>
        GPT-4o (Balanced)
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setModel('anthropic/claude-sonnet-4-5')}>
        Claude Sonnet 4.5 (Reasoning)
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
```

---

## Troubleshooting

### "Model not available"

**Problem**: Model ID doesn't exist

**Solution**:
```typescript
// Check available models
const models = await gateway.getAvailableModels();
console.log(models.models.map(m => m.id));
```

### "Rate limit exceeded"

**Problem**: Hit provider rate limit

**Solution**:
- Use different model from different provider
- Implement retry with backoff
- Contact provider to increase limits

### "Context length exceeded"

**Problem**: Input too long for model

**Solution**:
- Summarize input
- Use model with larger context (Gemini Flash, Claude)
- Split into multiple requests

---

## Best Practices

### ✅ Do:

1. **Match model to task**
2. **Start cheap, upgrade if needed**
3. **Monitor usage and costs**
4. **Use failover to different providers**
5. **Cache repeated queries**

### ❌ Don't:

1. **Use GPT-5 for simple tasks**
2. **Ignore context limits**
3. **Hardcode model selection**
4. **Forget to track costs**
5. **Use one model for everything**

---

## Future Models

As new models become available via AI Gateway, they'll automatically work with OpenChat. Check the AI Gateway dashboard for the latest additions.

To add a new model:
1. Find model ID from Gateway dashboard
2. Add to `AVAILABLE_MODELS` in `convex/agents/chatAgent.ts`
3. Update this documentation
4. Update UI model selector

---

## Next Steps

- Read [AI Gateway Integration](./ai-gateway-integration.md) to understand routing
- Read [Agents and Tools](./agents-and-tools.md) to customize agent behavior
- Monitor usage in [Vercel AI Gateway Dashboard](https://vercel.com/dashboard)
