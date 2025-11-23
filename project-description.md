# YourTrainer.chat - Project Description

## Descripción General

**Nombre del Proyecto:** YourTrainer.chat

**Descripción:** Agente de optimización física con IA por WhatsApp. Analiza tu fisiología con visión artificial, corrige biomecánica en tiempo real y diseña protocolos personalizados para maximizar tu potencial físico.

**URL de Deployment:** <https://yourtrainer.chat>

---

## 1. Funcionalidades

### Overview

YourTrainer es un coach de físico y entrenamiento potenciado por IA que combina capacidades avanzadas de visión artificial, análisis biomecánico y planificación de entrenamiento personalizada. Los usuarios pueden interactuar con el agente a través de:

- **Chat web** (interfaz Next.js)
- **WhatsApp** (integración vía Twilio)

### Core Capabilities

#### 1.1 Body Scan Vision 4.0

Análisis basado en fotos del físico del usuario que estima:

- **Porcentaje de grasa corporal** (rangos, ej. 18-22%)
- **Mediciones corporales** (pecho, cintura, caderas, hombros, brazos, muslos, pantorrillas - todos en rangos)
- **Tipo de físico** (ej. "dominante parte superior", "atlético delgado", "skinny-fat")
- **Fortalezas** (2-4 puntos destacados)
- **Oportunidades de mejora** (2-4 puntos específicos)

**Formato de respuesta:**

```
1. Lo que veo
   (resumen de mediciones, grasa corporal, proporciones)

2. Tus fortalezas
   - Punto 1
   - Punto 2

3. Tus mayores oportunidades
   - Punto 1
   - Punto 2

Disclaimer: "Estos rangos son estimaciones visuales, útiles para entrenamiento pero no diagnósticos médicos."
```

#### 1.2 Biomechanical Vision

Análisis de videos de ejercicios que evalúa:

- **Detección de ejercicio** (sentadilla, peso muerto, press de banca, etc.)
- **Evaluación técnica:** alineación articular, rango de movimiento, control espinal, tempo, simetría, riesgos
- **Correcciones de forma** (máximo 3 cues simples)
- **Regresiones/progresiones** (1-2 variaciones sugeridas)

**Formato de respuesta:**

```
Ejercicio detectado: [nombre]

Lo que estás haciendo bien:
- [observaciones]

Qué mejorar (top 3 cues):
1. [cue]
2. [cue]
3. [cue]

Variación/regresión sugerida:
- [sugerencia]
```

#### 1.3 Predictive Physique Model

Pronóstico de progreso usando:

- Todos los body scans históricos
- Datos biomecánicos
- Logs de entrenamiento
- Objetivos del usuario

Predice cambios realistas en 4-12 semanas:

- Definición visual
- Cambio de cintura (rango)
- Áreas de desarrollo muscular
- Mejoras de fuerza (cualitativo)
- Mejoras posturales

**Siempre usa rangos, nunca valores absolutos**

**Formato de respuesta:**

```
Si sigues tu plan durante las próximas 8 semanas...

- Cambio de grasa corporal: [rango]
- Cambios musculares visibles: [descripción]
- Progreso de fuerza: [cualitativo]
- Progreso de postura/simetría: [descripción]

Disclaimer: "Esta es una estimación, no una garantía."
```

#### 1.4 AI Periodized Training

Genera planes de entrenamiento completamente personalizados basados en:

- Días de entrenamiento/semana
- Equipo disponible
- Nivel de experiencia
- Restricciones biomecánicas
- Insights de body scan
- Objetivo del usuario (pérdida de grasa, hipertrofia, rendimiento, estética)

Los planes incluyen:

- Duración del bloque de entrenamiento (4-6 semanas)
- Estructura semanal
- Listas de ejercicios con series/reps/descanso
- Guía RPE/RIR
- Ejercicios correctivos
- Reglas de progresión
- Explicación clara de por qué funciona este plan

**Ejemplo de formato:**

```
Semanas 1-4 — 4 días/semana

Día 1 – Torso superior (Pecho + Postura)
- Press de banca — 4×6-8
- Press inclinado DB — 3×8-10
- Remo a una mano — 3×10-12
- Aperturas en cable — 3×12-15
- Face pulls — 3×15 (correctivo)

Día 2 – Tren inferior (Glúteos + Cuádriceps)
...

Explicación:
"Este plan prioriza X y resuelve Y basado en tu Body Scan y Biomechanical Vision."
```

### 1.5 Integración WhatsApp

**Flujo de comunicación:**

1. Usuario envía mensaje al número de Twilio
2. Webhook activa Convex action
3. Agente YourTrainer procesa el mensaje
4. Respuesta enviada vía Twilio API

### 1.7 Reglas de Seguridad

El agente YourTrainer DEBE:

- Evitar fomentar entrenamiento con dolor
- Evitar dietas extremas
- Sugerir ayuda profesional para problemas médicos
- Enfocarse en cambios sostenibles
- Nunca comentar sobre atractivo o partes sexualizadas del cuerpo
- Siempre priorizar seguridad y progreso a largo plazo

Si el usuario describe dolor o lesión → recomendar detener y consultar a un profesional.

---

## 2. Arquitectura Técnica

### 2.1 Tech Stack

#### Frontend

- **Next.js** 15.5.6 (App Router, React 19)
- **Tailwind CSS** 4.1.9 + shadcn/ui components
- **Icons:** lucide-react (primary), react-icons (secondary)
- **Animations:** tailwindcss-animate + framer-motion

#### Backend

- **Convex** 1.28.0 (database + serverless functions)
- **@convex-dev/agent** 0.2.12 (AI agent framework)
- **AI SDK** 5.0 (multi-model support)
- **Twilio** (WhatsApp integration)

#### AI Models

- **OpenAI:** GPT-4 Vision (body scans), GPT-4 (coaching)
- **Google Gemini:** Alternative vision + coaching
- **Groq:** Fast inference

### 2.2 Project Structure

```
/app
├── web/                    Landing page routes
│   ├── page.tsx           Home page (Hero, Features, Testimonials)
│   ├── pricing/           Pricing page
│   ├── contact/           Contact page
│   ├── faqs/              FAQs
│   ├── terms/             Terms of service
│   └── privacy/           Privacy policy
├── layout.tsx             Root layout
└── providers.tsx          Client providers (Convex, Clerk, Theme)

/convex
├── _generated/            Auto-generated Convex types
├── schema.ts              Database schema
├── agents/                AI agents
│   ├── yourTrainerAgent.ts  Main YourTrainer agent
│   └── tools.ts           Agent tools (body scan, biomech, predictions)
├── bodyScans.ts           Body scan storage and queries
├── biomechanics.ts        Biomechanical analysis data
├── trainingPlans.ts       Generated training plans
├── userProfiles.ts        User profiles and fitness data
└── chat.ts                Chat conversations

/components
├── hero.tsx               Landing page hero section
├── models-showcase.tsx    AI models showcase
├── features-showcase.tsx  Product features
├── user-testimonials.tsx  User testimonials
└── ui/                    shadcn/ui components

/forma                     React Native mobile app (separate)
```

### 2.3 Agent Implementation

El agente YourTrainer está implementado en `/convex/agents/yourTrainerAgent.ts` usando Convex Agents framework:

```typescript
const agent = new Agent(components.agent, {
  name: "YourTrainer",
  languageModel: gateway("openai/gpt-4"),
  instructions: `[Full YourTrainer system prompt]`,
  tools: {
    analyzeBodyScan, // Vision 4.0
    analyzeBiomechanics, // Video analysis
    predictProgress, // Predictive model
    generateTrainingPlan, // Periodization
    getUserHistory, // Access historical data
    saveAnalysis, // Store results
  },
  maxSteps: 10,
});
```

### 2.4 Data Schema (Convex)

#### User Profiles

```typescript
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
```

#### Body Scans

```typescript
bodyScans: {
  userId: string
  imageUrl: string
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
```

#### Biomechanical Analyses

```typescript
biomechanics: {
  userId: string
  videoUrl: string
  exercise: string
  analysis: {
    strengths: string[]
    corrections: string[]   // max 3
    regressions: string[]
    progressions: string[]
    riskFactors: string[]
  }
  timestamp: number
}
```

#### Training Plans

```typescript
trainingPlans: {
  userId: string
  startDate: number
  duration: number
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
        reps: string
        rest: string
        rpe?: string
        notes?: string
      }[]
    }[]
  }[]
  rationale: string
  timestamp: number
}
```

#### Predictions

```typescript
predictions: {
  userId: string
  basedOnScans: Id<"bodyScans">[]
  basedOnBiomech: Id<"biomechanics">[]
  timeframe: number
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
```

#### Chat Threads & Messages

```typescript
threads: {
  userId: string
  title?: string
  createdAt: number
  updatedAt: number
}

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

### 2.5 Landing Page Structure

La landing page (`/app/web`) sigue un layout de marketing estándar:

**Secciones:**

1. **Hero** - Propuesta de valor, CTA
2. **Models Showcase** - Muestra de capacidades de IA
3. **User Testimonials** - Prueba social
4. **Features Showcase** - 4 capacidades core detalladas
5. **Pricing** (página separada)
6. **FAQ, Terms, Privacy, Contact** (páginas separadas)

**Componentes usados:**

- `<Hero />` - Sección hero con background y CTA
- `<ModelsShowcase />` - Cards de modelos de IA
- `<FeaturesShowcase />` - Grid de features con animaciones
- `<UserTestimonials />` - Carousel de testimonios

### 2.6 Development Commands

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
