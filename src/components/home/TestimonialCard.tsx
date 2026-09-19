import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/data/testimonials";

// Deep green on the left fading to a faint cream on the right, over the
// section's black + glow backdrop. Plain gradients rather than
// backdrop-filter: the book animation rotates these panes in 3D, where
// backdrop-filter flickers or drops out.
const GLASS_BG =
  "linear-gradient(115deg, rgba(6,78,59,0.78) 0%, rgba(24,104,82,0.52) 48%, rgba(253,255,234,0.2) 100%)";

export function GlassSurface({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      style={{ background: GLASS_BG, ...style }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_30px_70px_-30px_rgba(0,0,0,0.85)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TestimonialContent({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="p-7 md:p-12">
      <p className="bg-linear-to-r from-fg-marquee via-fg-marquee to-fg-marquee/60 bg-clip-text font-sans text-xl leading-relaxed text-transparent md:text-[1.75rem] md:leading-[1.45]">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm text-accent-fg ring-1 ring-white/30">
          {testimonial.avatarInitials}
        </div>
        <div>
          <p className="text-base font-medium text-fg-marquee">{testimonial.name}</p>
          <p className="text-sm text-fg-marquee/60">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <GlassSurface className={className}>
      <TestimonialContent testimonial={testimonial} />
    </GlassSurface>
  );
}
