"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { testimonials } from "@/data/testimonials";
import { TestimonialCard } from "@/components/home/TestimonialCard";

export function TestimonialsDesktop() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-70%"]);

  return (
    <div
      ref={wrapperRef}
      style={{ height: `${testimonials.length * 60}vh` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-[70vh] items-center overflow-hidden">
        <motion.div
          style={{ x, willChange: "transform" }}
          className="flex gap-8 pl-[8vw]"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              className="w-[380px] shrink-0 lg:w-[440px]"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
