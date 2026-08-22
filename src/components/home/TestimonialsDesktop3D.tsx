"use client";

import { useCallback, useMemo, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
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

type CardHandle = { group: THREE.Group; content: HTMLDivElement };

// drei's <Html> mounts its children into its own separate ReactDOM root, so
// that DOM node attaches on an independent, delayed commit — it is not
// available by the time the outer scene's effects run. Each half of the
// handle is reported as soon as it individually attaches; the parent waits
// until both (group + content) have arrived before touching either.
function Card({
  testimonial,
  laneIndex,
  onReady,
}: {
  testimonial: (typeof testimonials)[number];
  laneIndex: number;
  onReady: (handle: CardHandle) => void;
}) {
  const partial = useRef<Partial<CardHandle>>({});
  const lane = LANES[laneIndex];

  const report = () => {
    const { group, content } = partial.current;
    if (group && content) onReady({ group, content });
  };

  return (
    <group
      ref={(el) => {
        partial.current.group = el ?? undefined;
        report();
      }}
    >
      {/* distanceFactor=400 cancels drei's internal /40 scale normalization for
          transform-mode Html, so our own group.scale values (0.5–1.08) map
          directly to visual size instead of being shrunk ~40x. */}
      <Html transform occlude={false} distanceFactor={400} style={{ pointerEvents: "none" }}>
        <div
          ref={(el) => {
            partial.current.content = el ?? undefined;
            report();
          }}
          className={lane.width}
          style={{ opacity: 0 }}
        >
          <TestimonialCard testimonial={testimonial} rotate={lane.tilt} />
        </div>
      </Html>
    </group>
  );
}

function Scene({
  wrapperRef,
  stageRef,
}: {
  wrapperRef: RefObject<HTMLDivElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
}) {
  const handles = useRef<Array<CardHandle | null>>([]);
  const [readyCount, setReadyCount] = useState(0);

  const registerReady = useCallback((index: number, handle: CardHandle) => {
    if (handles.current[index]) return;
    handles.current[index] = handle;
    setReadyCount((count) => count + 1);
  }, []);

  useGSAP(
    () => {
      if (readyCount < testimonials.length) return;
      const cards = handles.current.filter((h): h is CardHandle => h !== null);
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

        const virtualStart = i * STEP_DUR - LEAD_IN;
        const overshoot = Math.max(0, -virtualStart);
        const activeStart = Math.max(0, virtualStart);
        const initFraction = Math.min(1, overshoot / TRAVEL_DUR);

        const initState = sampleAt(initFraction, path);
        // Y is flipped: CSS translateY grows downward, three.js Y grows up.
        gsap.set(group.position, { x: initState.x, y: -initState.y, z: initState.z });
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
    },
    { dependencies: [readyCount], scope: wrapperRef }
  );

  return (
    <>
      {testimonials.map((testimonial, i) => (
        <Card
          key={testimonial.id}
          testimonial={testimonial}
          laneIndex={i % LANES.length}
          onReady={(handle) => registerReady(i, handle)}
        />
      ))}
    </>
  );
}

export function TestimonialsDesktop3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Vertical FOV chosen so that, at the z=0 plane, one three.js unit equals
  // one screen pixel — matching the CSS perspective(1600px) the previous
  // implementation used, so the vh/vw-based lane math above carries over.
  const fov = useMemo(() => {
    if (typeof window === "undefined") return 45;
    return THREE.MathUtils.radToDeg(2 * Math.atan(window.innerHeight / (2 * CAMERA_DISTANCE)));
  }, []);

  return (
    <div ref={wrapperRef} className="relative h-[220vh]">
      <div ref={stageRef} className="relative h-screen w-full overflow-hidden">
        <Canvas
          camera={{ fov, position: [0, 0, CAMERA_DISTANCE], near: 10, far: 5000 }}
          gl={{ alpha: true }}
        >
          <Scene wrapperRef={wrapperRef} stageRef={stageRef} />
        </Canvas>
      </div>
    </div>
  );
}
