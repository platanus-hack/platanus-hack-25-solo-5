import { Mail, MessageCircle, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WHATSAPP_LINK } from "@/lib/constants"

export const metadata = {
  title: "Contacto | YourTrainer",
  description: "Ponte en contacto con YourTrainer. Estamos aquí para ayudarte con tus preguntas sobre fitness y entrenamiento.",
}

export default function ContactPage() {
  return (
    <div className="container max-w-4xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contáctanos</h1>
        <p className="text-lg text-muted-foreground">
          Estamos aquí para ayudarte. Elige tu método preferido de contacto.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <MessageCircle className="w-12 h-12 text-[#25D366] mb-4" />
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>
              Chatea con nosotros directamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Abrir WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Instagram className="w-12 h-12 text-pink-600 mb-4" />
            <CardTitle>Instagram</CardTitle>
            <CardDescription>
              Síguenos en redes sociales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a href="https://instagram.com/yourtrainer.ai" target="_blank" rel="noopener noreferrer">
                Visitar Instagram
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Mail className="w-12 h-12 text-primary mb-4" />
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Envíanos un correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a href="mailto:support@yourtrainer.ai">
                Enviar Email
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Horario de Atención</CardTitle>
          <CardDescription>
            Nuestro equipo está disponible para ayudarte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>YourTrainer IA:</strong> Disponible 24/7 en WhatsApp
          </p>
          <p className="text-sm">
            <strong>Soporte Humano:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (EST)
          </p>
          <p className="text-sm text-muted-foreground">
            Respondemos todos los emails dentro de 24-48 horas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
