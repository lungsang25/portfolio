"use client";

import { useCallback, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { testimonials } from "@/data/testimonials";
import { TestimonialCard } from "@/components/home/TestimonialCard";

gsap.registerPlugin(ScrollTrigger);

// Each card's own crossing takes TRAVEL_DUR timeline-units; the next card
// starts STEP_DUR units later. STEP_DUR is kept small relative to TRAVEL_DUR
// so overlapping cards are close together in their journey — and therefore
// close together on screen — rather than showing up at opposite edges.
const TRAVEL_DUR = 3;
const STEP_DUR = 0.9;
// How far a card travels left-to-right, as a fraction of viewport width.
// Kept just wide enough that cards still start/end fully off-screen.
const REACH_VW = 0.72;

const FADE_IN_FRAC = 0.15;
const FADE_OUT_FRAC = 0.86;

// Distance (in px-equivalent world units) from the camera to the z=0 plane.
// The camera's vertical FOV is derived from this so that one three.js unit
// at z=0 maps to one screen pixel — letting the vh/vw-based lane math below
// carry over unchanged from the CSS-transform version of this component.
const CAMERA_DISTANCE = 1600;

// Cards cross the stage left to right in 3D, rising gently and swinging
// toward the viewer (z) as they pass through the centre. Each lane sets
// where it sits vertically (laneVH), how far it climbs (riseVH), and its
// resting photo-like tilt (tilt) — hand-placed so passes don't collide.
const LANES = [
  // laneVH nudged down from the original -18 (used by the pure flying-
  // carousel version) so card 0's resting mid-point clears the heading
  // pinned above it, instead of the two overlapping at rest.
  { laneVH: 8, riseVH: 14, tilt: -5, width: "w-[380px]" },
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

type CardHandle = { group: THREE.Group; content: HTMLDivElement };

// drei's <Html> mounts its children into its own separate ReactDOM root, so
// that DOM node attaches on an independent, delayed commit — it is not
// available by the time the outer scene's effects run. Each half of the
// handle is reported as soon as it individually attaches; the parent waits
// until both (group + content) have arrived before touching either.
function Card({
  index,
  testimonial,
  laneIndex,
  onReady,
}: {
  index: number;
  testimonial: (typeof testimonials)[number];
  laneIndex: number;
  onReady: (index: number, handle: CardHandle) => void;
}) {
  const partial = useRef<Partial<CardHandle>>({});
  const lane = LANES[laneIndex];

  // These ref callbacks must keep a stable identity across re-renders: an
  // inline `ref={(el) => ...}` is a new function every render, which makes
  // React detach+reattach on each one — and since drei's <Html> re-renders
  // its own separate ReactDOM root on every parent re-render too, that
  // churn was leaving GSAP holding a stale, detached DOM node (opacity set
  // on a node no longer on screen) rather than the one actually displayed.
  const setGroup = useCallback(
    (el: THREE.Group | null) => {
      partial.current.group = el ?? undefined;
      const { group, content } = partial.current;
      if (group && content) onReady(index, { group, content });
    },
    [index, onReady]
  );
  const setContent = useCallback(
    (el: HTMLDivElement | null) => {
      partial.current.content = el ?? undefined;
      const { group, content } = partial.current;
      if (group && content) onReady(index, { group, content });
    },
    [index, onReady]
  );

  return (
    <group ref={setGroup}>
      {/* distanceFactor=400 cancels drei's internal /40 scale normalization for
          transform-mode Html, so our own group.scale values (0.5–1.08) map
          directly to visual size instead of being shrunk ~40x. zIndexRange
          bounds drei's depth-sorting z-index (its default reaches into the
          millions) so the heading overlay's z-[110] can reliably sit above
          every card regardless of which one is nearest the camera. */}
      <Html
        transform
        occlude={false}
        distanceFactor={400}
        zIndexRange={[100, 1]}
        style={{ pointerEvents: "none" }}
      >
        <div ref={setContent} className={lane.width} style={{ opacity: 0 }}>
          <TestimonialCard testimonial={testimonial} rotate={lane.tilt} />
        </div>
      </Html>
    </group>
  );
}

function Scene({
  wrapperRef,
  stageRef,
  headingRef,
}: {
  wrapperRef: RefObject<HTMLDivElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  headingRef: RefObject<HTMLDivElement | null>;
}) {
  const handles = useRef<Array<CardHandle | null>>([]);
  const setupDone = useRef(false);
  const ctxRef = useRef<gsap.Context | null>(null);

  const registerReady = useCallback((index: number, handle: CardHandle) => {
    handles.current[index] = handle;
  }, []);

  // Polling on the R3F render loop (rather than a React effect keyed on
  // some "all refs ready" state) means Card/Html never re-render after
  // mount just to drive this setup — so there's no risk of React
  // re-applying the JSX-authored opacity:0 over GSAP's own DOM mutations.
  useFrame(() => {
    if (setupDone.current) return;
    const cards = handles.current.filter((h): h is CardHandle => h !== null);
    if (cards.length < testimonials.length) return;
    setupDone.current = true;

    ctxRef.current = gsap.context(() => {
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

      // The heading's own on-screen size is a fixed pixel amount (it's set
      // in px, not vh), while the lanes below are all vh-percentages — on a
      // short viewport, "vh-centered" can land much closer to a fixed-px
      // heading than it does on a tall one. Anchoring card 0's rest position
      // to the heading's measured height keeps clearance consistent no
      // matter how short the viewport is, instead of drifting with vh.
      const REST_MARGIN_PX = 32;
      const REST_CARD_HALF_HEIGHT_PX = 170;
      const headingBottomPx = headingRef.current
        ? headingRef.current.offsetTop + headingRef.current.offsetHeight
        : 220;
      const restY = headingBottomPx + REST_MARGIN_PX + REST_CARD_HALF_HEIGHT_PX - vh / 2;

      cards.forEach(({ group, content }, i) => {
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

        // The very first card rests centred and fully visible — as if it
        // were a static hero — right when the section is reached; it only
        // starts its exit once the user actually scrolls. Every other card
        // starts fully hidden off-stage and enters staggered behind it.
        const initFraction = i === 0 ? 0.5 : 0;
        const activeStart = i === 0 ? 0 : i * STEP_DUR;

        const initState = sampleAt(initFraction, path);
        const initY = i === 0 ? restY : initState.y;
        // Y is flipped: CSS translateY grows downward, three.js Y grows up.
        gsap.set(group.position, { x: initState.x, y: -initY, z: initState.z });
        gsap.set(group.rotation, {
          y: THREE.MathUtils.degToRad(initState.rotateY),
          x: THREE.MathUtils.degToRad(initState.rotateX),
        });
        gsap.set(group.scale, { x: initState.scale, y: initState.scale, z: initState.scale });
        gsap.set(content, { opacity: initState.opacity });

        // sine.inOut decelerates into the end of a tween and accelerates out
        // of the start of the next one — so the two motion legs meet at the
        // peak with matching (near-zero) velocity instead of one leg easing
        // to a stop and the next kicking off at full speed right after it.
        const cardTl = gsap.timeline({ defaults: { ease: "sine.inOut" } });

        if (initFraction < 0.5) {
          const firstLegDuration = (0.5 - initFraction) * TRAVEL_DUR;
          cardTl.to(group.position, { x: path.midX, y: -path.midY, z: 80, duration: firstLegDuration }, 0);
          cardTl.to(group.rotation, { y: 0, x: 0, duration: firstLegDuration }, 0);
          cardTl.to(group.scale, { x: 1.08, y: 1.08, z: 1.08, duration: firstLegDuration }, 0);

          cardTl.to(
            group.position,
            { x: path.toX, y: -path.toY, z: -700, duration: TRAVEL_DUR * 0.5 },
            firstLegDuration
          );
          cardTl.to(
            group.rotation,
            {
              y: THREE.MathUtils.degToRad(55),
              x: THREE.MathUtils.degToRad(-10),
              duration: TRAVEL_DUR * 0.5,
            },
            firstLegDuration
          );
          cardTl.to(group.scale, { x: 0.5, y: 0.5, z: 0.5, duration: TRAVEL_DUR * 0.5 }, firstLegDuration);
        } else {
          const duration = (1 - initFraction) * TRAVEL_DUR;
          cardTl.to(group.position, { x: path.toX, y: -path.toY, z: -700, duration }, 0);
          cardTl.to(
            group.rotation,
            { y: THREE.MathUtils.degToRad(55), x: THREE.MathUtils.degToRad(-10), duration },
            0
          );
          cardTl.to(group.scale, { x: 0.5, y: 0.5, z: 0.5, duration }, 0);
        }

        // Opacity: fade in if that hasn't happened yet, then fade out at the
        // point matching the original FADE_OUT_FRAC of the full journey.
        if (initFraction < FADE_IN_FRAC) {
          cardTl.to(content, { opacity: 1, duration: (FADE_IN_FRAC - initFraction) * TRAVEL_DUR }, 0);
        }
        if (initFraction < FADE_OUT_FRAC) {
          cardTl.to(
            content,
            { opacity: 0, duration: TRAVEL_DUR * (1 - FADE_OUT_FRAC) },
            (FADE_OUT_FRAC - initFraction) * TRAVEL_DUR
          );
        }

        tl.add(cardTl, activeStart);
      });
    }, wrapperRef);
  });

  useEffect(() => {
    return () => ctxRef.current?.revert();
  }, []);

  return (
    <>
      {testimonials.map((testimonial, i) => (
        <Card
          key={testimonial.id}
          index={i}
          testimonial={testimonial}
          laneIndex={i % LANES.length}
          onReady={registerReady}
        />
      ))}
    </>
  );
}

export function TestimonialsDesktop3D({ heading }: { heading?: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  // Vertical FOV chosen so that, at the z=0 plane, one three.js unit equals
  // one screen pixel — matching the CSS perspective(1600px) the previous
  // implementation used, so the vh/vw-based lane math above carries over.
  const fov = useMemo(() => {
    if (typeof window === "undefined") return 45;
    return THREE.MathUtils.radToDeg(2 * Math.atan(window.innerHeight / (2 * CAMERA_DISTANCE)));
  }, []);

  return (
    <div ref={wrapperRef} className="relative h-[220vh]">
      {/* z-20: once GSAP pins this (switching it to position:fixed), it needs
          to out-rank MobileAppsSection's own z-10 rounded overlap panel —
          without an explicit z-index here, the fixed stage's new stacking
          context has no priority against that sibling section and loses. */}
      <div ref={stageRef} className="relative z-20 h-screen w-full overflow-hidden">
        {/* Lives inside the pinned stage (not above it) so it stays on
            screen together with the resting card the moment the section
            is reached — content above the pin is, by definition, already
            scrolled out of view once the pin engages. */}
        {/* z-[110]: above every card's drei-managed zIndexRange (capped at
            100 on the Html components below), so the heading always stays
            legible on top of a card rather than being covered by whichever
            one currently occupies that part of the screen. */}
        <div
          ref={headingRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-110 px-6 pt-24 md:pt-28 lg:pt-32"
        >
          {heading}
        </div>
        <Canvas
          camera={{ fov, position: [0, 0, CAMERA_DISTANCE], near: 10, far: 5000 }}
          gl={{ alpha: true }}
        >
          <Scene wrapperRef={wrapperRef} stageRef={stageRef} headingRef={headingRef} />
        </Canvas>
      </div>
    </div>
  );
}
