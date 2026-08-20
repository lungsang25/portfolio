"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

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
    <section className="bg-bg-hero py-24 md:py-32 lg:py-40">
      <Container>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="max-w-3xl"
        >
          <motion.div variants={item}>
            <Eyebrow>Web Development</Eyebrow>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl"
          >
            Websites, built and shipped in two weeks.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
          >
            Jajin LS designs and ships production-ready websites for growing
            businesses — no bloated timelines, no endless revisions. Just a
            clean build, on schedule.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
            <Button href="/book-a-meeting">Book a meeting</Button>
            <Button href="#clients" variant="ghost">
              See our work
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
