"use client"

import { Send, Bot, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WHATSAPP_LINK } from "@/lib/constants"

export function HowItWorks() {
  const steps = [
    {
      icon: Send,
      title: "Envía",
      description: "Comparte fotos o videos por WhatsApp",
      details: "Simplemente envía un mensaje a YourTrainer con fotos de tu físico o videos de tus ejercicios. Sin descargas de apps ni configuraciones complicadas.",
    },
    {
      icon: Bot,
      title: "Analiza",
      description: "YourTrainer IA analiza tu físico y técnica",
      details: "Obtén análisis detallado de composición corporal, correcciones de forma e insights personalizados en segundos usando visión IA avanzada.",
    },
    {
      icon: TrendingUp,
      title: "Transforma",
      description: "Recibe planes personalizados y feedback al instante",
      details: "Recibe planes de entrenamiento personalizados, predicciones de progreso y soporte continuo para lograr tus objetivos fitness de forma segura y efectiva.",
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple. Efectivo. Siempre Disponible.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Obtén coaching fitness de nivel elite a través de WhatsApp en tres pasos simples
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                  <step.icon className="w-12 h-12 text-primary" />
                </div>

                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground mb-3">{step.description}</p>
                <p className="text-sm text-muted-foreground/80">{step.details}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="text-lg px-8 bg-[#25D366] hover:bg-[#20BA5A] text-white">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              Comenzar en WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
