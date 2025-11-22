"use client"

import { useState } from "react"
import { Check, Shield, MessageCircle, Sparkles } from "lucide-react"
import { CtaButton } from "@/components/ui/cta-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PRICING, WHATSAPP_LINK } from "@/lib/constants"

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly")

  const features = [
    "Escaneos Corporales Ilimitados (Vision 4.0)",
    "Análisis Biomecánico Ilimitado",
    "Planes de Entrenamiento Personalizados",
    "Predicciones y Seguimiento de Progreso",
    "Acceso 24/7 por WhatsApp",
    "Guía Nutricional y Macros",
    "Videos de Corrección de Técnica",
    "Soporte para Prevención de Lesiones",
  ]

  const getPriceDisplay = () => {
    switch (billingPeriod) {
      case "monthly":
        return {
          amount: PRICING.monthly,
          period: "month",
          total: PRICING.monthly,
          savings: null,
        }
      case "quarterly":
        return {
          amount: Math.round(PRICING.quarterly / 3),
          period: "month",
          total: PRICING.quarterly,
          savings: PRICING.savings.quarterly,
        }
      case "yearly":
        return {
          amount: Math.round(PRICING.yearly / 12),
          period: "month",
          total: PRICING.yearly,
          savings: PRICING.savings.yearly,
        }
    }
  }

  const priceInfo = getPriceDisplay()

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -z-10" />

      <div className="relative container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Acceso Premium <span className="text-gradient">Todo Incluido</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para transformar tu físico, en un plan simple
          </p>
        </div>

        <div className="mb-12 flex justify-center">
          <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as typeof billingPeriod)}>
            <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50 p-1">
              <TabsTrigger value="monthly" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Mensual</TabsTrigger>
              <TabsTrigger value="quarterly" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Trimestral
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 h-5 bg-green-100 text-green-700 hover:bg-green-100">-15%</Badge>
              </TabsTrigger>
              <TabsTrigger value="yearly" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Anual
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 h-5 bg-green-100 text-green-700 hover:bg-green-100">-25%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="max-w-md mx-auto perspective-1000">
          <Card className="glass-panel border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="text-center relative z-10 pb-2">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Plan Premium
              </div>
              <CardTitle className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold tracking-tight">${priceInfo.amount}</span>
                <span className="text-xl text-muted-foreground">/{priceInfo.period === 'month' ? 'mes' : priceInfo.period}</span>
              </CardTitle>
              {priceInfo.savings && (
                <CardDescription className="text-base font-medium text-green-600 dark:text-green-400 mt-2">
                  Ahorras un {priceInfo.savings}% con el plan {billingPeriod === "quarterly" ? "trimestral" : "anual"}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="relative z-10 pt-6">
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/50 mb-2">
                <Shield className="w-5 h-5 shrink-0 text-primary" />
                <span>Garantía de reembolso de 7 días. Sin preguntas.</span>
              </div>
            </CardContent>

            <CardFooter className="relative z-10 pb-8">
              <CtaButton href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-full h-12 text-base shadow-lg shadow-primary/20">
                <MessageCircle className="h-5 w-5 mr-2" />
                Comenzar Ahora
              </CtaButton>
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Sin tarjeta de crédito para comenzar • Cancela en cualquier momento
        </p>
      </div>
    </section>
  )
}
