# OpenChat Documentation

Welcome to the OpenChat documentation! This directory contains comprehensive guides for understanding and working with the OpenChat AI chatbot application.

## 📚 Documentation Structure

- **[Architecture](./architecture.md)** - System architecture and component overview
- **[Convex Setup](./convex-setup.md)** - Setting up Convex backend and AI agents
- **[AI Gateway Integration](./ai-gateway-integration.md)** - How Vercel AI Gateway works
- **[Agents and Tools](./agents-and-tools.md)** - AI agents and available tools
- **[Models](./models.md)** - Available AI models and when to use each
- **[Environment Variables](./environment-variables.md)** - Required configuration
- **[Deployment](./deployment.md)** - Deploy to Vercel and Convex

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd openchat
   bun install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Add your AI_GATEWAY_API_KEY
   ```

3. **Setup Convex**
   ```bash
   bunx convex dev
   ```

4. **Run Development Server**
   ```bash
   bun dev
   ```

## 🏗️ Architecture Overview

```
User → Next.js UI → Convex Backend → AI Gateway → Multiple LLM Providers
                         ↓
                   AI Agent Component
                         ↓
                   Tools (Web Search, Image Gen)
```

## 🔑 Key Features

- **Multi-Model Support**: Access GPT-4o, Claude, Gemini, DeepSeek with one API key
- **AI Agents**: Powered by Convex AI Agent component
- **Smart Tools**: Web search and image generation
- **Real-time Streaming**: Live responses via websockets
- **Persistent History**: All conversations stored in Convex
- **Usage Tracking**: Monitor token usage and costs

## 📖 Learn More

- [Convex Documentation](https://docs.convex.dev)
- [Convex AI Agents](https://docs.convex.dev/agents)
- [Vercel AI SDK](https://ai-sdk.dev)
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)

## 🤝 Contributing

Please read our contributing guidelines before submitting pull requests.

## 📄 License

[Your License Here]
