import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clients } from "@/data/clients";

export function ClientMarquee() {
  const track = [...clients, ...clients];

  return (
    <section id="clients" className="relative z-10 -mt-10 flex min-h-[calc(14rem+2.5rem)] flex-col justify-center rounded-t-[2.5rem] bg-bg-marquee pt-12 pb-10 md:-mt-12 md:min-h-[calc(16rem+3rem)] md:rounded-t-[3rem] md:pb-12">
      <Container className="absolute inset-x-0 top-14 md:top-[4.5rem]">
        <h2 className="mx-auto max-w-2xl select-none text-center font-mono text-xs uppercase tracking-[0.2em] text-fg-marquee md:text-sm">
          Businesses we&apos;ve built and shipped for
        </h2>
      </Container>

      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          {track.map((client, i) => (
            <a
              key={`${client.name}-${i}`}
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mx-6 flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-2xl text-fg-marquee md:text-4xl"
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
