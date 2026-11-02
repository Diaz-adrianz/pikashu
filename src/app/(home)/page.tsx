import { CtaSection } from './_components/cta-section';
import { FaqSection } from './_components/faq-section';
import { FeaturesSection } from './_components/features-section';
import { FleetSection } from './_components/fleet-section';
import { HeroSection } from './_components/hero-section';
import { HowItWorksSection } from './_components/how-it-works-section';
import { PopularRoutesSection } from './_components/popular-routes-section';

export default async function Page() {
  return (
    <>
      <HeroSection />
      <PopularRoutesSection />
      <HowItWorksSection />
      <FleetSection />
      <FeaturesSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
