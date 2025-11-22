"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquareQuote } from "lucide-react"
import Image from "next/image"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { TESTIMONIALS, WHATSAPP_LINK } from "@/lib/constants"

export function UserTestimonials() {
  const [showMore, setShowMore] = useState(false)

  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7}>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                <MessageSquareQuote className="h-4 w-4" />
                <span className="text-sm font-medium">Historias de Éxito</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Transformaciones Reales, Resultados Reales
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Mira lo que los usuarios están logrando con el coaching potenciado por IA de YourTrainer
              </p>
            </div>
          </AnimateOnScroll>

          {/* Testimonials Grid with Fade Effect */}
          <AnimateOnScroll animation="fade-in" duration={0.7} delay={0.2}>
            <div className="relative">
              <div
                className={`columns-1 md:columns-3 gap-6 ${!showMore ? 'max-h-[1000px] overflow-hidden' : ''}`}
              >
                {TESTIMONIALS.map((testimonial) => (
                  <div
                    key={testimonial.name}
                    className="mb-6 break-inside-avoid bg-background rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        src={`https://i.pravatar.cc/150?img=${testimonial.avatar}`}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fade overlay when collapsed */}
              {!showMore && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
              )}
            </div>
          </AnimateOnScroll>

          {/* Show More Button */}
          <div className="text-center">
            <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#20BA5A] text-white">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Comienza Tu Transformación en WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
