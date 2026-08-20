import { testimonials } from "@/data/testimonials";
import { TestimonialCard } from "@/components/home/TestimonialCard";

export function TestimonialsMobile() {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4">
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          className="w-[85%] shrink-0 snap-center"
        />
      ))}
    </div>
  );
}
