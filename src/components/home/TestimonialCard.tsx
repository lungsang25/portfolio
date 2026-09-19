import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/data/testimonials";

export const PAPER_RADIUS = "0.75rem";

// Faint fibre speckle, tiled. Kept as an SVG data URI so there is no asset to
// load and it stays crisp at any density.
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0 0.12  0.36 0 0 0 -0.08'/></filter><rect width='180' height='180' filter='url(#n)'/></svg>"
)}")`;

// Paper is the hero's cream with grain, a shaded binding edge on the left
// (where the page is hinged) and a soft lift of light from the top.
const BINDING_LEFT = "linear-gradient(90deg, rgba(120,84,30,0.16) 0%, rgba(120,84,30,0) 6%)";
// The reverse of a page, seen from the front once it has turned: its spine
// edge is on the right.
const BINDING_RIGHT =
  "linear-gradient(270deg, rgba(120,84,30,0.16) 0px, rgba(120,84,30,0) 36px)";
const TOP_LIGHT = "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%)";

// `binding` says which edge is shaded by the spine: the left of a page's
// front, the right of its reverse (only where the reverse meets the spine).
export function PaperFace({
  binding = "left",
  className,
  style,
  children,
}: {
  binding?: "left" | "right" | false;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const layers = [
    GRAIN,
    binding === "left" ? BINDING_LEFT : binding === "right" ? BINDING_RIGHT : null,
    TOP_LIGHT,
  ].filter(Boolean);

  return (
    <div
      className={cn("bg-bg-hero", className)}
      style={{ backgroundImage: layers.join(", "), ...style }}
    >
      {children}
    </div>
  );
}

export function TestimonialContent({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex h-full min-h-88 flex-col justify-between gap-8 p-8 pl-12 text-fg-hero md:min-h-96 md:p-14 md:pl-16">
      <p className="font-display text-2xl leading-[1.35] tracking-tight md:text-[2rem]">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fg-hero font-mono text-sm text-bg-hero">
          {testimonial.avatarInitials}
        </div>
        <div>
          <p className="text-base font-medium">{testimonial.name}</p>
          <p className="text-sm text-fg-hero/65">{testimonial.role}</p>
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
    <PaperFace
      style={{ borderRadius: PAPER_RADIUS }}
      className={cn("shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]", className)}
    >
      <TestimonialContent testimonial={testimonial} />
    </PaperFace>
  );
}
