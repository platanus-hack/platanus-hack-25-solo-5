"use client"

import { MessageCircle, Sparkles } from "lucide-react"
import { CtaButton } from "@/components/ui/cta-button"
import { Badge } from "@/components/ui/badge"
import { WHATSAPP_LINK } from "@/lib/constants"

export function CtaFinal() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background" />
      <div className="absolute inset-0 holographic opacity-30" />

      <div className="relative container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center scanline-overlay">
          <Badge className="mb-6" style={{ backgroundColor: '#55F7B2', color: '#000' }}>
            <Sparkles className="w-3 h-3 mr-1" />
            Únete a Miles Transformando Su Físico
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#0B6FE1' }}>
            Comienza Tu Transformación Hoy
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Obtén coaching personalizado con IA, análisis experto de técnica y planes de entrenamiento personalizados—todo por WhatsApp. Sin apps, sin complicaciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CtaButton href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-6 h-6" />
              Mensaje a YourTrainer en WhatsApp
            </CtaButton>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Sin tarjeta de crédito • Garantía de 7 días • Cancela cuando quieras
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="glass-tech p-4 rounded-lg border transition-all" style={{ borderColor: 'rgba(11, 111, 225, 0.2)' }}>
            <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#0B6FE1' }}>24/7</div>
            <div className="text-sm text-muted-foreground">Disponible en WhatsApp</div>
          </div>
          <div className="glass-tech p-4 rounded-lg border transition-all" style={{ borderColor: 'rgba(11, 111, 225, 0.2)' }}>
            <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#0B6FE1' }}>4</div>
            <div className="text-sm text-muted-foreground">Capacidades con IA</div>
          </div>
          <div className="glass-tech p-4 rounded-lg border transition-all" style={{ borderColor: 'rgba(11, 111, 225, 0.2)' }}>
            <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#55F7B2' }}>∞</div>
            <div className="text-sm text-muted-foreground">Análisis Ilimitado</div>
          </div>
          <div className="glass-tech p-4 rounded-lg border transition-all" style={{ borderColor: 'rgba(11, 111, 225, 0.2)' }}>
            <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#0B6FE1' }}>$49</div>
            <div className="text-sm text-muted-foreground">Por Mes</div>
          </div>
        </div>
      </div>
    </section>
  )
}
