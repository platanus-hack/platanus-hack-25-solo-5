"use client"

import { useEffect, useState } from "react"
import { Mic } from "lucide-react"

export function VoiceChatVisual() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-muted/40 gap-12">
      {/* Text prompt - Centered top */}
      <div
        className={`max-w-lg transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        <p className="text-lg md:text-xl text-muted-foreground font-medium text-center">
          What are the best practices for learning a new programming language?
        </p>
      </div>

      {/* Microphone and sound waves container */}
      <div className="relative flex items-center justify-center gap-4">
        {/* Left sound waves */}
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={`left-${i}`}
              className={`w-1 bg-muted-foreground/40 rounded-full transition-all duration-300 ${
                mounted ? "animate-sound-wave" : "h-4"
              }`}
              style={{
                animationDelay: `${i * 100}ms`,
                height: mounted ? undefined : "16px",
              }}
            />
          ))}
        </div>

        {/* Microphone circle */}
        <div
          className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-500 flex items-center justify-center shadow-2xl transition-all duration-700 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <Mic className="h-16 w-16 md:h-20 md:w-20 text-white" strokeWidth={2} />

          {/* Pulse effect */}
          {mounted && (
            <>
              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-pulse opacity-30" />
            </>
          )}
        </div>

        {/* Right sound waves */}
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={`right-${i}`}
              className={`w-1 bg-muted-foreground/40 rounded-full transition-all duration-300 ${
                mounted ? "animate-sound-wave" : "h-4"
              }`}
              style={{
                animationDelay: `${(i + 5) * 100}ms`,
                height: mounted ? undefined : "16px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
