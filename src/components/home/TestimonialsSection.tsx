"use client";

import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TestimonialsDesktop } from "@/components/home/TestimonialsDesktop";
import { TestimonialsMobile } from "@/components/home/TestimonialsMobile";

export function TestimonialsSection() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <section className="bg-bg-testimonials">
      <Container className="pt-24 md:pt-32 lg:pt-40">
        <Eyebrow>Testimonials</Eyebrow>
        <h2 className="mt-6 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl">
          What clients say after we ship.
        </h2>
      </Container>

      <div className="mt-14">
        {isDesktop ? <TestimonialsDesktop /> : <TestimonialsMobile />}
      </div>

      {isDesktop && <div aria-hidden="true" className="h-[70vh]" />}

      <div className="pb-24 md:pb-32 lg:pb-40" />
    </section>
  );
}
