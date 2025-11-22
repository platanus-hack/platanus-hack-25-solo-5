"use client"

import { cn } from "@/lib/utils"
import { forwardRef, AnchorHTMLAttributes, ButtonHTMLAttributes } from "react"

type CtaButtonProps =
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })

const CtaButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, CtaButtonProps>(
  ({ className, children, href, ...props }, ref) => {
    const Comp = href ? "a" : "button"

    return (
      <Comp
        className={cn(
          "relative inline-flex items-center justify-center gap-3",
          "rounded-2xl px-10 py-5 text-lg font-bold text-black",
          "border-2 overflow-hidden",
          "hover:scale-105",
          "active:scale-95 transition-all duration-300",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        style={{
          backgroundColor: '#55F7B2',
          borderColor: '#55F7B2',
        }}
        ref={ref as any}
        {...(href ? { href, ...props } : props)}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 opacity-30 shimmer-effect pointer-events-none" />

        <span className="relative flex items-center gap-3 z-10">
          {children}
        </span>
      </Comp>
    )
  }
)

CtaButton.displayName = "CtaButton"

export { CtaButton }
