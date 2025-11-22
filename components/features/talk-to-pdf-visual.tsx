"use client"

import { useEffect, useState } from "react"
import { FileText, Send, Sparkles } from "lucide-react"

export function TalkToPdfVisual() {
  const [step, setStep] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const fullText = "Summarize this text"

  // Reset text when transitioning to step 2
  useEffect(() => {
    if (step === 2) {
      setTypedText("")
    }
  }, [step])

  useEffect(() => {
    // Sequence: drag animation (0) -> drop zone filled (1) -> typing (2) -> send button press (3) -> summary (4) -> reset
    const timers: NodeJS.Timeout[] = []

    if (step === 0) {
      // Animate mouse cursor dragging file
      const animationDuration = 2000 // 2 seconds for drag animation
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / animationDuration, 1)

        // Move from top-left to center of drop zone
        setMousePosition({
          x: -100 + (progress * 150), // Move from -100 to 50 (center)
          y: -80 + (progress * 80),   // Move from -80 to 0 (center)
        })

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          timers.push(setTimeout(() => setStep(1), 300))
        }
      }

      animate()
    } else if (step === 1) {
      timers.push(setTimeout(() => setStep(2), 800))
    } else if (step === 2) {
      // Typing animation
      if (typedText.length < fullText.length) {
        timers.push(setTimeout(() => {
          setTypedText(prev => fullText.slice(0, prev.length + 1))
        }, 80))
      } else if (typedText.length === fullText.length) {
        // Finished typing, move to send button press
        timers.push(setTimeout(() => setStep(3), 300))
      }
    } else if (step === 3) {
      timers.push(setTimeout(() => setStep(4), 400))
    } else if (step === 4) {
      timers.push(setTimeout(() => setStep(0), 3500))
    }

    return () => timers.forEach(clearTimeout)
  }, [step, typedText, fullText])

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-muted/40">
      <div className="w-full max-w-2xl space-y-6">
        {/* Drop Zone - Always visible in steps 0 and 1 */}
        {(step === 0 || step === 1) && (
          <div className="relative">
            {/* Drop Zone */}
            <div className={`w-full h-48 border-2 border-dashed rounded-2xl flex items-center justify-center transition-all duration-500 ${
              step === 0 ? 'border-muted-foreground/30 bg-muted/30' : 'border-primary/50 bg-primary/5'
            }`}>
              {step === 0 && (
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Drop your PDF here</p>
                </div>
              )}

              {step === 1 && (
                <div className="bg-card border shadow-sm rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium">Document.pdf</p>
                    <p className="text-sm text-muted-foreground">PDF · 150 KB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dragging Document with Mouse Cursor - Step 0 only */}
            {step === 0 && (
              <div
                className="absolute pointer-events-none transition-all duration-100"
                style={{
                  left: `${mousePosition.x}px`,
                  top: `${mousePosition.y}px`,
                }}
              >
                <div className="relative">
                  {/* Document Card */}
                  <div className="bg-card border shadow-lg rounded-xl p-3 flex items-center gap-3 -rotate-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Document.pdf</p>
                      <p className="text-xs text-muted-foreground">PDF · 150 KB</p>
                    </div>
                  </div>

                  {/* Mouse Cursor */}
                  <div className="absolute -top-2 -left-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="currentColor" stroke="white" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Interface - Always visible */}
        <div className="space-y-4">
          {/* Chat Input */}
          <div className="bg-card border rounded-3xl px-6 py-4 flex items-center gap-3 shadow-sm">
            <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="flex-1">
              <p className="text-sm md:text-base text-foreground">
                {typedText}
                {step === 2 && <span className="animate-pulse">|</span>}
              </p>
            </div>
            <button className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              step >= 3 ? 'bg-foreground text-background scale-95' : step >= 2 && typedText === fullText ? 'bg-foreground text-background' : 'text-muted-foreground'
            }`}>
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Summary Response - Step 4 */}
          {step >= 4 && (
            <div className="transition-all duration-700 animate-fade-in pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 bg-card border rounded-2xl px-5 py-4 shadow-sm">
                  <p className="text-sm text-foreground leading-relaxed">
                    This document discusses machine learning fundamentals, covering supervised learning, neural networks, and practical AI applications in modern systems.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
