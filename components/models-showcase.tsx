"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight as ArrowRight, Sparkles } from "lucide-react"
import { SiOpenai, SiAnthropic } from "react-icons/si"
import { AVAILABLE_MODELS, ModelInfo } from "@/lib/models"
import { getChatUrl } from "@/lib/urls"
import { useChatUrl } from "@/hooks/use-chat-url"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

const allModels = Object.values(AVAILABLE_MODELS)

function ModelCard({ model }: { model: ModelInfo }) {
  const [modelUrl, setModelUrl] = useState("#")
  const modelIcon = getModelIcon(model.provider)
  const Icon = modelIcon.icon
  const longDescription = getLongDescription(model.id)

  useEffect(() => {
    setModelUrl(getChatUrl(true, model.id))
  }, [model.id])

  return (
    <Link
      href={modelUrl}
      className="block rounded-2xl border bg-card p-8 flex flex-col min-h-[450px] hover:shadow-xl hover:border-primary/20 transition-all hover:-translate-y-1 cursor-pointer"
    >
      <h3 className="text-xl font-semibold mb-8 text-left">{model.name}</h3>

      <div className="flex items-center justify-center mb-8 flex-1">
        <div className="scale-[3]">
          <Icon />
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed text-center">
        {longDescription}
      </p>
    </Link>
  )
}

// Custom Icons matching chat interface
const OpenAIIcon = () => <SiOpenai className="h-6 w-6 text-[#10A37F]" />
const GeminiIcon = () => <Sparkles className="h-6 w-6 text-[#4285F4]" />
const ClaudeIcon = () => <SiAnthropic className="h-6 w-6 text-[#D97757]" />
const DeepSeekIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const GrokIcon = () => (
  <svg className="h-6 w-6 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const GLMIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

function getModelIcon(provider: ModelInfo["provider"]) {
  const icons = {
    openai: { icon: OpenAIIcon },
    google: { icon: GeminiIcon },
    anthropic: { icon: ClaudeIcon },
    deepseek: { icon: DeepSeekIcon },
    xai: { icon: GrokIcon },
    zai: { icon: GLMIcon },
  }
  return icons[provider] || icons.openai
}

function getLongDescription(modelId: string): string {
  const descriptions: Record<string, string> = {
    "openai/gpt-4.1-mini": "OpenAI's fastest and most economical model, delivering exceptional performance for everyday tasks while maintaining cost-effectiveness and speed.",
    "openai/gpt-4.1": "A perfectly balanced model offering optimal performance across a wide range of applications, combining speed with advanced reasoning capabilities.",
    "openai/gpt-4o": "OpenAI's most accurate model for complex tasks requiring deep understanding and advanced reasoning. Excels in tasks requiring nuanced comprehension.",
    "openai/gpt-5": "OpenAI's most advanced model to date, pushing the boundaries of AI capabilities with unprecedented accuracy and sophisticated problem-solving abilities.",
    "openai/gpt-5-mini": "A streamlined version of GPT-5 optimized for speed while maintaining remarkable capabilities, perfect for high-volume applications requiring quick responses.",
    "anthropic/claude-sonnet-4.5": "Claude 3.5 Sonnet is a conversational AI designed for smooth, natural interactions across a wide range of topics with excellent reasoning and analytical capabilities.",
    "anthropic/claude-3.7-sonnet": "Fast and capable AI assistant designed for efficient task completion while maintaining high quality outputs across diverse conversational scenarios.",
    "google/gemini-2.0-flash": "Google Gemini has real-time access to the internet and can answer questions based on information from Google searches, making it ideal for current information.",
    "google/gemini-2.5-flash-image": "Specialized multimodal model optimized for visual understanding and image generation tasks, combining speed with advanced visual processing capabilities.",
    "deepseek/deepseek-chat": "Great for coding and technical tasks, DeepSeek Chat excels in programming assistance, debugging, and technical problem-solving with precision.",
    "deepseek/deepseek-r1": "DeepSeek R1 is a leading open-source reasoning LLM that rivals OpenAI's top models, delivering high performance across mathematics, coding, and logical reasoning tasks.",
    "xai/grok-4": "xAI's next-generation AI model combining cutting-edge technology with real-time knowledge access, designed for comprehensive and accurate responses.",
    "xai/grok-4-fast-reasoning": "Optimized for quick logical reasoning and problem-solving, delivering rapid yet thoughtful responses to complex analytical challenges.",
    "xai/grok-4-fast-non-reasoning": "Designed for fast responses without deep reasoning, perfect for straightforward queries and high-throughput applications requiring immediate answers.",
    "zai/glm-4.6": "Powerful general-purpose AI model offering versatile capabilities across multiple domains with balanced performance and reliability.",
  }
  return descriptions[modelId] || "Advanced AI model designed for various tasks."
}

export function ModelsShowcase() {
  const chatUrl = useChatUrl()
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  useEffect(() => {
    // Add grab cursor styling to carousel
    const style = document.createElement('style')
    style.innerHTML = `
      [data-carousel-viewport] {
        cursor: grab;
        user-select: none;
      }
      [data-carousel-viewport]:active {
        cursor: grabbing;
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <section id="models" className="w-full bg-muted/30 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7}>
            <div className="text-center space-y-4 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Built on the latest state-of-the-art AI technologies
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Experience the capabilities of multiple AI models integrated into a single
                application. Effortlessly engage in conversations, generate content, and
                create with a user-friendly platform designed for versatility.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Carousel */}
          <AnimateOnScroll animation="fade-in" duration={0.7} delay={0.2}>
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent className="-ml-4" data-carousel-viewport>
                {allModels.map((model) => (
                  <CarouselItem
                    key={model.id}
                    className="pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <ModelCard model={model} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </AnimateOnScroll>

          {/* CTA Button */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7}>
            <div className="flex justify-center pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link href={chatUrl}>
                  Try Chattia
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
