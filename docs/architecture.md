# OpenChat Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Chat UI     │  │ Model        │  │  Explore Bots       │  │
│  │  (Main Chat) │  │ Selector     │  │  (Agent Presets)    │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Next.js 15 (React 19)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Convex Backend                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  Convex AI Agent Component                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │ Chat Agent   │  │ Web Search   │  │ Image          │  │ │
│  │  │ (Multi-Model)│  │ Tool         │  │ Generation     │  │ │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    Convex Database                         │ │
│  │  • threads (conversations)                                 │ │
│  │  • messages (chat history)                                 │ │
│  │  • usage (token tracking)                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Single AI Gateway API Key
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Vercel AI Gateway                            │
│  • Unified API for all providers                               │
│  • Automatic failover & routing                                │
│  • Usage tracking & observability                              │
│  • <20ms latency                                               │
└─┬────────┬─────────┬──────────┬──────────┬───────────┬─────────┘
  │        │         │          │          │           │
┌─▼──┐  ┌─▼──┐   ┌──▼───┐   ┌──▼───┐   ┌──▼────┐  ┌──▼────┐
│OpenAI│ │Claude│ │Gemini│   │DeepSeek│ │Meta   │  │  xAI  │
│GPT-4o│ │Sonnet│ │ 2.0  │   │  V3   │  │Llama  │  │ Grok  │
└─────┘ └──────┘  └──────┘   └───────┘  └───────┘  └───────┘
```

## Component Breakdown

### 1. Frontend Layer (Next.js 15 + React 19)

**Components:**
- `chat-interface.tsx` - Main chat orchestrator
- `main-chat.tsx` - Empty state and message input
- `chat-conversation.tsx` - Active conversation view
- `sidebar.tsx` - Navigation and chat history
- `explore-bots/page.tsx` - Agent presets gallery

**State Management:**
- Uses Convex React hooks (`useQuery`, `useMutation`, `useAction`)
- Real-time updates via websocket subscriptions
- No Redux/Zustand needed - Convex handles state sync

### 2. Backend Layer (Convex)

**Core Files:**
```
convex/
├── convex.config.ts      # Agent component configuration
├── schema.ts             # Database schema
├── agents/
│   ├── chatAgent.ts      # Main AI agent with multi-model support
│   └── tools.ts          # Web search & image generation tools
├── chat.ts               # Chat actions and queries
└── models.ts             # Model management and gateway queries
```

**Database Schema:**
```typescript
threads: {
  userId: string (optional)
  title: string (optional)
  modelId: string          // Default model for thread
  createdAt: number
  updatedAt: number
  isStarred: boolean
}

messages: {
  threadId: Id<"threads">
  role: "user" | "assistant" | "system"
  content: string
  modelId: string (optional)   // Model used for this message
  toolCalls: array (optional)  // Tool execution results
  metadata: object (optional)  // Tokens, duration, etc.
  createdAt: number
}

usage: {
  threadId: Id<"threads">
  userId: string (optional)
  modelId: string
  provider: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number (optional)
  timestamp: number
}
```

### 3. AI Agent Layer

**Agent Configuration:**
```typescript
const agent = new Agent(components.agent, {
  name: "OpenChat Assistant",
  languageModel: gateway(modelId),  // Dynamic model switching
  instructions: "...",              // System prompt
  tools: { webSearch, imageGeneration },
  maxSteps: 5,
});
```

**Supported Models:**
- `openai/gpt-4o-mini` - Fast, economical
- `openai/gpt-4o` - Most capable
- `openai/gpt-5` - Latest and most advanced
- `anthropic/claude-sonnet-4-5` - Excellent reasoning
- `google/gemini-2.0-flash` - Fast multimodal
- `deepseek/deepseek-chat` - Great for coding

**Tools:**
1. **Web Search** (`webSearch`)
   - Provider: Tavily API
   - Returns: Search results with titles, URLs, content, scores
   - Use case: Current information, news, facts

2. **Image Generation** (`imageGeneration`)
   - Provider: DALL-E 3 (via AI Gateway)
   - Returns: Image URL and revised prompt
   - Use case: Creating visualizations, art, diagrams

### 4. AI Gateway Layer (Vercel)

**Key Features:**
- **Single API Key**: One key for all providers
- **Failover**: Automatic fallback if primary provider fails
- **Routing**: Intelligent routing based on latency/cost/availability
- **Observability**: Centralized logs and metrics
- **OpenAI-Compatible**: All models use OpenAI format

**Configuration:**
```typescript
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1/ai",
});
```

## Data Flow

### 1. User Sends Message

```
User Input
  ↓
Frontend (main-chat.tsx)
  ↓
Convex Action (sendMessage)
  ↓
Store User Message in DB
  ↓
Create/Get Agent Thread
  ↓
Agent.generateText()
  ↓
AI Gateway
  ↓
LLM Provider (OpenAI/Claude/etc)
  ↓
Response
  ↓
Store Assistant Message in DB
  ↓
Track Usage
  ↓
Return to Frontend (streaming)
  ↓
Display to User
```

### 2. Tool Execution Flow

```
Agent receives tool-requiring prompt
  ↓
Agent identifies tool needed (webSearch or imageGeneration)
  ↓
Execute tool function
  ↓
Tool calls external API (Tavily or DALL-E)
  ↓
Tool returns results to agent
  ↓
Agent incorporates results into response
  ↓
Final response to user (with tool results)
```

## Scaling Considerations

### Performance
- **Convex**: Auto-scales with usage
- **AI Gateway**: Built-in caching and load balancing
- **Database**: Indexed queries for fast lookups
- **Websockets**: Real-time updates without polling

### Cost Optimization
- Usage tracking per model/user
- Token counting for billing
- Model selection based on task complexity
- Optional rate limiting via Convex Rate Limiter component

### Security
- Environment variables for API keys
- No keys stored in frontend
- Convex handles authentication
- CORS protection built-in

## Development vs Production

**Development:**
```bash
bunx convex dev  # Local Convex instance
bun dev          # Next.js dev server
```

**Production:**
```bash
bunx convex deploy  # Deploy Convex backend
vercel deploy       # Deploy Next.js frontend
```

## Monitoring

1. **Convex Dashboard**: View functions, database, logs
2. **Vercel AI Gateway Dashboard**: Usage, costs, latency
3. **Usage Table**: Query for custom analytics
4. **Error Tracking**: Convex logs all errors

## Next Steps

- Read [Convex Setup](./convex-setup.md) for detailed setup instructions
- Read [AI Gateway Integration](./ai-gateway-integration.md) to understand the gateway
- Read [Agents and Tools](./agents-and-tools.md) for agent customization
