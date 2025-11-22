import { Hero } from "@/components/hero"
import { FeaturesBenefits } from "@/components/features-benefits"
import { HowItWorks } from "@/components/how-it-works"
import { UserTestimonials } from "@/components/user-testimonials"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { CtaFinal } from "@/components/cta-final"

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesBenefits />
      <HowItWorks />
      <UserTestimonials />
      <PricingSection />
      <FaqSection />
      <CtaFinal />
    </>
  )
}
