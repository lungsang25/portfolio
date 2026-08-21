"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/softwares", label: "Softwares" },
  { href: "/tibetan-tools", label: "Tibetan Tools" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <Container>
        <div className="my-4 flex h-16 items-center justify-between rounded-full border border-border px-6">
          <Link
            href="/"
            className="font-display text-xl tracking-tight text-foreground"
            onClick={() => setOpen(false)}
          >
            LS-020
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-sm text-muted transition-colors hover:text-foreground",
                    active && "text-foreground"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 h-px w-full bg-accent" />
                  )}
                </Link>
              );
            })}
            <Button href="/book-a-meeting" className="px-5 py-2.5 text-sm">
              Book a meeting
            </Button>
          </nav>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {open && (
        <Container className="md:hidden">
          <div className="-mt-2 mb-4 flex flex-col gap-1 rounded-2xl border border-border p-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground",
                  pathname === link.href && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book-a-meeting"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-accent-fg"
            >
              Book a meeting
            </Link>
          </div>
        </Container>
      )}
    </header>
  );
}
