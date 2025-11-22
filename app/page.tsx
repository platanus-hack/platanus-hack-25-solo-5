import { Hero } from "@/components/hero"
import { FeaturesBenefits } from "@/components/features-benefits"
import { HowItWorks } from "@/components/how-it-works"
import { CapabilitiesShowcase } from "@/components/capabilities-showcase"
import { UserTestimonials } from "@/components/user-testimonials"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { CtaFinal } from "@/components/cta-final"
import { WebHeader } from "@/components/web-header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <WebHeader />
      <main className="pt-16">
        <Hero />
        <FeaturesBenefits />
        <HowItWorks />
        <CapabilitiesShowcase />
        <UserTestimonials />
        <PricingSection />
        <FaqSection />
        <CtaFinal />
      </main>
      <Footer />
    </div>
  )
}
