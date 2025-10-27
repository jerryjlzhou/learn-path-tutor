import { Hero } from '@/components/Hero';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { HowItWorks } from '@/components/HowItWorks';
import { ServicesSection } from '@/components/ServicesSection';
import { AboutSection } from '@/components/AboutSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export function LandingPage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <TestimonialsCarousel />
      <HowItWorks />
      <ServicesSection />
      <CTASection />
      <Footer />
    </>
  );
}