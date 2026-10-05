import { TestimonialsBook } from "@/components/home/TestimonialsBook";

const heading = (
  <h2 className="mx-auto max-w-4xl select-none text-center font-mono text-sm uppercase leading-[1.2] tracking-widest text-foreground md:text-base">
    In our partners&rsquo; own words
  </h2>
);

export function TestimonialsSection() {
  return (
    <section className="bg-bg-testimonials">
      <TestimonialsBook heading={heading} />
    </section>
  );
}
