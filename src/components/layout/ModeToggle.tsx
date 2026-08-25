"use client";

import { motion } from "motion/react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSiteMode, type SiteMode } from "@/context/site-mode";

const options: { value: SiteMode; label: string }[] = [
  { value: "web", label: "Web" },
  { value: "app", label: "App" },
];

export function ModeToggle() {
  const { mode, setMode } = useSiteMode();
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (value: SiteMode) => {
    setMode(value);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center rounded-full border border-border bg-surface/60 p-1 text-sm">
      {options.map((option) => {
        const active = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 font-medium transition-colors duration-200",
              active ? "text-accent-fg" : "text-foreground/60 hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="mode-toggle-pill"
                className="absolute inset-0 -z-10 rounded-full bg-accent"
                transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
