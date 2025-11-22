"use client"

import { Camera, Video, TrendingUp, Trophy, Dumbbell, Utensils, MessageCircle } from "lucide-react"
import { CtaButton } from "@/components/ui/cta-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WHATSAPP_LINK } from "@/lib/constants"

export function FeaturesBenefits() {
  const features = [
    {
      icon: Camera,
      title: "Escaneo Corporal Vision 4.0",
      description: "Sube fotos y obtén un análisis detallado de tu físico con % de grasa corporal, medidas, fortalezas y oportunidades de mejora.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Video,
      title: "Análisis Biomecánico",
      description: "Envía videos de ejercicios y recibe correcciones expertas con indicaciones simples para prevenir lesiones y maximizar ganancias.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Trophy,
      title: "Registro de PRs y Progreso",
      description: "Trackea automáticamente tus Personal Records en cada ejercicio. YourTrainer detecta cuando rompes un récord y celebra tus logros. Ve tu progreso real en fuerza y volumen.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: TrendingUp,
      title: "Modelo Predictivo de Físico",
      description: "Obtén pronósticos realistas de progreso basados en tus escaneos, registros de entrenamiento y datos biomecánicos para las próximas 8-12 semanas.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Dumbbell,
      title: "Entrenamiento Periodizado con IA",
      description: "Recibe planes de entrenamiento completamente personalizados con selección de ejercicios, series, repeticiones y progresiones adaptadas a tus objetivos.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Utensils,
      title: "Plan Nutricional Personalizado",
      description: "Obtén macros calculados y ejemplos de comidas adaptados a tu cultura, objetivo y días de entrenamiento para complementar tu plan fitness.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ]

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0B6FE1' }}>
            Transforma Tu Físico con Tecnología de Vanguardia
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            6 capacidades potenciadas por IA que funcionan juntas para darte resultados reales
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="glass-tech border tilt-card transition-all duration-500 group relative overflow-hidden"
                style={{ borderColor: 'rgba(11, 111, 225, 0.3)' }}
              >
                <CardHeader className="text-center relative z-10">
                  <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Todo disponible directamente en WhatsApp, sin complicaciones
          </p>
          <CtaButton href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-6 w-6" />
            Comenzar Ahora en WhatsApp
          </CtaButton>
        </div>
      </div>
    </section>
  )
}
