import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export function PagePlaceholder({
  eyebrow,
  title,
  showCta = true,
}: {
  eyebrow: string;
  title: string;
  showCta?: boolean;
}) {
  return (
    <section className="flex min-h-[70vh] items-center py-32">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 font-display text-4xl leading-tight text-foreground md:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-lg text-muted">
            This page is on its way. Check back soon — or get in touch and
            we&apos;ll walk you through it directly.
          </p>
          {showCta && (
            <div className="mt-10">
              <Button href="/book-a-meeting">Book a meeting</Button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
