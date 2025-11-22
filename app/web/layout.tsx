import type React from "react"
import { WebHeader } from "@/components/web-header"
import { Footer } from "@/components/footer"

export default function WebLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <WebHeader />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}
