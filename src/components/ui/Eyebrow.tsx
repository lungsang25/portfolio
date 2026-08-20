import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-subtle",
        className
      )}
    >
      <span className="h-px w-6 bg-accent/60" aria-hidden="true" />
      {children}
    </span>
  );
}
