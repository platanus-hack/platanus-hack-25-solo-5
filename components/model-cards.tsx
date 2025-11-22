"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { SiOpenai, SiGoogle, SiAnthropic } from "react-icons/si"
import { AVAILABLE_MODELS } from "@/lib/models"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Custom Icons Components
const OpenAIIcon = () => (
  <SiOpenai className="h-5 w-5 text-[#10A37F]" />
)

const GeminiIcon = () => (
  <div className="flex h-full w-full items-center justify-center">
    <Sparkles className="h-5 w-5 text-[#4285F4]" />
  </div>
)

const ClaudeIcon = () => (
  <SiAnthropic className="h-5 w-5 text-[#D97757]" />
)

const DeepSeekIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const models = [
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    description: "OpenAI's fastest and most economical model",
    icon: OpenAIIcon,
    bgColor: "bg-[#10A37F]/10",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "OpenAI's most accurate model for complex tasks",
    icon: OpenAIIcon,
    bgColor: "bg-[#10A37F]/10",
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    description: "OpenAI's most advanced model...",
    icon: OpenAIIcon,
    bgColor: "bg-[#10A37F]/10",
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Google's fast multimodal AI for...",
    icon: GeminiIcon,
    bgColor: "bg-[#4285F4]/10",
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    description: "Excellent reasoning and analytical capabilities",
    icon: ClaudeIcon,
    bgColor: "bg-[#D97757]/10",
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek Chat",
    description: "Great for coding and technical questions",
    icon: DeepSeekIcon,
    bgColor: "bg-[#0066CC]/10",
  },
]

interface ModelCardsProps {
  onModelSelect?: (modelId: string) => void
}

export function ModelCards({ onModelSelect }: ModelCardsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <h3 className="text-lg font-semibold text-foreground">Available Models</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          See All
        </Button>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {models.map((model) => {
            const Icon = model.icon
            return (
              <CarouselItem key={model.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                <Card
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer bg-card shadow-none"
                  onClick={() => onModelSelect?.(model.id)}
                >
                  <div className="space-y-3">
                    <div className={`h-10 w-10 flex items-center justify-center ${model.bgColor}`}>
                      <Icon />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm">{model.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{model.description}</p>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  )
}
