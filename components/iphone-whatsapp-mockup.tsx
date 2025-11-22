"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Camera, Mic, Smile, Dumbbell } from "lucide-react"

type Message = {
  id: number
  text?: string
  sender: "user" | "bot"
  timestamp: string
  image?: string
  isAnalysis?: boolean
}

export function IPhoneWhatsAppMockup() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isResetting, setIsResetting] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const conversation: Message[] = [
    { id: 1, text: "Hola YourTrainer, ¿puedes analizar esta foto de mi físico?", sender: "user", timestamp: "10:23" },
    { id: 2, text: "¡Por supuesto! Envíame tu foto y te daré un análisis detallado 📸", sender: "bot", timestamp: "10:23" },
    { id: 3, sender: "user", timestamp: "10:24", image: "/mockup-photos/fitness-example.jpg" },
    {
      id: 4,
      sender: "bot",
      timestamp: "10:24",
      isAnalysis: true,
      text: "¡Genial! Aquí está mi análisis:"
    },
    { id: 5, text: "¡Muy acertado! ¿Puedes crearme un plan?", sender: "user", timestamp: "10:25" },
    { id: 6, text: "¡Perfecto! Creando tu plan personalizado...", sender: "bot", timestamp: "10:25" },
  ]

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (!isResetting && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [messages, isResetting])

  // Message cycling with smooth reset
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < conversation.length - 1) {
          return prev + 1
        } else {
          // Smooth reset with fade
          setIsResetting(true)
          setTimeout(() => {
            setMessages([])
            setCurrentStep(0)
            setIsResetting(false)
          }, 300)
          return prev
        }
      })
    }, 1200) // 53% faster than before

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isResetting) {
      setMessages(conversation.slice(0, currentStep + 1))
    }
  }, [currentStep, isResetting])

  return (
    <div className="w-full max-w-[320px] mx-auto relative iphone-container">
      {/* iPhone Frame Overlay - ALWAYS ON TOP */}
      <div className="absolute inset-0 pointer-events-none z-50 rounded-[50px]">
        {/* Top Border */}
        <div className="absolute top-0 left-0 right-0 h-[14px] rounded-t-[50px]"
          style={{
            background: 'linear-gradient(to bottom, #1a1a1a 0%, #0f0f0f 100%)'
          }}
        />

        {/* Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-[14px] rounded-b-[50px]"
          style={{
            background: 'linear-gradient(to top, #1a1a1a 0%, #0f0f0f 100%)'
          }}
        />

        {/* Left Border */}
        <div className="absolute top-[14px] bottom-[14px] left-0 w-[14px]"
          style={{
            background: 'linear-gradient(to right, #1a1a1a 0%, #0f0f0f 100%)'
          }}
        />

        {/* Right Border */}
        <div className="absolute top-[14px] bottom-[14px] right-0 w-[14px]"
          style={{
            background: 'linear-gradient(to left, #1a1a1a 0%, #0f0f0f 100%)'
          }}
        />

        {/* Dynamic Island */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-60"
        />
      </div>

      {/* iPhone Content Container */}
      <div className="relative rounded-[50px] p-[14px] z-10"
        style={{
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)'
        }}
      >
        {/* Screen - Flex Layout */}
        <div className="bg-[#ECE5DD] rounded-[36px] overflow-hidden h-[600px] flex flex-col relative"
        >
          {/* WhatsApp Header - Sticky */}
          <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)'
            }}
          >
            {/* Professional Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center relative"
              style={{
                backgroundColor: '#55F7B2'
              }}
            >
              <Dumbbell className="w-5 h-5 text-black" />
              {/* Online Status */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#075E54]" />
            </div>
            <div className="flex-1 text-white">
              <div className="font-semibold text-sm">YourTrainer</div>
              <div className="text-xs opacity-90">Coach Fitness IA</div>
            </div>
            <div className="flex gap-4">
              <Camera className="w-5 h-5 text-white opacity-90" />
            </div>
          </div>

          {/* Chat Background Pattern */}
          <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
            <svg width="100%" height="100%">
              <pattern id="whatsapp-bg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#000" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#whatsapp-bg)" />
            </svg>
          </div>

          {/* Messages Container - Flex 1 with Smooth Scroll */}
          <div
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto px-3 py-2 pb-16 relative z-20 scroll-smooth transition-opacity duration-300 ${isResetting ? 'opacity-0' : 'opacity-100'}`}
          >
            <div className="space-y-2 min-h-full flex flex-col justify-end">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  style={{
                    animation: `slideInMessage 0.4s ease-out ${index * 0.15}s backwards`
                  }}
                >
                  <div
                    className={`max-w-[75%] rounded-lg transition-all duration-300 ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-[#DCF8C6] to-[#D1F0BD] rounded-br-none"
                        : "bg-gradient-to-br from-white to-[#F8FBFF] rounded-bl-none"
                    }`}
                  >
                    {/* Image Message - Reduced to 180px */}
                    {msg.image && (
                      <div className="relative">
                        <div className="relative w-full h-[180px] rounded-lg overflow-hidden">
                          <Image
                            src={msg.image}
                            alt="Fitness scan example"
                            fill
                            sizes="(max-width: 320px) 240px, 220px"
                            className="object-cover"
                            priority={index < 2}
                            quality={85}
                            style={{
                              animation: 'photoReveal 0.5s ease-out'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                          <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white">
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis Message - Compact */}
                    {msg.isAnalysis && (
                      <div className="px-3 py-2 space-y-2.5">
                        <p className="text-sm text-gray-800 font-medium">{msg.text}</p>

                        {/* Bodyfat Section */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border-l-3"
                          style={{ borderLeftColor: '#55F7B2', borderLeftWidth: '3px' }}
                        >
                          <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#0B6FE1' }}>
                            Grasa Corporal
                          </div>
                          <div className="text-base font-bold text-gray-900 mt-0.5">18-22%</div>
                        </div>

                        {/* Strengths */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                            ✓ Fortalezas
                          </div>
                          <div className="text-xs text-gray-700 leading-snug">
                            • Hombros desarrollados<br/>
                            • Cuádriceps fuertes
                          </div>
                        </div>

                        {/* Opportunities */}
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                            → Oportunidades
                          </div>
                          <div className="text-xs text-gray-700 leading-snug">
                            • Enfócate en pecho<br/>
                            • Mejora postura
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <p className="text-[10px] text-gray-500">{msg.timestamp}</p>
                          <span className="text-[10px]" style={{ color: '#0B6FE1' }}>✓✓</span>
                        </div>
                      </div>
                    )}

                    {/* Regular Text Message */}
                    {!msg.image && !msg.isAnalysis && msg.text && (
                      <div className="px-3 py-2">
                        <p className="text-sm text-gray-800">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className="text-[10px] text-gray-500">{msg.timestamp}</p>
                          {msg.sender === "user" && (
                            <span className="text-[10px]" style={{ color: '#0B6FE1' }}>✓✓</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {currentStep < conversation.length - 1 && messages.length > 0 && messages[messages.length - 1].sender === "user" && !isResetting && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-bl-none px-4 py-3 relative"
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#55F7B2',
                          animationDelay: "0ms"
                        }}
                      />
                      <div className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#55F7B2',
                          animationDelay: "150ms"
                        }}
                      />
                      <div className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: '#55F7B2',
                          animationDelay: "300ms"
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Bar - Sticky Bottom */}
          <div className="sticky bottom-0 left-0 right-0 z-30 px-2 py-2 flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(240, 240, 240, 0.95)',
              borderTop: '1px solid rgba(11, 111, 225, 0.1)'
            }}
          >
            <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <div className="flex-1 bg-white rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Mensaje"
                className="w-full bg-transparent text-sm outline-none text-gray-400"
                disabled
              />
            </div>
            <button className="p-2 hover:scale-110 transition-transform"
              style={{
                color: '#55F7B2'
              }}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes slideInMessage {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes photoReveal {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .iphone-container {
          animation: float 8s ease-in-out infinite;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
