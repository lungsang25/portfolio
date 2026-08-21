import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clients } from "@/data/clients";

export function ClientMarquee() {
  const track = [...clients, ...clients];

  return (
    <section id="clients" className="bg-bg-marquee py-24 md:py-32">
      <Container>
        <h2 className="mx-auto max-w-2xl select-none text-center font-mono text-xs uppercase tracking-[0.2em] text-muted/75 md:text-sm">
          Businesses we&apos;ve built and shipped for
        </h2>
      </Container>

      <div className="mt-14 overflow-hidden">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          {track.map((client, i) => (
            <a
              key={`${client.name}-${i}`}
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mx-6 flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-3xl text-foreground/55 transition-colors duration-200 hover:text-foreground md:text-5xl"
            >
              {client.name}
              <ArrowUpRight
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                size={22}
                strokeWidth={1.5}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
