"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { testimonials, type Testimonial } from "@/data/testimonials";
import { TestimonialCard } from "@/components/home/TestimonialCard";

// Each card spends more of the total scroll in flight, and the next one
// starts well before the previous exits, so several overlap at once instead
// of leaving gaps of empty stage between crossings.
const TRAVEL = 0.6;
const START_MIN = -0.15;
const STEP = 0.3;

// Cards cross the stage left to right, rising gently as they go. Each lane sets
// where it sits vertically (laneVH) and how far it climbs on the way (riseVH),
// hand-placed so passes overlap without stacking on one another.
const ENTER_VW = -80;
const EXIT_VW = 80;

const LANES = [
  { laneVH: -18, riseVH: 14, rotate: -5, width: "w-[380px]" },
  { laneVH: 10, riseVH: 16, rotate: 4, width: "w-[340px]" },
  { laneVH: -6, riseVH: 11, rotate: -3, width: "w-[400px]" },
  { laneVH: 20, riseVH: 13, rotate: 5, width: "w-[320px]" },
];

function FlowCard({
  testimonial,
  progress,
  start,
  lane,
}: {
  testimonial: Testimonial;
  progress: MotionValue<number>;
  start: number;
  lane: (typeof LANES)[number];
}) {
  const p = useTransform(progress, [start, start + TRAVEL], [0, 1], {
    clamp: true,
  });

  const x = useTransform(p, [0, 1], [`${ENTER_VW}vw`, `${EXIT_VW}vw`]);
  const y = useTransform(
    p,
    [0, 1],
    [`${lane.laneVH}vh`, `${lane.laneVH - lane.riseVH}vh`]
  );
  const scale = useTransform(p, [0, 0.5, 1], [0.68, 1, 0.76]);
  const opacity = useTransform(p, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        style={{ x, y, scale, rotate: lane.rotate, opacity, willChange: "transform" }}
        className={`pointer-events-auto ${lane.width}`}
      >
        <TestimonialCard testimonial={testimonial} />
      </motion.div>
    </div>
  );
}

export function TestimonialsDesktop() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const cards = LANES.map((lane, i) => ({
    lane,
    testimonial: testimonials[i % testimonials.length],
    start: START_MIN + STEP * i,
  }));

  return (
    <div ref={wrapperRef} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {cards.map(({ lane, testimonial, start }, i) => (
          <FlowCard
            key={`${testimonial.id}-${i}`}
            testimonial={testimonial}
            progress={scrollYProgress}
            start={start}
            lane={lane}
          />
        ))}
      </div>
    </div>
  );
}
