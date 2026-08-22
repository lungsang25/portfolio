"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { testimonials } from "@/data/testimonials";
import { TestimonialCard } from "@/components/home/TestimonialCard";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Each card's own crossing takes TRAVEL_DUR timeline-units; the next card
// starts STEP_DUR units later. STEP_DUR is kept small relative to TRAVEL_DUR
// so overlapping cards are close together in their journey — and therefore
// close together on screen — rather than showing up at opposite edges.
const TRAVEL_DUR = 3;
const STEP_DUR = 0.9;
// How far a card travels left-to-right, as a fraction of viewport width.
// Kept just wide enough that cards still start/end fully off-screen.
const REACH_VW = 0.72;
// Every card's "natural" start (i * STEP_DUR) is pulled back by this much so
// the first couple are already mid-flight — some even past the centre —
// right when the section is reached, instead of the stage being empty.
const LEAD_IN = TRAVEL_DUR * 0.5;

const FADE_IN_FRAC = 0.15;
const FADE_OUT_FRAC = 0.86;

// Cards cross the stage left to right in 3D, rising gently and swinging
// toward the viewer (z) as they pass through the centre. Each lane sets
// where it sits vertically (laneVH), how far it climbs (riseVH), and its
// resting photo-like tilt (tilt) — hand-placed so passes don't collide.
const LANES = [
  { laneVH: -18, riseVH: 14, tilt: -5, width: "w-[380px]" },
  { laneVH: 10, riseVH: 16, tilt: 4, width: "w-[340px]" },
  { laneVH: -6, riseVH: 11, tilt: -3, width: "w-[400px]" },
  { laneVH: 20, riseVH: 13, tilt: 5, width: "w-[320px]" },
];

type Path = {
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
  midX: number;
  midY: number;
};

// Samples where a card sits at an arbitrary point (0–1) of its full
// left-to-right crossing, so a card whose start is "before scroll begins"
// can be dropped in already part-way through instead of fully off-screen.
function sampleAt(fraction: number, path: Path) {
  const { fromX, toX, fromY, toY, midX, midY } = path;
  const inFirstHalf = fraction <= 0.5;
  const localT = inFirstHalf ? fraction / 0.5 : (fraction - 0.5) / 0.5;
  const lerp = (a: number, b: number) => a + (b - a) * localT;

  const start = inFirstHalf
    ? { x: fromX, y: fromY, z: -700, rotateY: -55, rotateX: 10, scale: 0.5 }
    : { x: midX, y: midY, z: 80, rotateY: 0, rotateX: 0, scale: 1.08 };
  const end = inFirstHalf
    ? { x: midX, y: midY, z: 80, rotateY: 0, rotateX: 0, scale: 1.08 }
    : { x: toX, y: toY, z: -700, rotateY: 55, rotateX: -10, scale: 0.5 };

  const opacity =
    fraction < FADE_IN_FRAC
      ? fraction / FADE_IN_FRAC
      : fraction > FADE_OUT_FRAC
        ? (1 - fraction) / (1 - FADE_OUT_FRAC)
        : 1;

  return {
    x: lerp(start.x, end.x),
    y: lerp(start.y, end.y),
    z: lerp(start.z, end.z),
    rotateY: lerp(start.rotateY, end.rotateY),
    rotateX: lerp(start.rotateX, end.rotateX),
    scale: lerp(start.scale, end.scale),
    opacity: Math.max(0, Math.min(1, opacity)),
  };
}

export function TestimonialsDesktop() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useGSAP(
    () => {
      const cards = cardRefs.current.filter(
        (el): el is HTMLDivElement => el !== null
      );
      if (!cards.length) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.35,
          pin: stageRef.current,
        },
      });

      cards.forEach((card, i) => {
        const lane = LANES[i % LANES.length];
        const path: Path = {
          fromX: -REACH_VW * vw,
          toX: REACH_VW * vw,
          fromY: (lane.laneVH * vh) / 100,
          toY: ((lane.laneVH - lane.riseVH) * vh) / 100,
          midX: 0,
          midY: 0,
        };
        path.midX = (path.fromX + path.toX) / 2;
        path.midY = (path.fromY + path.toY) / 2;

        const virtualStart = i * STEP_DUR - LEAD_IN;
        const overshoot = Math.max(0, -virtualStart);
        const activeStart = Math.max(0, virtualStart);
        const initFraction = Math.min(1, overshoot / TRAVEL_DUR);

        const initState = sampleAt(initFraction, path);
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          rotateZ: lane.tilt,
          ...initState,
        });

        // sine.inOut decelerates into the end of a tween and accelerates out
        // of the start of the next one — so the two motion legs meet at the
        // peak with matching (near-zero) velocity instead of one leg easing
        // to a stop and the next kicking off at full speed right after it.
        const cardTl = gsap.timeline({ defaults: { ease: "sine.inOut" } });

        // Position/rotation/scale: whatever's left of the first-half and/or
        // second-half legs, starting from the sampled mid-journey state.
        if (initFraction < 0.5) {
          const firstLegDuration = (0.5 - initFraction) * TRAVEL_DUR;
          cardTl.to(
            card,
            {
              x: path.midX,
              y: path.midY,
              z: 80,
              rotateY: 0,
              rotateX: 0,
              scale: 1.08,
              duration: firstLegDuration,
            },
            0
          );
          cardTl.to(
            card,
            {
              x: path.toX,
              y: path.toY,
              z: -700,
              rotateY: 55,
              rotateX: -10,
              scale: 0.5,
              duration: TRAVEL_DUR * 0.5,
            },
            firstLegDuration
          );
        } else {
          cardTl.to(
            card,
            {
              x: path.toX,
              y: path.toY,
              z: -700,
              rotateY: 55,
              rotateX: -10,
              scale: 0.5,
              duration: (1 - initFraction) * TRAVEL_DUR,
            },
            0
          );
        }

        // Opacity: fade in if that hasn't happened yet, then fade out at the
        // point matching the original FADE_OUT_FRAC of the full journey.
        if (initFraction < FADE_IN_FRAC) {
          cardTl.to(
            card,
            { opacity: 1, duration: (FADE_IN_FRAC - initFraction) * TRAVEL_DUR },
            0
          );
        }
        if (initFraction < FADE_OUT_FRAC) {
          cardTl.to(
            card,
            { opacity: 0, duration: TRAVEL_DUR * (1 - FADE_OUT_FRAC) },
            (FADE_OUT_FRAC - initFraction) * TRAVEL_DUR
          );
        }

        tl.add(cardTl, activeStart);
      });
    },
    { scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} className="relative h-[220vh]">
      <div
        ref={stageRef}
        className="relative h-screen overflow-hidden"
        style={{ perspective: "1600px" }}
      >
        {testimonials.map((testimonial, i) => (
          <div
            key={testimonial.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={`absolute left-1/2 top-1/2 ${LANES[i % LANES.length].width}`}
          >
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>
    </div>
  );
}
