"use client";

import { motion, useReducedMotion } from "motion/react";
import { Smartphone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MobileAppsSection() {
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
    <section className="flex min-h-screen items-center bg-bg-mobile py-24 md:py-32 lg:py-40">
      <Container>
        <div className="flex flex-col items-start gap-16 md:flex-row md:items-center md:justify-between">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={container}
            className="max-w-xl md:order-1"
          >
            <motion.div variants={item}>
              <Eyebrow>Mobile Apps</Eyebrow>
            </motion.div>

            <motion.h2
              variants={item}
              className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl"
            >
              Mobile apps, built and shipped in three weeks.
            </motion.h2>

            <motion.p
              variants={item}
              className="mt-8 max-w-lg text-lg leading-relaxed text-muted md:text-xl"
            >
              From first sketch to app-store-ready build — iOS and Android,
              designed and engineered by the same team, on a timeline you can
              actually plan around.
            </motion.p>

            <motion.div variants={item} className="mt-10">
              <Button href="/book-a-meeting">Book a meeting</Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex h-56 w-56 shrink-0 items-center justify-center rounded-full border border-border bg-surface/60 md:h-72 md:w-72"
          >
            <Smartphone
              size={72}
              strokeWidth={1}
              className="text-accent"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
