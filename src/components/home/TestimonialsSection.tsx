import { TestimonialsBook } from "@/components/home/TestimonialsBook";

const heading = (
  <h2 className="mx-auto max-w-2xl text-center font-classical text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl">
    In our partners&rsquo;
    <br />
    own words
  </h2>
);

export function TestimonialsSection() {
  return (
    <section className="bg-bg-testimonials">
      <TestimonialsBook heading={heading} />
    </section>
  );
}
