import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent/90",
  ghost:
    "border border-border text-foreground hover:border-accent/50 hover:text-accent",
};

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)
  | ({ href?: undefined } & Omit<React.ComponentProps<"button">, "className">)
);

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (props.href) {
    return (
      <Link className={classes} {...(props as React.ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as React.ComponentProps<"button">)}>
      {children}
    </button>
  );
}
