"use client"

import Link from "next/link"
import Image from "next/image"
import { Dumbbell, MessageCircle, Instagram, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { WHATSAPP_LINK, BRAND } from "@/lib/constants"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t">
      {/* CTA Section */}
      <div className="w-full bg-gradient-to-br from-background via-background/95 to-muted/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <AnimateOnScroll animation="fade-in" duration={0.7}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Únete a miles transformando su físico con coaching IA
              </h2>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-in-up" duration={0.7} delay={0.2}>
              <div>
                <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white">
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    Comenzar en WhatsApp
                  </a>
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full bg-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll animation="fade-in-up" duration={0.7}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                {/* Branding Column */}
                <div className="col-span-2 md:col-span-1 space-y-4">
                  <Link href="/" className="flex items-center group">
                    <Image
                      src="/logo/login-transparent-inline.png"
                      alt="YourTrainer"
                      width={400}
                      height={80}
                      className="w-[180px] group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Coach de físico y entrenamiento potenciado por IA disponible 24/7 en WhatsApp
                  </p>
                  <p className="text-xs text-muted-foreground">
                    © {currentYear} YourTrainer
                  </p>
                </div>

                {/* Product Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Producto
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/#how-it-works"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cómo Funciona
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#capabilities"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Capacidades
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#pricing"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Precios
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#faq"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Preguntas
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Legal Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Legal
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/terms"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Términos de Servicio
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Política de Privacidad
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cookies"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Política de Cookies
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Connect Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Conecta
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://instagram.com/yourtrainer.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </a>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Contacto
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Disclaimer */}
            <AnimateOnScroll animation="fade-in" duration={0.7} delay={0.3}>
              <div className="mt-12 pt-8 border-t">
                <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto">
                  <strong>Descargo Médico:</strong> YourTrainer proporciona orientación de fitness y entrenamiento solo con fines informativos. No es un sustituto del consejo, diagnóstico o tratamiento médico profesional. Siempre consulta con un profesional de la salud calificado antes de comenzar cualquier nuevo programa de ejercicios, especialmente si tienes condiciones médicas o lesiones preexistentes. YourTrainer no es responsable de ninguna lesión o problema de salud que pueda ocurrir al seguir sus recomendaciones.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </footer>
  )
}
