"use client"

import { useEffect, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import Image from "next/image"

export function GenerateImagesVisual() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Sequence: user message (0) -> assistant message (1) -> loading (2) -> image (3) -> reset
    const timers = [
      setTimeout(() => setStep(1), 600),   // Assistant message after 600ms
      setTimeout(() => setStep(2), 1200),  // Loading after 1200ms
      setTimeout(() => setStep(3), 2400),  // Image after 2400ms
      setTimeout(() => setStep(0), 4400),  // Reset after showing image for 2s
    ]

    return () => timers.forEach(clearTimeout)
  }, [step])

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col justify-center p-6 md:p-12 bg-muted/40 gap-4">
      {/* User Message */}
      <div
        className={`flex justify-end transition-all duration-500 ${
          step >= 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="max-w-md bg-card rounded-3xl px-6 py-4 shadow-sm border">
          <p className="text-sm md:text-base text-foreground">
            A serene mountain landscape at sunset, with a crystal clear lake reflecting
            the golden sky and snow-capped peaks.
          </p>
        </div>
        <div className="ml-3 w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
          <Image
            src="https://i.pravatar.cc/150?img=53"
            alt="User avatar"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Assistant Message */}
      <div
        className={`flex justify-start transition-all duration-500 ${
          step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="mr-3 w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="max-w-md space-y-3">
          <div className="bg-card rounded-3xl px-6 py-4 shadow-sm border">
            <p className="text-sm md:text-base text-foreground">
              Here is the visual generated based on your prompt. Let me know if you'd like any adjustments!
            </p>
          </div>

          {/* Image Container */}
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-muted border">
            {/* Loading State */}
            {step === 2 && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Generated Image */}
            {step >= 3 && (
              <div
                className={`w-full h-full transition-all duration-700 ${
                  step >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                <Image
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
                  alt="Generated mountain landscape"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
