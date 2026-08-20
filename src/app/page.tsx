import { Hero } from "@/components/home/Hero";
import { ClientMarquee } from "@/components/home/ClientMarquee";
import { MobileAppsSection } from "@/components/home/MobileAppsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ClientMarquee />
      <MobileAppsSection />
      <TestimonialsSection />
    </>
  );
}
