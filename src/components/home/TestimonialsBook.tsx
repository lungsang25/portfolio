"use client";

import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { testimonials } from "@/data/testimonials";
import {
  GlassSurface,
  TestimonialCard,
  TestimonialContent,
} from "@/components/home/TestimonialCard";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Scroll distance (in vh) that one testimonial-to-testimonial turn plus its
// resting hold takes. The section is pinned for (count - 1) of these.
const PAGE_SCROLL_VH = 90;

// Timeline units per turn: the page is moving for TURN, then everything
// rests for HOLD before the next turn. Half a HOLD is added at each end so
// the first and last testimonials also rest when the section is reached
// and left.
const TURN = 0.6;
const HOLD = 0.4;

// Where a page sits in the deck, by how many pages are above it. Pages behind
// the top one peek out as offset glass panes; deeper ones are hidden.
const STACK = [
  { y: 0, scale: 1, rotation: 0, opacity: 1 },
  { y: 16, scale: 0.965, rotation: 0.8, opacity: 1 },
  { y: 32, scale: 0.93, rotation: -0.8, opacity: 0.75 },
  { y: 44, scale: 0.9, rotation: 0, opacity: 0 },
];

const stackAt = (depth: number) =>
  STACK[Math.min(Math.max(depth, 0), STACK.length - 1)];

const FACE: CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

function Glow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute -left-[10%] top-[25%] h-[60vh] w-[65vw]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(6,78,59,0.85), transparent)",
        }}
      />
      <div
        className="absolute -right-[10%] bottom-[5%] h-[55vh] w-[55vw]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(227,168,87,0.28), transparent)",
        }}
      />
    </div>
  );
}

// Reduced motion: no pinning and no turning — just the cards, one after
// another.
function StaticList({ heading }: { heading?: ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <Glow />
      <div className="relative px-6 pt-24 md:pt-28 lg:pt-32">{heading}</div>
      <div className="relative mx-auto flex w-[min(92vw,860px)] flex-col gap-6 py-16 md:py-24">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// useSyncExternalStore (rather than reading matchMedia in render) so the
// first client render matches the server's "motion allowed" HTML and the
// list swaps in afterwards, instead of a hydration mismatch.
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

export function TestimonialsBook({ heading }: { heading?: ReactNode }) {
  const reduceMotion = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const count = testimonials.length;

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      if (!wrapper || count < 2) return;

      const query = <T extends HTMLElement>(selector: string) =>
        Array.from(wrapper.querySelectorAll<T>(selector));
      const slots = query("[data-slot]");
      const pages = query("[data-page]");
      const contents = query("[data-content]");
      const frontShades = query("[data-shade-front]");
      const backShades = query("[data-shade-back]");

      slots.forEach((slot, i) => gsap.set(slot, stackAt(i)));
      gsap.set(pages, { rotationX: 0, rotationY: 0, transformOrigin: "0% 50%" });
      gsap.set(contents, { opacity: (i: number) => (i === 0 ? 1 : 0) });
      gsap.set([...frontShades, ...backShades], { opacity: 0 });

      // immediateRender is off so each fromTo only applies its "from" values
      // once the playhead reaches it, instead of every later turn stamping
      // its start state over the initial deck at creation time.
      const tl = gsap.timeline({
        defaults: { ease: "none", immediateRender: false },
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      for (let k = 0; k < count - 1; k++) {
        const t = HOLD / 2 + k * (TURN + HOLD);

        // The page turns about its left edge, its free edge lifting toward
        // the viewer and sweeping right to left, with a slight tip forward
        // as it goes.
        tl.fromTo(
          pages[k],
          { rotationY: 0 },
          { rotationY: -180, duration: TURN, ease: "power2.inOut" },
          t
        );
        tl.to(
          pages[k],
          {
            keyframes: [
              { rotationX: 6, duration: TURN / 2, ease: "sine.out" },
              { rotationX: 0, duration: TURN / 2, ease: "sine.in" },
            ],
          },
          t
        );

        // Light falls off as the page nears edge-on, then returns on the
        // back face; the page fades out in its second half so turned pages
        // don't pile up on the left.
        tl.fromTo(
          frontShades[k],
          { opacity: 0 },
          { opacity: 0.55, duration: TURN * 0.5, ease: "power1.in" },
          t
        );
        tl.fromTo(
          backShades[k],
          { opacity: 0.55 },
          { opacity: 0, duration: TURN * 0.5, ease: "power1.out" },
          t + TURN * 0.5
        );
        tl.fromTo(
          slots[k],
          { opacity: 1 },
          { opacity: 0, duration: TURN * 0.55, ease: "power1.in" },
          t + TURN * 0.45
        );

        // Everything behind moves up one layer, and the page that becomes
        // the top one fades its text in as the page above clears it.
        for (let j = k + 1; j < count; j++) {
          tl.fromTo(
            slots[j],
            stackAt(j - k),
            { ...stackAt(j - k - 1), duration: TURN, ease: "power2.inOut" },
            t
          );
        }
        tl.fromTo(
          contents[k + 1],
          { opacity: 0 },
          { opacity: 1, duration: TURN * 0.45 },
          t + TURN * 0.4
        );
      }

      // Extend the timeline over the final rest so scroll progress maps
      // evenly across the whole pinned range.
      tl.set({}, {}, (count - 1) * (TURN + HOLD));
    },
    { scope: wrapperRef, dependencies: [reduceMotion], revertOnUpdate: true }
  );

  if (reduceMotion) return <StaticList heading={heading} />;

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `calc(100vh + ${(count - 1) * PAGE_SCROLL_VH}vh)` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <Glow />

        <div className="relative z-10 px-6 pt-24 md:pt-28 lg:pt-32">{heading}</div>

        <div className="relative flex flex-1 items-center justify-center px-4 pb-12">
          {/* All pages share one grid cell, so the deck is as tall as the
              tallest quote and every page matches it. */}
          <div className="grid w-[min(92vw,860px)]">
            {testimonials.map((testimonial, i) => {
              const s = stackAt(i);
              return (
                <div
                  key={testimonial.id}
                  data-slot
                  className="[grid-area:1/1]"
                  style={{
                    perspective: 2800,
                    zIndex: count - i,
                    willChange: "transform, opacity",
                    transform: `translateY(${s.y}px) scale(${s.scale}) rotate(${s.rotation}deg)`,
                    opacity: s.opacity,
                  }}
                >
                  <div
                    data-page
                    className="relative h-full"
                    style={{ transformStyle: "preserve-3d", transformOrigin: "0% 50%" }}
                  >
                    <GlassSurface className="h-full" style={FACE}>
                      <div data-content style={{ opacity: i === 0 ? 1 : 0 }}>
                        <TestimonialContent testimonial={testimonial} />
                      </div>
                      <div
                        data-shade-front
                        className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent to-black/80"
                        style={{ opacity: 0 }}
                      />
                    </GlassSurface>

                    <GlassSurface
                      className="absolute inset-0"
                      style={{ ...FACE, transform: "rotateY(180deg)" }}
                    >
                      <div
                        data-shade-back
                        className="pointer-events-none absolute inset-0 bg-linear-to-l from-transparent to-black/80"
                        style={{ opacity: 0 }}
                      />
                    </GlassSurface>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
