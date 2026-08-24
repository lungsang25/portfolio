"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";
import { useSiteMode } from "@/context/site-mode";
import { featuresCopy } from "@/data/features-content";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();
  const { mode } = useSiteMode();
  const copy = featuresCopy[mode];
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
        "relative z-10 -my-10 flex min-h-screen items-center rounded-[2.5rem] py-24 md:-my-12 md:rounded-[3rem] md:py-32 lg:py-40",
        isApp ? "bg-fg-app" : "bg-bg-mobile"
      )}
    >
      <Container>
        <motion.div
          key={mode}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          <motion.div variants={item}>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
          </motion.div>

          <motion.h2
            variants={item}
            className="mt-6 max-w-2xl font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            {copy.headline}
          </motion.h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {copy.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={item}
                  className="rounded-3xl border border-border bg-surface/60 p-8 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-6 font-display text-xl text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
