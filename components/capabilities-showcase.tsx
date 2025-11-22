"use client"

import { Camera, Video, TrendingUp, Dumbbell, MessageCircle, Utensils } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CtaButton } from "@/components/ui/cta-button"
import { CAPABILITIES, WHATSAPP_LINK } from "@/lib/constants"

const iconMap = {
  camera: Camera,
  video: Video,
  "trending-up": TrendingUp,
  dumbbell: Dumbbell,
  utensils: Utensils,
}

export function CapabilitiesShowcase() {
  return (
    <section id="capabilities" className="relative py-24 overflow-hidden">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 tech-grid-dots opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0B6FE1' }}>
            5 Capacidades con IA para Transformar Tu Físico
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            YourTrainer combina visión IA de vanguardia, ciencia del entrenamiento y nutrición personalizada para darte coaching completo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {CAPABILITIES.map((capability) => {
            const Icon = iconMap[capability.icon as keyof typeof iconMap]
            return (
              <Card key={capability.id} className="glass-tech border tilt-card transition-all duration-500 group relative overflow-hidden" style={{ borderColor: 'rgba(11, 111, 225, 0.3)' }}>
                <CardHeader className="relative z-10">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(11, 111, 225, 0.15)' }}>
                    <Icon className="w-6 h-6" style={{ color: '#0B6FE1' }} />
                  </div>
                  <CardTitle className="text-2xl">{capability.title}</CardTitle>
                  <CardDescription className="text-base pt-2">
                    {capability.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-6 min-h-[120px] flex items-center justify-center text-muted-foreground text-sm">
                    {capability.id === "body-scan" && (
                      <div className="text-center space-y-2">
                        <div className="font-mono text-xs">📸 Upload Photo → 🤖 AI Analysis</div>
                        <div className="text-xs">Bodyfat: 18-22% • Measurements • Strengths • Opportunities</div>
                      </div>
                    )}
                    {capability.id === "biomechanics" && (
                      <div className="text-center space-y-2">
                        <div className="font-mono text-xs">🎥 Send Video → 🤖 Form Check</div>
                        <div className="text-xs">Joint Alignment • ROM • Cues • Safety</div>
                      </div>
                    )}
                    {capability.id === "predictions" && (
                      <div className="text-center space-y-2">
                        <div className="font-mono text-xs">📊 Historical Data → 🔮 Future Forecast</div>
                        <div className="text-xs">8-12 Week Predictions • Visual Changes • Strength Gains</div>
                      </div>
                    )}
                    {capability.id === "training" && (
                      <div className="text-center space-y-2">
                        <div className="font-mono text-xs">🎯 Your Goals → 📋 Custom Plan</div>
                        <div className="text-xs">4-6 Week Blocks • Exercise Selection • Progressive Overload</div>
                      </div>
                    )}
                    {capability.id === "nutrition" && (
                      <div className="text-center space-y-2">
                        <div className="font-mono text-xs">🍽️ Body Scan + Goals → 🥗 Meal Plan</div>
                        <div className="text-xs">Macros Calculados • Días Entreno/Descanso • Comidas Culturales</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Todas las capacidades disponibles 24/7 directamente en WhatsApp
          </p>
          <CtaButton href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-6 w-6" />
            Probar en WhatsApp
          </CtaButton>
        </div>
      </div>
    </section>
  )
}
