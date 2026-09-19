import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clients } from "@/data/clients";

// The track is two identical groups, shifted left by exactly one group width.
// Each group must be wider than the screen or a gap opens on the right, so it
// repeats the client list enough times to cover wide displays.
const REPEATS_PER_GROUP = 4;
const group = Array.from({ length: REPEATS_PER_GROUP }, () => clients).flat();

export function ClientMarquee() {
  return (
    <section id="clients" className="relative z-10 -mt-10 flex min-h-[calc(14rem+2.5rem)] flex-col justify-center rounded-t-[2.5rem] bg-bg-marquee pt-12 pb-10 md:-mt-12 md:min-h-[calc(16rem+3rem)] md:rounded-t-[3rem] md:pb-12">
      <Container className="absolute inset-x-0 top-14 md:top-[4.5rem]">
        <h2 className="mx-auto max-w-2xl select-none text-center font-mono text-xs uppercase tracking-[0.2em] text-fg-marquee md:text-sm">
          Businesses we&apos;ve built and shipped for
        </h2>
      </Container>

      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {group.map((client, i) => {
                const interactive = copy === 0 && i < clients.length;
                return (
                  <a
                    key={`${client.name}-${i}`}
                    href={client.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-hidden={interactive ? undefined : true}
                    tabIndex={interactive ? undefined : -1}
                    className="group mx-6 flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-2xl text-fg-marquee md:text-4xl"
                  >
                    {client.name}
                    <ArrowUpRight
                      className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      size={22}
                      strokeWidth={1.5}
                    />
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
