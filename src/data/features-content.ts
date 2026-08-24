import { Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import type { SiteMode } from "@/context/site-mode";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type FeaturesCopy = {
  eyebrow: string;
  headline: string;
  features: Feature[];
};

export const featuresCopy: Record<SiteMode, FeaturesCopy> = {
  web: {
    eyebrow: "Built In",
    headline: "Every website ships ready for what's next.",
    features: [
      {
        icon: Sparkles,
        title: "AI-Powered",
        description:
          "Smart search, content generation, and personalization built into the site — not bolted on after launch.",
      },
      {
        icon: ShieldCheck,
        title: "Security",
        description:
          "HTTPS, hardened auth, and dependency monitoring by default, so nothing ships with known gaps.",
      },
    ],
  },
  app: {
    eyebrow: "Built In",
    headline: "Every app ships ready for what's next.",
    features: [
      {
        icon: Sparkles,
        title: "AI-Powered",
        description:
          "On-device intelligence and smart recommendations woven into the experience, not bolted on as an afterthought SDK.",
      },
      {
        icon: ShieldCheck,
        title: "Security",
        description:
          "Secure auth, encrypted storage, and App Store / Play Store compliance handled from day one.",
      },
    ],
  },
};
