import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google"
import { Providers } from "./providers"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700"],
})

export const metadata: Metadata = {
  title: "YourTrainer - Coach de Fitness con IA en WhatsApp",
  description: "Obtén planes de entrenamiento personalizados, análisis de escaneo corporal y corrección de técnica por WhatsApp. Tu coach de físico con IA 24/7 para resultados reales.",
  keywords: ["coach fitness IA", "entrenador personal", "escaneo corporal", "planes de entrenamiento", "coach WhatsApp", "análisis de físico", "corrección de técnica"],
  openGraph: {
    title: "YourTrainer - Coach de Fitness con IA en WhatsApp",
    description: "Obtén planes de entrenamiento personalizados, análisis de escaneo corporal y corrección de técnica por WhatsApp.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <body className={plusJakarta.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
