"use client";

import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TestimonialsMobile } from "@/components/home/TestimonialsMobile";

const TestimonialsDesktop = dynamic(
  () => import("@/components/home/TestimonialsDesktop3D").then((mod) => mod.TestimonialsDesktop3D),
  { ssr: false }
);

const heading = (
  <h2 className="mx-auto max-w-2xl text-center font-classical text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl">
    In our partners&rsquo;
    <br />
    own words
  </h2>
);

export function TestimonialsSection() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <section className="bg-bg-testimonials">
        <TestimonialsDesktop heading={heading} />
      </section>
    );
  }

  return (
    <section className="flex min-h-screen flex-col justify-center bg-bg-testimonials">
      <Container className="pt-24 md:pt-32 lg:pt-40">{heading}</Container>

      <div className="mt-14">
        <TestimonialsMobile />
      </div>

      <div className="pb-24 md:pb-32 lg:pb-40" />
    </section>
  );
}
