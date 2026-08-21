import Link from "next/link";
import { Container } from "@/components/ui/Container";

const links = [
  { href: "/", label: "Home" },
  { href: "/softwares", label: "Softwares" },
  { href: "/tibetan-tools", label: "Tibetan Tools" },
  { href: "/book-a-meeting", label: "Book a meeting" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <Container className="flex flex-col items-center gap-6 py-12 md:flex-row md:justify-between">
        <span className="font-display text-lg text-foreground">LS-020</span>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <span className="text-xs text-subtle">
          © {new Date().getFullYear()} LS-020. All rights reserved.
        </span>
      </Container>
    </footer>
  );
}
