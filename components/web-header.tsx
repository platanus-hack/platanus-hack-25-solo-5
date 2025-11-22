"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { WHATSAPP_LINK } from "@/lib/constants"

export function WebHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled
        ? "glass-header py-2"
        : "bg-transparent py-4"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-transform hover:scale-105 duration-300">
            <Image
              src="/logo/login-transparent-inline.png"
              alt="YourTrainer"
              width={400}
              height={80}
              className="w-[180px] sm:w-[220px]"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Cómo Funciona", "Capacidades", "Precios", "Preguntas"].map((item) => (
              <Link
                key={item}
                href={`/#${item.toLowerCase().replace(" ", "-").replace("ó", "o")}`}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              Contacto
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild className="hidden md:flex bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="gap-2">
                Comenzar
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 border-l border-white/10 glass-panel">
                <div className="flex flex-col h-full bg-background/80 backdrop-blur-xl">
                  {/* Header con padding */}
                  <SheetHeader className="px-6 py-6 border-b border-white/10">
                    <SheetTitle className="flex items-center">
                      <Image
                        src="/logo/login-transparent-inline.png"
                        alt="YourTrainer"
                        width={400}
                        height={80}
                        className="w-[200px]"
                        priority
                      />
                    </SheetTitle>
                  </SheetHeader>

                  {/* Contenido con scroll */}
                  <nav className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="flex flex-col gap-2">
                      {["Cómo Funciona", "Capacidades", "Precios", "Preguntas"].map((item) => (
                        <SheetClose key={item} asChild>
                          <Link
                            href={`/#${item.toLowerCase().replace(" ", "-").replace("ó", "o")}`}
                            className="text-lg font-medium text-foreground/80 hover:text-primary transition-all py-3 px-4 hover:bg-primary/5 rounded-xl flex items-center justify-between group"
                          >
                            {item}
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                          </Link>
                        </SheetClose>
                      ))}

                      <SheetClose asChild>
                        <Link
                          href="/contact"
                          className="text-lg font-medium text-foreground/80 hover:text-primary transition-all py-3 px-4 hover:bg-primary/5 rounded-xl flex items-center justify-between group"
                        >
                          Contacto
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                        </Link>
                      </SheetClose>
                    </div>
                  </nav>

                  {/* Footer con botón fijo */}
                  <div className="border-t border-white/10 px-6 py-8">
                    <SheetClose asChild>
                      <Button asChild className="w-full h-12 text-base bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl shadow-lg">
                        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="gap-2">
                          Comenzar en WhatsApp
                          <ChevronRight className="h-5 w-5" />
                        </a>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
