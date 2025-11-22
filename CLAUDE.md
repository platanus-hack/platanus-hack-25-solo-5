# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**fit.ai** (YourTrainer) is an AI-powered physique and training coach platform built with Next.js 15, Convex, and Twilio. The project consists of two main components:

1. **Landing Page** (`/app/web`) - Marketing site showcasing the product
2. **YourTrainer AI Agent** (Convex Agents) - Advanced AI fitness coach with vision capabilities

Users interact with YourTrainer through:
- Web chat interface
- WhatsApp (via Twilio)

## Development Commands

```bash
# Start Convex backend (required first!)
bunx convex dev

# Development server (in another terminal)
bun dev

# Build for production
bun run build

# Start production server
bun start

# Lint code
bun run lint

# Deploy Convex backend
bunx convex deploy
```

## Architecture Overview

### Tech Stack

**Frontend:**
- Next.js 15.5.6 (App Router, React 19)
- Tailwind CSS 4.1.9 + shadcn/ui components
- Clerk authentication
- next-themes (dark/light mode)
- Vercel Analytics

**Backend:**
- Convex 1.28.0 (database + serverless functions)
- @convex-dev/agent 0.2.12 (AI agent framework)
- AI SDK 5.0 (multi-model support)
- Stripe (payments)
- Twilio (WhatsApp integration)

**AI Models:**
- OpenAI (GPT-4 Vision for body scans, GPT-4 for coaching)
- Google Gemini (alternative vision + coaching)
- Groq (fast inference)

### Project Structure

```
/app
├── web/                    - Landing page routes
│   ├── page.tsx           - Home page (Hero, Features, Testimonials)
│   ├── pricing/           - Pricing page
│   ├── contact/           - Contact page
│   ├── faqs/              - FAQs
│   ├── terms/             - Terms of service
│   └── privacy/           - Privacy policy
├── layout.tsx             - Root layout
└── providers.tsx          - Client providers (Convex, Clerk, Theme)

/convex
├── _generated/            - Auto-generated Convex types
├── schema.ts              - Database schema
├── agents/                - AI agents
│   ├── yourTrainerAgent.ts  - Main YourTrainer agent
│   └── tools.ts           - Agent tools (body scan, biomech, predictions)
├── bodyScans.ts           - Body scan storage and queries
├── biomechanics.ts        - Biomechanical analysis data
├── trainingPlans.ts       - Generated training plans
├── userProfiles.ts        - User profiles and fitness data
└── chat.ts                - Chat conversations

/components
├── hero.tsx               - Landing page hero section
├── models-showcase.tsx    - AI models showcase
├── features-showcase.tsx  - Product features
├── user-testimonials.tsx  - User testimonials
└── ui/                    - shadcn/ui components

/forma                     - React Native mobile app (separate)
```

## YourTrainer AI Agent

### Agent Personality & Behavior

**YourTrainer** is an advanced AI physique and training coach with the following characteristics:

- **Tone:** Supportive but direct, like a high-end personal trainer
- **Communication:** Clear, structured, actionable
- **Focus:** Physical improvement, performance, aesthetics, safety, longevity
- **Constraints:** Never gives medical diagnoses, never judges attractiveness

### Core Capabilities

#### 1. Body Scan Vision 4.0

Photo-based physique analysis that estimates:

- **Bodyfat %** (as range, e.g., 18-22%)
- **Measurements** (chest, waist, hips, shoulders, arms, thighs, calves - all ranges)
- **Physique type** (e.g., "upper-body dominant", "lean athletic", "skinny-fat")
- **Strengths** (2-4 bullet points)
- **Opportunities** (2-4 bullet points for improvement)

**Response format:**
```
1. What I see
   (overview of measurements, bodyfat, proportions)

2. Your strengths
   - Point 1
   - Point 2

3. Your biggest opportunities
   - Point 1
   - Point 2

Disclaimer: "These ranges are visual estimates, helpful for training but not medical diagnostics."
```

#### 2. Biomechanical Vision

Video-based exercise technique analysis:

- Detects exercise type (squat, deadlift, bench press, etc.)
- Assesses: joint alignment, ROM, spinal control, tempo, symmetry, risks
- Provides **maximum 3 form corrections** with simple cues
- Suggests 1-2 regressions or progressions

**Response format:**
```
Exercise detected: [name]

What you're doing well:
- [observations]

What to improve (top 3 cues):
1. [cue]
2. [cue]
3. [cue]

Suggested variation/regression:
- [suggestion]
```

#### 3. Predictive Physique Model

Progress forecasting using:
- All historical body scans
- Biomechanical data
- Training logs
- User goals

Predicts realistic changes over 4-12 weeks:
- Visual definition
- Waist change (range)
- Muscle development areas
- Strength improvements (qualitative)
- Posture improvements

**Always uses ranges, never absolutes**

**Response format:**
```
If you follow your plan for the next 8 weeks…

- Bodyfat change: [range]
- Visible muscular changes: [description]
- Strength progress: [qualitative]
- Posture/symmetry progress: [description]

Disclaimer: "This is an estimate, not a guarantee."
```

#### 4. AI Periodized Training

Generates fully custom training plans based on:
- Training days/week
- Equipment available
- Experience level
- Biomechanical constraints
- Body scan insights
- User goal (fat loss, hypertrophy, performance, aesthetics)

Plans include:
- Training block duration (4-6 weeks)
- Weekly structure
- Exercise lists with sets/reps/rest
- RPE/RIR guidance
- Corrective exercises
- Progression rules
- Clear explanation of why this plan works

**Format example:**
```
Week 1-4 — 4 days/week

Day 1 – Upper (Chest focus + Posture)
- Bench press — 4×6-8
- Incline DB press — 3×8-10
- One-arm row — 3×10-12
- Cable fly — 3×12-15
- Face pulls — 3×15 (corrective)

Day 2 – Lower (Glutes + Quads)
...

Explanation:
"This plan prioritizes X and solves Y based on your Body Scan & Biomechanical Vision."
```

### Agent Implementation

The agent is implemented in `/convex/agents/yourTrainerAgent.ts` using Convex Agents framework:

```typescript
const agent = new Agent(components.agent, {
  name: "YourTrainer",
  languageModel: gateway("openai/gpt-4"), // or other models
  instructions: `[Full YourTrainer system prompt]`,
  tools: {
    analyzeBodyScan,        // Vision 4.0
    analyzeBiomechanics,    // Video analysis
    predictProgress,        // Predictive model
    generateTrainingPlan,   // Periodization
    getUserHistory,         // Access historical data
    saveAnalysis,           // Store results
  },
  maxSteps: 10,
});
```

### Data Schema (Convex)

```typescript
// User Profiles
userProfiles: {
  userId: string
  age?: number
  sex?: "male" | "female" | "other"
  weight?: number  // kg
  height?: number  // cm
  goal?: string    // "fat loss", "hypertrophy", "performance", "aesthetics"
  experience?: string  // "beginner", "intermediate", "advanced"
  equipment?: string[] // available equipment
  trainingDaysPerWeek?: number
  createdAt: number
  updatedAt: number
}

// Body Scans
bodyScans: {
  userId: string
  imageUrl: string          // Stored image
  analysis: {
    bodyfatPercentage: { min: number, max: number }
    measurements: {
      chest?: { min: number, max: number }
      waist?: { min: number, max: number }
      hips?: { min: number, max: number }
      shoulders?: { min: number, max: number }
      // ... other measurements
    }
    physiqueType: string
    strengths: string[]
    opportunities: string[]
  }
  timestamp: number
}

// Biomechanical Analyses
biomechanics: {
  userId: string
  videoUrl: string
  exercise: string          // "squat", "deadlift", etc.
  analysis: {
    strengths: string[]
    corrections: string[]   // max 3
    regressions: string[]
    progressions: string[]
    riskFactors: string[]
  }
  timestamp: number
}

// Training Plans
trainingPlans: {
  userId: string
  startDate: number
  duration: number          // weeks
  daysPerWeek: number
  goal: string
  weeks: {
    weekNumber: number
    days: {
      dayNumber: number
      focus: string
      exercises: {
        name: string
        sets: number
        reps: string        // "6-8" or "12-15"
        rest: string        // "90s" or "2min"
        rpe?: string        // "7-8"
        notes?: string
      }[]
    }[]
  }[]
  rationale: string         // why this plan works
  timestamp: number
}

// Predictions
predictions: {
  userId: string
  basedOnScans: Id<"bodyScans">[]
  basedOnBiomech: Id<"biomechanics">[]
  timeframe: number         // weeks
  predictions: {
    bodyfatChange: { min: number, max: number }
    muscularChanges: string
    strengthProgress: string
    postureProgress: string
    aestheticBalance: string
  }
  assumptions: string[]
  timestamp: number
}

// Chat Threads
threads: {
  userId: string
  title?: string
  createdAt: number
  updatedAt: number
}

// Chat Messages
messages: {
  threadId: Id<"threads">
  role: "user" | "assistant" | "system"
  content: string
  attachments?: {
    type: "image" | "video"
    url: string
    analysisId?: Id<"bodyScans"> | Id<"biomechanics">
  }[]
  timestamp: number
}
```

## Landing Page Structure

The landing page (`/app/web`) follows a standard marketing layout:

**Sections:**
1. **Hero** - Value proposition, CTA
2. **Models Showcase** - AI capabilities display
3. **User Testimonials** - Social proof
4. **Features Showcase** - 4 core capabilities detailed
5. **Pricing** (separate page)
6. **FAQ, Terms, Privacy, Contact** (separate pages)

**Components used:**
- `<Hero />` - Hero section with background and CTA
- `<ModelsShowcase />` - AI model cards
- `<FeaturesShowcase />` - Feature grid with animations
- `<UserTestimonials />` - Testimonial carousel

## Styling System

- **Framework:** Tailwind CSS 4.1.9
- **Components:** shadcn/ui (Radix UI primitives)
- **Theme:** CSS variables for light/dark mode
- **Animations:** tailwindcss-animate + framer-motion
- **Icons:** lucide-react (primary), react-icons (secondary)

## Authentication & User Management

- **Provider:** Clerk
- **Features:** Social login (Google, Apple), email/password
- **User sync:** Clerk webhooks → Convex user records
- **Protected routes:** Middleware handles auth redirects

## Payment Integration

- **Provider:** Stripe
- **Features:** Subscription management, webhooks
- **Plans:** Basic, Pro, Elite (defined in pricing page)
- **Webhooks:** Handle subscription status changes

## WhatsApp Integration

- **Provider:** Twilio
- **Flow:**
  1. User sends message to Twilio number
  2. Webhook triggers Convex action
  3. YourTrainer agent processes message
  4. Response sent back via Twilio API

## Safety Rules for YourTrainer

The agent MUST:
- Avoid encouraging training through pain
- Avoid extreme diets
- Suggest professional help for medical issues
- Focus on sustainable changes
- Never comment on attractiveness or sexualized body parts
- Always prioritize safety and long-term progress

If user describes pain or injury → recommend stopping and consulting a professional.

## Multi-Feature Integration

Users may ask YourTrainer to:
- "Analyze this new photo"
- "Check this video of my squat"
- "How will I look in 8 weeks?"
- "Adjust my plan to 3 days/week"
- "I feel my chest lags behind, what do I do?"
- "Update my predictions with the latest scan"

The agent combines all modules logically:
- References history
- Updates predictions
- Adjusts plans
- Gives simple action steps

## Important Conventions

- Use bun for package management (not npm)
- Never make git commits automatically
- No build step after each interaction unless requested
- Never push to production
- Minimal comments, only for complex business logic
- No emojis in comments
- TypeScript strict mode enabled

## Environment Variables

Required:
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment ID
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `OPENAI_API_KEY` - OpenAI API for vision models
- `STRIPE_SECRET_KEY` - Stripe secret key
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio WhatsApp number

## Code Quality

- TypeScript strict mode enabled
- ESLint configured
- Convex schema validation on `bunx convex dev`
- Build validation: `bun run build`

## Key Files

- **`app/layout.tsx`** - Root layout with providers
- **`app/providers.tsx`** - Convex + Clerk + Theme providers
- **`convex/schema.ts`** - Database schema
- **`convex/agents/yourTrainerAgent.ts`** - Main AI agent
- **`middleware.ts`** - Auth and routing middleware (handles subdomain routing)
- **`next.config.mjs`** - Next.js configuration
- Asegurate de siempre correr bunx convex dev --once para testear que los cambios funcionen, debes siempre corregir los errores