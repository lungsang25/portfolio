import { cn } from "@/lib/utils";
import type { Testimonial } from "@/data/testimonials";

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-3xl border border-border bg-surface p-8 shadow-[0_0_40px_-20px_var(--color-accent)] md:p-10",
        className
      )}
    >
      <p className="font-display text-xl leading-relaxed text-foreground md:text-2xl">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="mt-10 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-sm text-accent">
          {testimonial.avatarInitials}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {testimonial.name}
          </p>
          <p className="text-sm text-subtle">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
