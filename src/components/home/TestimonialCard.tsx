import { cn } from "@/lib/utils";
import type { Testimonial, TestimonialTone } from "@/data/testimonials";

const TONES: Record<TestimonialTone, { bg: string; ink: string; sub: string }> = {
  cream: { bg: "#f2ead6", ink: "#1a1a1a", sub: "#5c5646" },
  sage: { bg: "#cfdcc8", ink: "#182615", sub: "#48573f" },
  amber: { bg: "#eec190", ink: "#241608", sub: "#5c4527" },
  powder: { bg: "#ccd7ea", ink: "#161c29", sub: "#3f4b60" },
};

export function TestimonialCard({
  testimonial,
  rotate = 0,
  className,
}: {
  testimonial: Testimonial;
  rotate?: number;
  className?: string;
}) {
  const tone = TONES[testimonial.tone];

  return (
    <div
      style={{
        backgroundColor: tone.bg,
        color: tone.ink,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
      className={cn(
        "flex h-full flex-col justify-between rounded-3xl p-6 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] md:p-8",
        className
      )}
    >
      <p className="font-display text-lg leading-relaxed md:text-xl">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="mt-6 flex items-center gap-4">
        <div
          style={{ backgroundColor: tone.ink, color: tone.bg }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-sm"
        >
          {testimonial.avatarInitials}
        </div>
        <div>
          <p className="text-sm font-medium">{testimonial.name}</p>
          <p className="text-sm" style={{ color: tone.sub }}>
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}
