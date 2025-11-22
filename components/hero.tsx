"use client"

import { Badge } from "@/components/ui/badge"
import { CtaButton } from "@/components/ui/cta-button"
import { Check, MessageCircle, Sparkles } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { IPhoneWhatsAppMockup } from "@/components/iphone-whatsapp-mockup"
import { WHATSAPP_LINK, BRAND } from "@/lib/constants"

export function Hero() {
  return (
    <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 overflow-hidden">
      {/* Modern Gradient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-0" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/20 rounded-full blur-[100px] -z-10 opacity-30" />

      <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
        {/* Left Column - Content */}
        <div className="space-y-8 text-center lg:text-left">
          {/* Badge */}
          <AnimateOnScroll animation="fade-in-down" duration={0.7}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 border-none">
                NUEVO
              </Badge>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground/80">Coaching Fitness por WhatsApp</span>
            </div>
          </AnimateOnScroll>

          {/* Main Heading */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7} delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
              Tu AI Personal Trainer en<br />
              <span className="inline-block bg-[#55F7B2] text-black px-4 py-2 rounded-lg"> WhatsApp</span>
            </h1>
          </AnimateOnScroll>

          {/* Subheading */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7} delay={0.2}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {BRAND.description}
            </p>
          </AnimateOnScroll>

          {/* Features */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7} delay={0.3}>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6">
              {[
                "Análisis de Físico por Foto",
                "Corrección de Técnica por Video",
                "Planes 100% Personalizados"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/80 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>

          {/* CTA Button */}
          <AnimateOnScroll animation="fade-in-up" duration={0.7} delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <CtaButton href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                <MessageCircle className="h-6 w-6 mr-2" />
                Comenzar Ahora
              </CtaButton>
              <p className="text-sm text-muted-foreground mt-4 sm:mt-0 sm:ml-4">
                <span className="block font-medium text-foreground">Prueba Gratuita</span>
                Sin tarjeta de crédito
              </p>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Right Column - iPhone Mockup */}
        <AnimateOnScroll animation="fade-in-up" duration={0.7} delay={0.5}>
          <div className="relative perspective-1000">
            <div className="relative z-10 transform transition-transform duration-700 hover:rotate-y-6 hover:rotate-x-6 preserve-3d">
              <IPhoneWhatsAppMockup />
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10" />

            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 p-4 bg-background/95 backdrop-blur-md border border-border shadow-lg rounded-2xl animate-float-particles animation-delay-100 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-foreground/60">Progreso</p>
                  <p className="font-bold text-green-600">+15% Fuerza</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 p-4 bg-background backdrop-blur-md border border-border shadow-lg rounded-2xl animate-float-particles animation-delay-500 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-foreground/60">Coach IA</p>
                  <p className="font-bold text-foreground">¡Buen trabajo!</p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
