"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useSiteMode } from "@/context/site-mode";
import { heroCopy } from "@/data/hero-content";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { mode } = useSiteMode();
  const copy = heroCopy[mode];
  const isApp = mode === "app";

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.12 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE },
    },
  };

  return (
    <section
      className={cn(
        "relative z-10 -mt-24 -mb-10 flex min-h-screen items-center rounded-b-[2.5rem] pt-48 pb-24 md:-mb-12 md:rounded-b-[3rem] md:pt-56 md:pb-32 lg:pt-64 lg:pb-40",
        isApp ? "bg-bg-app" : "bg-bg-hero"
      )}
    >
      <Container>
        <motion.div
          key={mode}
          initial="hidden"
          animate="visible"
          variants={container}
          className="max-w-3xl"
        >
          <motion.div variants={item}>
            <Eyebrow className={isApp ? "text-fg-app/60" : "text-fg-hero/60"}>
              {copy.eyebrow}
            </Eyebrow>
          </motion.div>

          <motion.h1
            variants={item}
            className={cn(
              "mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl",
              isApp ? "text-fg-app" : "text-fg-hero"
            )}
          >
            {copy.headline}
          </motion.h1>

          <motion.p
            variants={item}
            className={cn(
              "mt-8 max-w-xl text-lg leading-relaxed md:text-xl",
              isApp ? "text-fg-app/75" : "text-fg-hero/75"
            )}
          >
            {copy.description}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
            <Button href="/book-a-meeting">Book a meeting</Button>
            <Button
              href="#clients"
              variant="ghost"
              className={isApp ? "border-fg-app/30 text-fg-app" : "border-fg-hero/30 text-fg-hero"}
            >
              See our work
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
