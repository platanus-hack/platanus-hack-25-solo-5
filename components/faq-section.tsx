"use client"

import { MessageCircle, ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { FAQS, WHATSAPP_LINK } from "@/lib/constants"

export function FaqSection() {
  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Todo lo que necesitas saber sobre YourTrainer
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-xl px-6 glass-panel border border-white/10 hover:border-primary/20 transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6 [&[data-state=open]>svg]:rotate-180">
                <span className="font-semibold text-lg">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 text-center glass-panel rounded-2xl p-8 sm:p-12 border border-white/10">
          <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">¿Aún tienes preguntas?</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Chatea con YourTrainer directamente en WhatsApp para obtener respuestas al instante
          </p>
          <Button asChild className="bg-[#25D366] hover:bg-[#20BA5A] text-white h-12 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              Preguntar en WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
