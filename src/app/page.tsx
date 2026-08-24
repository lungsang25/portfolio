import { Hero } from "@/components/home/Hero";
import { ClientMarquee } from "@/components/home/ClientMarquee";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ClientMarquee />
      <FeaturesSection />
      <TestimonialsSection />
    </>
  );
}
