import { AgencySection } from "@/components/AgencySection";
import { AIChatDemo } from "@/components/AIChatDemo";
import { BeforeAfter } from "@/components/BeforeAfter";
import { FAQ } from "@/components/FAQ";
import { Features } from "@/components/Features";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { PainSection } from "@/components/PainSection";
import { Pricing } from "@/components/Pricing";
import { ReportSection } from "@/components/ReportSection";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { TrialSection } from "@/components/TrialSection";
import { TrustStrip } from "@/components/TrustStrip";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <PainSection />
        <BeforeAfter />
        <Features />
        <ReportSection />
        <AgencySection />
        <HowItWorks />
        <AIChatDemo />
        <TrialSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
