"use client"

import { useEffect, useState } from "react"
import { SiOpenai, SiAnthropic } from "react-icons/si"
import { Sparkles, Image as ImageIcon } from "lucide-react"

const DeepSeekIcon = () => (
  <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
    <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
    <path d="M2 17L12 22L22 17M2 12L12 17L22 12"/>
  </svg>
)

export function SwitchModelsVisual() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-muted/30 to-muted/60">
      <div className="relative w-full max-w-lg aspect-square">
        {/* Claude - Top Left */}
        <div
          className={`absolute top-0 left-0 w-20 h-20 sm:w-28 sm:h-28 bg-card rounded-3xl shadow-lg flex items-center justify-center transition-all duration-500 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ transitionDelay: '0ms' }}
        >
          <SiAnthropic className="h-10 w-10 sm:h-14 sm:w-14 text-[#D97757]" />
        </div>

        {/* Gemini - Top Right */}
        <div
          className={`absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-card rounded-3xl shadow-lg flex items-center justify-center transition-all duration-500 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <Sparkles className="h-10 w-10 sm:h-14 sm:w-14 text-[#4285F4]" />
        </div>

        {/* OpenAI - Center */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-36 sm:h-36 bg-card rounded-3xl shadow-xl flex items-center justify-center transition-all duration-500 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <SiOpenai className="h-12 w-12 sm:h-18 sm:w-18 text-[#10A37F]" />
        </div>

        {/* Image Generation - Bottom Left */}
        <div
          className={`absolute bottom-0 left-0 w-20 h-20 sm:w-28 sm:h-28 bg-card rounded-3xl shadow-lg flex items-center justify-center transition-all duration-500 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ transitionDelay: '900ms' }}
        >
          <ImageIcon className="h-10 w-10 sm:h-14 sm:w-14 text-purple-500" />
        </div>

        {/* DeepSeek - Bottom Right */}
        <div
          className={`absolute bottom-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-card rounded-3xl shadow-lg flex items-center justify-center transition-all duration-500 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ transitionDelay: '1200ms' }}
        >
          <DeepSeekIcon />
        </div>
      </div>
    </div>
  )
}
