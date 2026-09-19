"use client";

import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { testimonials, type Testimonial } from "@/data/testimonials";
import {
  PAPER_RADIUS,
  PaperFace,
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

// A page is cut into this many vertical strips, each hinged to the one
// before it, so it can bend like paper instead of swinging as a flat board.
const STRIPS = 16;
// How far (degrees, end to end) the free edge leads the spine at the peak of
// a turn, spread evenly over the strips. Zero at the start and end, so the
// page is perfectly flat at rest.
const TOTAL_BEND = 56;
const BEND_PER_STRIP = TOTAL_BEND / (STRIPS - 1);
// Darkest a strip gets as it turns edge-on, and darkest shadow a turning
// page casts on the sheet beneath it.
const SHADE_MAX = 0.42;
const CAST_MAX = 0.4;

// Where a sheet sits in the pile, by how many sheets are above it: a slightly
// smaller, lower, dimmer sheet each layer, so their edges peek out.
const STACK = [
  { y: 0, scale: 1, rotation: 0, opacity: 1, dim: 0 },
  { y: 7, scale: 0.988, rotation: 0.5, opacity: 1, dim: 0.1 },
  { y: 14, scale: 0.976, rotation: -0.5, opacity: 1, dim: 0.2 },
  { y: 18, scale: 0.97, rotation: 0, opacity: 0, dim: 0.28 },
];

const stackAt = (depth: number) =>
  STACK[Math.min(Math.max(depth, 0), STACK.length - 1)];

const slotVars = (depth: number) => {
  const { y, scale, rotation, opacity } = stackAt(depth);
  return { y, scale, rotation, opacity };
};

// Paper to the left of the wire, i.e. how far a page's edge sits past the
// hinge line. Turned pages swing about the wire, not about their own edge.
const SPINE_MARGIN = 16;

const DECK_VARS = {
  "--strip-w": `calc(var(--deck-w) / ${STRIPS})`,
  "--spine-m": `${SPINE_MARGIN}px`,
} as CSSProperties;

// How far a sheet that has been turned sinks into the pile on the left for
// each later sheet turned on top of it.
const PILE_STEP = { x: -3, y: 5 };
const PILE_MAX = 3;
const turnedPose = (depth: number) => {
  const d = Math.min(depth, PILE_MAX);
  return { x: PILE_STEP.x * d, y: PILE_STEP.y * d };
};

// One coil of the spiral binding: a punched hole with a slanted wire loop
// through it, tiled down the spine.
const RING_TILE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='28' viewBox='0 0 48 28'><defs><linearGradient id='w' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#9a9a9a'/><stop offset='0.4' stop-color='#1d1d1d'/><stop offset='1' stop-color='#060606'/></linearGradient><radialGradient id='h' cx='50%' cy='38%' r='65%'><stop offset='0' stop-color='#000' stop-opacity='0.95'/><stop offset='1' stop-color='#1a1208' stop-opacity='0.8'/></radialGradient></defs><ellipse cx='24' cy='14' rx='5.5' ry='4' fill='url(#h)'/><g transform='rotate(-14 24 14)'><ellipse cx='24' cy='14' rx='20' ry='5.2' fill='none' stroke='url(#w)' stroke-width='3'/></g></svg>"
)}")`;
// Shadow pooled in the crease where the two pages meet.
const GUTTER =
  "linear-gradient(90deg, rgba(40,26,8,0) 0%, rgba(40,26,8,0.24) 50%, rgba(40,26,8,0) 100%)";

// The wire. It stays put while the pages turn about it, and lies over both
// the page on the right and the pile on the left.
function Spiral() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-50"
      style={{
        top: 4,
        bottom: 4,
        left: "calc(var(--spine-m) - 32px)",
        width: 64,
        backgroundImage: `${RING_TILE}, ${GUTTER}`,
        backgroundSize: "48px 28px, 100% 100%",
        backgroundPosition: "center, 0 0",
        // `space` fits whole coils evenly down the spine instead of clipping
        // the last one.
        backgroundRepeat: "no-repeat space, no-repeat",
      }}
    />
  );
}

// One vertical slice of a page. Each strip holds the matching slice of the
// full page (so text and grain line up across strips) on its front, plain
// paper on its back, and the next strip nested inside it — which is what
// makes each strip's rotation add on to the one before.
function Strip({ index, testimonial }: { index: number; testimonial: Testimonial }) {
  const first = index === 0;
  const last = index === STRIPS - 1;

  const face: CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    // The 1px overlap into the next strip hides hairline seams between them.
    width: last ? "var(--strip-w)" : "calc(var(--strip-w) + 1px)",
    overflow: "hidden",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: first
      ? `${PAPER_RADIUS} 0 0 ${PAPER_RADIUS}`
      : last
        ? `0 ${PAPER_RADIUS} ${PAPER_RADIUS} 0`
        : undefined,
  };

  return (
    <div
      data-strip
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: first ? 0 : "var(--strip-w)",
        width: "var(--strip-w)",
        transformStyle: "preserve-3d",
        // The first strip hinges on the wire; the rest hinge on the strip
        // before them.
        transformOrigin: first ? "var(--spine-m) 50%" : "0 50%",
      }}
    >
      <div style={face}>
        <PaperFace
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(var(--strip-w) * ${-index})`,
            width: "var(--deck-w)",
          }}
        >
          <TestimonialContent testimonial={testimonial} />
        </PaperFace>
        <div
          data-shade-front
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: 0 }}
        />
      </div>

      {/* The back is flipped in place, so its rounded corners are mirrored:
          they must sit where this strip's outer page corners end up. */}
      <div
        style={{
          ...face,
          transform: "rotateY(180deg)",
          borderRadius: first
            ? `0 ${PAPER_RADIUS} ${PAPER_RADIUS} 0`
            : last
              ? `${PAPER_RADIUS} 0 0 ${PAPER_RADIUS}`
              : undefined,
        }}
      >
        <PaperFace binding={first ? "right" : false} style={{ position: "absolute", inset: 0 }} />
        <div
          data-shade-back
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: 0 }}
        />
      </div>

      {!last && <Strip index={index + 1} testimonial={testimonial} />}
    </div>
  );
}

// Reduced motion: no pinning and no turning — just the sheets, one after
// another.
function StaticList({ heading }: { heading?: ReactNode }) {
  return (
    <div className="overflow-hidden">
      <div className="px-6 pt-24 md:pt-28 lg:pt-32">{heading}</div>
      <div className="mx-auto flex w-[min(92vw,860px)] flex-col gap-6 py-16 md:py-24">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

// useSyncExternalStore (rather than reading matchMedia in render) so the
// first client render matches the server's HTML (no match) and the real
// answer swaps in afterwards, instead of a hydration mismatch.
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function TestimonialsBook({ heading }: { heading?: ReactNode }) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Wide enough for the open book: spiral at the centre, turned pages on the
  // left, current page on the right.
  const wide = useMediaQuery("(min-width: 1024px)");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const count = testimonials.length;

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      if (!wrapper || count < 2) return;

      const query = (selector: string) =>
        Array.from(wrapper.querySelectorAll<HTMLElement>(selector));
      const slots = query("[data-slot]");
      const dims = query("[data-dim]");
      const casts = query("[data-cast]");
      const shadowsRight = query("[data-shadow-right]");
      const shadowsLeft = query("[data-shadow-left]");
      // Strips are nested, so document order is hinge-to-free-edge order.
      const strips = query("[data-page]").map((page) =>
        Array.from(page.querySelectorAll<HTMLElement>("[data-strip]")).map((el) => ({
          el,
          front: el.querySelector<HTMLElement>("[data-shade-front]")!,
          back: el.querySelector<HTMLElement>("[data-shade-back]")!,
        }))
      );

      const inOut = gsap.parseEase("power2.inOut");

      // Poses page k at turn progress p (0 = flat and closed, 1 = flat and
      // turned). The strip at the spine swings the whole way round; every
      // strip after it adds a little extra, easing in and out with the turn,
      // so the free edge leads and the page bows before settling flat. Each
      // strip darkens as it goes edge-on, which reads as light along the curl.
      const pose = (k: number, p: number) => {
        const swing = -180 * inOut(p);
        const bow = -Math.sin(Math.PI * p) * BEND_PER_STRIP;
        let total = 0;
        strips[k].forEach(({ el, front, back }, i) => {
          const turn = i === 0 ? swing : bow;
          total += turn;
          el.style.transform = `rotateY(${turn}deg)`;
          const shade = String(SHADE_MAX * Math.sin((total * Math.PI) / 180) ** 2);
          front.style.opacity = shade;
          back.style.opacity = shade;
        });
        // The sheet underneath is shadowed while the page is lifted over it.
        if (casts[k + 1]) casts[k + 1].style.opacity = String(Math.sin(Math.PI * p) * CAST_MAX);
      };

      slots.forEach((slot, i) => gsap.set(slot, { ...slotVars(i), x: 0 }));
      gsap.set(shadowsLeft, { opacity: 0 });
      dims.forEach((dim, i) => gsap.set(dim, { opacity: stackAt(i).dim }));
      casts.forEach((cast) => gsap.set(cast, { opacity: 0 }));
      strips.forEach((_, k) => pose(k, 0));

      // immediateRender is off so each fromTo only applies its "from" values
      // once the playhead reaches it, instead of every later turn stamping
      // its start state over the initial pile at creation time.
      const tl = gsap.timeline({
        defaults: { ease: "none", immediateRender: false },
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // Opening the book: as the first page turns, slide the whole book right
      // by half a page so the spiral ends up at the centre of the screen.
      const deck = wrapper.querySelector<HTMLElement>("[data-deck]");
      if (wide && deck) {
        tl.fromTo(
          deck,
          { xPercent: 0, x: 0 },
          { xPercent: 50, x: -SPINE_MARGIN, duration: TURN, ease: "power2.inOut" },
          HOLD / 2
        );
      }

      for (let k = 0; k < count - 1; k++) {
        const t = HOLD / 2 + k * (TURN + HOLD);

        // The turn itself. Driven through a plain number so the poses above
        // are computed in one place; complete/reverse-complete snap to the
        // exact end poses when the scroll jumps past the whole turn.
        const progress = { p: 0 };
        tl.to(
          progress,
          {
            p: 1,
            duration: TURN,
            onUpdate: () => pose(k, progress.p),
            onComplete: () => pose(k, 1),
            onReverseComplete: () => pose(k, 0),
          },
          t
        );

        // Once past edge-on the page comes down on top of the pile on the
        // left, so it stops being stacked under the sheets it has left behind.
        tl.fromTo(
          slots[k],
          { zIndex: count - k },
          { zIndex: count + k + 1, duration: 0.001 },
          t + TURN * 0.5
        );

        // Its drop shadow moves with it, from the right-hand sheet to the
        // left-hand one.
        tl.fromTo(
          shadowsRight[k],
          { opacity: 1 },
          { opacity: 0, duration: TURN * 0.3 },
          t + TURN * 0.4
        );
        tl.fromTo(
          shadowsLeft[k],
          { opacity: 0 },
          { opacity: 1, duration: TURN * 0.3 },
          t + TURN * 0.4
        );

        // Sheets already turned sink one layer as this one lands on them.
        for (let j = 0; j < k; j++) {
          tl.fromTo(
            slots[j],
            turnedPose(k - 1 - j),
            { ...turnedPose(k - j), duration: TURN * 0.5, ease: "power2.out" },
            t + TURN * 0.5
          );
        }

        // Every sheet behind moves up one layer in the pile.
        for (let j = k + 1; j < count; j++) {
          tl.fromTo(
            slots[j],
            slotVars(j - k),
            { ...slotVars(j - k - 1), duration: TURN, ease: "power2.inOut" },
            t
          );
          tl.fromTo(
            dims[j],
            { opacity: stackAt(j - k).dim },
            { opacity: stackAt(j - k - 1).dim, duration: TURN, ease: "power2.inOut" },
            t
          );
        }
      }

      // Extend the timeline over the final rest so scroll progress maps
      // evenly across the whole pinned range.
      tl.set({}, {}, (count - 1) * (TURN + HOLD));
    },
    { scope: wrapperRef, dependencies: [reduceMotion, wide], revertOnUpdate: true }
  );

  if (reduceMotion) return <StaticList heading={heading} />;

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `calc(100vh + ${(count - 1) * PAGE_SCROLL_VH}vh)` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="relative z-10 px-6 pt-24 md:pt-28 lg:pt-32">{heading}</div>

        {/* The deck below is decorative and repeats each quote once per strip,
            so screen readers get the testimonials once, here. */}
        <ul className="sr-only">
          {testimonials.map((testimonial) => (
            <li key={testimonial.id}>
              <blockquote>{testimonial.quote}</blockquote>
              <p>
                {testimonial.name}, {testimonial.role}
              </p>
            </li>
          ))}
        </ul>

        <div className="relative flex flex-1 items-center justify-center px-4 pb-12">
          {/* All sheets share one grid cell, so the deck is as tall as the
              tallest quote and every sheet matches it. The book starts shut:
              the first page centred, spiral at its left edge. On wide screens
              turning the first page also slides the book across to centre the
              open spread (spiral in the middle, turned pages on the left);
              on narrow ones the turned pages just fall off-screen to the left. */}
          <div
            data-deck
            aria-hidden="true"
            className="relative grid [--deck-w:min(92vw,860px)] lg:[--deck-w:min(46vw,860px)]"
            style={{ ...DECK_VARS, width: "var(--deck-w)" }}
          >
            <Spiral />
            {testimonials.map((testimonial, i) => {
              const s = stackAt(i);
              return (
                <div
                  key={testimonial.id}
                  data-slot
                  className="relative [grid-area:1/1]"
                  style={{
                    perspective: 2800,
                    zIndex: count - i,
                    willChange: "transform, opacity",
                    transform: `translateY(${s.y}px) scale(${s.scale}) rotate(${s.rotation}deg)`,
                    opacity: s.opacity,
                  }}
                >
                  {/* One drop shadow where the sheet lies now (right), one
                      where it lands once turned (left, mirrored about the
                      wire). */}
                  <div
                    data-shadow-right
                    className="absolute inset-0 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]"
                    style={{ borderRadius: PAPER_RADIUS }}
                  />
                  <div
                    data-shadow-left
                    className="absolute inset-y-0 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]"
                    style={{
                      left: "calc(var(--spine-m) * 2 - var(--deck-w))",
                      width: "var(--deck-w)",
                      borderRadius: PAPER_RADIUS,
                      opacity: 0,
                    }}
                  />

                  <div
                    data-page
                    className="relative h-full"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* In-flow copy that gives the page its height; the strips
                        are absolutely positioned over it. */}
                    <div className="invisible">
                      <TestimonialContent testimonial={testimonial} />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Strip index={0} testimonial={testimonial} />
                    </div>
                  </div>

                  <div
                    data-dim
                    className="pointer-events-none absolute inset-0 bg-black"
                    style={{ opacity: s.dim, borderRadius: PAPER_RADIUS }}
                  />
                  <div
                    data-cast
                    className="pointer-events-none absolute inset-0"
                    style={{
                      opacity: 0,
                      borderRadius: PAPER_RADIUS,
                      background:
                        "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.12) 60%, rgba(0,0,0,0))",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
