"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { SwitchModelsVisual } from "@/components/features/switch-models-visual"
import { VoiceChatVisual } from "@/components/features/voice-chat-visual"
import { GenerateImagesVisual } from "@/components/features/generate-images-visual"
import { TalkToPdfVisual } from "@/components/features/talk-to-pdf-visual"
import { useChatUrl } from "@/hooks/use-chat-url"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

const features = [
  {
    id: "switch-models",
    label: "Switch Models",
    title: "Switch Models",
    description: "Seamlessly explore top-tier language models including GPT-4o, Claude, DeepSeek, Grok, and Gemini. Select the right model for everything from content creation to complex problem-solving.",
    image: "/features/switch-models.jpg",
  },
  {
    id: "voice-chat",
    label: "Voice Chat",
    title: "Voice Chat",
    description: "Engage in natural conversations using voice input. Experience hands-free interaction with AI models through advanced voice recognition and natural language processing.",
    image: "/features/voice-chat.jpg",
  },
  {
    id: "generate-images",
    label: "Generate Images",
    title: "Generate Images",
    description: "Create stunning visuals with powerful AI image generation. Transform your ideas into professional images using state-of-the-art models like DALL-E 3 and Stable Diffusion.",
    image: "/features/generate-images.jpg",
  },
  {
    id: "talk-to-pdf",
    label: "Talk to PDF",
    title: "Talk to PDF",
    description: "Upload and interact with PDF documents directly. Ask questions, extract information, and get insights from your documents using advanced AI-powered analysis.",
    image: "/features/talk-to-pdf.jpg",
  },
]

export function FeaturesShowcase() {
  const [activeTab, setActiveTab] = useState(0)
  const chatUrl = useChatUrl()

  return (
    <section id="features" className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7}>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Explore more features in Chattia
              </h2>
            </div>
          </AnimateOnScroll>

          {/* Tabs */}
          <AnimateOnScroll animation="fade-in" duration={0.7} delay={0.2}>
            <div className="flex justify-center">
            <div className="inline-flex items-center border bg-background p-1 shadow-sm relative">
              {/* Animated background */}
              <div
                className="absolute h-[calc(100%-8px)] bg-muted transition-all duration-300 ease-out"
                style={{
                  width: `calc(${100 / features.length}% - 8px)`,
                  left: `calc(${activeTab * (100 / features.length)}% + 4px)`,
                }}
              />

              {/* Tab buttons */}
              {features.map((feature, index) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(index)}
                  className={`relative z-10 px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === index
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {feature.label}
                </button>
              ))}
            </div>
            </div>
          </AnimateOnScroll>

          {/* Content */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7} delay={0.3}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="space-y-6">
              <div
                key={activeTab}
                className="animate-fade-in space-y-4"
              >
                <h3 className="text-2xl font-bold">{features[activeTab].title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {features[activeTab].description}
                </p>
                <div className="pt-2">
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={chatUrl}>
                      Explore now
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Visual content */}
            <div className="relative">
              <div
                key={`image-${activeTab}`}
                className="min-h-[500px] animate-fade-in overflow-hidden"
              >
                {activeTab === 0 && <SwitchModelsVisual />}
                {activeTab === 1 && <VoiceChatVisual />}
                {activeTab === 2 && <GenerateImagesVisual />}
                {activeTab === 3 && <TalkToPdfVisual />}
              </div>
            </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
