import type { SiteMode } from "@/context/site-mode";

export type HeroCopy = {
  eyebrow: string;
  headline: string;
  description: string;
};

export const heroCopy: Record<SiteMode, HeroCopy> = {
  web: {
    eyebrow: "Web Development",
    headline: "Websites, built and shipped in two weeks.",
    description:
      "LS-020 designs and ships production-ready websites for growing businesses — no bloated timelines, no endless revisions. Just a clean build, on schedule.",
  },
  app: {
    eyebrow: "Mobile Apps",
    headline: "Mobile apps, built and shipped in three weeks.",
    description:
      "From first sketch to app-store-ready build — iOS and Android, designed and engineered by the same team, on a timeline you can actually plan around.",
  },
};
