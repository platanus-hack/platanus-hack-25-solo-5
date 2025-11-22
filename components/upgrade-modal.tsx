"use client"

import { useState } from "react"
import { X, Check, Info, Shield } from "lucide-react"
import { SiOpenai, SiGooglegemini } from "react-icons/si"
import {
  FaPaypal,
  FaApplePay,
  FaGooglePay,
  FaCcVisa,
  FaCcMastercard,
  FaCcDiscover,
  FaCcAmex,
  FaCreditCard,
} from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  triggerReason?: "limit_reached" | "manual"
}

export function UpgradeModal({ isOpen, onClose, triggerReason = "manual" }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"1month" | "3months" | "1year">("1year")
  const [isLoading, setIsLoading] = useState(false)
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession)

  if (!isOpen) return null

  const handleUpgrade = async () => {
    try {
      setIsLoading(true)

      const priceIdMap = {
        "1month": process.env.NEXT_PUBLIC_STRIPE_PRICE_1_MONTH,
        "3months": process.env.NEXT_PUBLIC_STRIPE_PRICE_3_MONTHS,
        "1year": process.env.NEXT_PUBLIC_STRIPE_PRICE_1_YEAR,
      }

      const priceId = priceIdMap[selectedPlan]
      if (!priceId) {
        toast.error("Stripe is not configured. Please contact support.")
        return
      }

      const intervalMap = {
        "1month": "month",
        "3months": "3months",
        "1year": "year",
      }

      const { url } = await createCheckoutSession({
        priceId,
        interval: intervalMap[selectedPlan],
      })

      if (!url) {
        toast.error("Failed to create checkout session. Please try again.")
        return
      }

      // Redirigir a Stripe Checkout usando la URL del session
      window.location.href = url
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast.error("Error creating checkout session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <SiOpenai className="h-4 w-4" />,
      label: "Unlimited",
      description: "Access to OpenAI GPT-5",
    },
    {
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
      ),
      label: "Access to",
      description: "DeepSeek V3",
    },
    {
      icon: <SiGooglegemini className="h-4 w-4" />,
      label: "Access to",
      description: "Google Gemini",
    },
    {
      icon: (
        <div className="h-4 w-4 rounded bg-orange-500 flex items-center justify-center text-white text-[8px] font-bold">
          A
        </div>
      ),
      label: "Access to",
      description: "Claude 3.5 Sonnet",
    },
    {
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      label: "Unlock",
      description: "Advanced Tools",
      hasInfo: true,
    },
    {
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      ),
      label: "3,600",
      description: "Image Generations per month",
    },
    {
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" y1="2" x2="12" y2="12" />
        </svg>
      ),
      label: "No Limits",
      description: "",
      hasInfo: true,
    },
  ]

  const plans = [
    { id: "1month" as const, duration: "1 Month", price: "$19.99", perDay: "$0.67" },
    { id: "3months" as const, duration: "3 Months", price: "$39.99", perDay: "$0.44", badge: "Most Popular" },
    { id: "1year" as const, duration: "1 Year", price: "$59.99", perDay: "$0.16", badge: "Save %75" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background shadow-2xl flex flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
        {/* Left side - Features (hidden on mobile) */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-slate-900 text-white p-6 lg:p-8 overflow-y-auto items-center">
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between text-xs font-medium pb-3 border-b border-slate-700">
              <span className="text-slate-400">Features</span>
              <div className="flex gap-8">
                <span className="text-slate-400">Free</span>
                <span className="text-white">Pro</span>
              </div>
            </div>

            <div className="space-y-0">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between py-3 px-3",
                    index % 2 === 0 ? "bg-slate-800/50" : "bg-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-slate-400">{feature.icon}</div>
                    <div className="text-sm">
                      <span className="text-slate-400">{feature.label}</span>{" "}
                      <span className="text-white font-medium">{feature.description}</span>
                      {feature.hasInfo && <Info className="inline-block h-3 w-3 ml-1 text-slate-500" />}
                    </div>
                  </div>
                  <div className="flex gap-8 items-center">
                    <X className="h-4 w-4 text-slate-600" />
                    <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <button className="text-sm text-white underline hover:text-slate-300 transition-colors">
                View all plans to learn more
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Pricing */}
        <div className="w-full lg:w-1/2 bg-background p-6 lg:p-8 overflow-y-auto relative max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2 text-purple-400">Pricing Plan</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {triggerReason === "limit_reached"
                  ? "You've reached your free message limit"
                  : "Upgrade to Chattia Pro"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {triggerReason === "limit_reached"
                  ? "Upgrade to Pro for unlimited messages and access to all features"
                  : "Unlock the full potential of Chattia"}
              </p>
            </div>

            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "w-full p-4 border-2 transition-all text-left relative",
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground/30",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          selectedPlan === plan.id ? "border-primary" : "border-muted-foreground/30",
                        )}
                      >
                        {selectedPlan === plan.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{plan.duration}</div>
                        <div className="text-sm text-muted-foreground">{plan.price}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{plan.perDay}</div>
                      <div className="text-sm text-muted-foreground">Per Day</div>
                    </div>
                  </div>
                  {plan.badge && (
                    <div
                      className={cn(
                        "absolute -top-2 right-4 px-3 py-0.5 text-xs font-medium",
                        plan.id === "3months" ? "bg-orange-200 text-orange-800 dark:bg-orange-300 dark:text-orange-900" : "bg-emerald-200 text-emerald-800 dark:bg-emerald-300 dark:text-emerald-900",
                      )}
                    >
                      {plan.badge}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium text-base"
            >
              {isLoading ? "Processing..." : "Continue"}
            </Button>

            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>
                By continuing an account, you agree to our{" "}
                <a href="#" className="underline hover:text-foreground">
                  Terms of Service
                </a>
                ,{" "}
                <a href="#" className="underline hover:text-foreground">
                  Privacy & Cookie Statement
                </a>
                , and{" "}
                <a href="#" className="underline hover:text-foreground">
                  Refund & Cancellation Policy
                </a>
                .
              </p>
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Shield className="h-3 w-3" />
                <span className="font-medium">Pay safe & secure</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <FaPaypal className="h-5 w-5 text-[#003087]" />
              <FaApplePay className="h-5 w-6 text-foreground" />
              <FaGooglePay className="h-5 w-6 text-foreground" />
              <FaCcVisa className="h-5 w-6 text-[#1A1F71]" />
              <FaCcMastercard className="h-5 w-6 text-[#EB001B]" />
              <FaCreditCard className="h-5 w-6 text-[#0099DF]" />
              <FaCcDiscover className="h-5 w-6 text-[#FF6000]" />
              <FaCcAmex className="h-5 w-6 text-[#006FCF]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
