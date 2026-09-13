"use client";

import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { SocialProof } from "@/components/marketing/social-proof";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeaturesBento } from "@/components/marketing/features-bento";
import { InteractiveDemo } from "@/components/marketing/interactive-demo";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { CTABanner } from "@/components/marketing/cta-banner";
import { Footer } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Nav />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <HowItWorks />
        <FeaturesBento />
        <InteractiveDemo />
        <Pricing />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}