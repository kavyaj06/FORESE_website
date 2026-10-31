import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Images, MapPin, Users } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/sections/PageHero';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { Button, Card } from '@/components/ui';
import {
  EVENTS_BY_RECENCY,
  eventHighlights,
  eventParagraphs,
  findEventBySlug,
} from '@/data/events';
import { albumFor } from '@/pages/gallery/data';
import { cn } from '@/lib/cn';
import { EventHero } from './components/EventHero';
import { EVENT_PAGE } from './data';

/**
 * One event, at its own address.
 *
 * The club's previous site gave each event a page of its own — a photograph
 * across the top, what it is, and why to attend — and the events list here
 * could only offer a jump to the photographs. This is that page, in this
 * site's own black and white rather than the old one's blue.
 *
 * **Every section is conditional, and the page still reads with none of
 * them.** An event created in the editor has a name and a date and nothing
 * else; it gets a hero and a way back, which is honest. As the club fills the
 * fields in — headline, paragraphs, cards, audience — the page grows into
 * them. Nothing here renders a heading over an empty space.
 *
 * Title and meta come from the route table, as everywhere else on this site:
 * React runs child effects before parent effects, so a page setting its own
 * document title is overwritten by the layout moments later.
 */
export default function EventPage() {
  const { slug } = useParams();
  const event = slug ? findEventBySlug(slug) : undefined;

  if (!event) {
    return (
      <>
        <PageHero
          eyebrow={EVENT_PAGE.missing.eyebrow}
          title={EVENT_PAGE.missing.title}
          description={EVENT_PAGE.missing.description}
          size="compact"
        />
        <Container className="py-section">
          <Button to="/events" iconLeft={<ArrowLeft size={16} aria-hidden="true" />}>
            {EVENT_PAGE.back}
          </Button>
        </Container>
      </>
    );
  }

  const paragraphs = eventParagraphs(event);
  const highlights = eventHighlights(event);
  const photoCount = albumFor(event.id)?.photos.length ?? 0;

  // The acronym alone for the "Why attend …?" heading: the registered name in
  // full is three lines of brackets in the middle of a question.
  const short = event.name.split(' (')[0];

  // Neighbours in the order the list presents them, so "next" means the same
  // thing here as it does there.
  const position = EVENTS_BY_RECENCY.findIndex((candidate) => candidate.id === event.id);
  const next = EVENTS_BY_RECENCY[position + 1];

  const facts = [
    event.audience && { icon: Users, label: EVENT_PAGE.audienceLabel, value: event.audience },
    event.venue && { icon: MapPin, label: EVENT_PAGE.venueLabel, value: event.venue },
  ].filter(Boolean) as { icon: typeof Users; label: string; value: string }[];

  return (
    <>
      <EventHero event={event} />

      {paragraphs.length > 0 && (
        <section className="py-section">
          <Container>
            <Reveal className="gap-xl flex flex-col items-center">
              <SectionHeading align="center" title={event.aboutTitle ?? EVENT_PAGE.aboutFallback} />
              {/* Centred heading, ranged-left prose. Centring the paragraphs
                  as well — which is what the old page did — gives every line
                  a different starting edge, and the eye loses the next one. */}
              <div className="gap-md max-w-content-narrow flex flex-col">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="text-body text-text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      {highlights.length > 0 && (
        <section className="bg-surface py-section">
          <Container>
            <SectionHeading
              align="center"
              title={EVENT_PAGE.why(short)}
              description={event.whyIntro}
              className="mb-2xl"
            />

            {/* Four across at the widest, because four is what the club
                writes; three and two settle into the same grid without a
                special case, and one card centred is still a card. */}
            <Reveal
              staggerChildren
              className="gap-lg tablet:grid-cols-2 desktop:grid-cols-4 grid grid-cols-1"
            >
              {highlights.map((highlight, index) => (
                <RevealItem key={highlight.body.slice(0, 32)} className="h-full">
                  <Card padding="lg" className="gap-sm flex h-full flex-col">
                    <span className="text-eyebrow text-text-subtle tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {highlight.title && (
                      <h3 className="text-body font-semibold">{highlight.title}</h3>
                    )}
                    <p className="text-small text-text-muted">{highlight.body}</p>
                  </Card>
                </RevealItem>
              ))}
            </Reveal>
          </Container>
        </section>
      )}

      {(facts.length > 0 || photoCount > 0) && (
        <section className="py-2xl">
          <Container>
            {/* The rules belong to the facts, not to the button: with no
                audience and no venue written, a bordered band holding one
                button reads as a section that failed to load. */}
            <Reveal
              className={cn(
                'gap-lg tablet:flex-row tablet:items-center tablet:justify-between flex flex-col',
                facts.length > 0 && 'border-border border-y py-6',
              )}
            >
              <ul className="gap-lg tablet:flex-row flex flex-col">
                {facts.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="gap-sm flex items-start">
                    <Icon
                      size={16}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="text-text-subtle mt-0.5 shrink-0"
                    />
                    <span className="flex flex-col">
                      <span className="text-eyebrow text-text-subtle uppercase">{label}</span>
                      <span className="text-small">{value}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {photoCount > 0 && (
                <Button
                  to={`/gallery/${event.slug}`}
                  variant="secondary"
                  iconLeft={<Images size={16} strokeWidth={1.75} aria-hidden="true" />}
                >
                  {photoCount} {EVENT_PAGE.photos}
                </Button>
              )}
            </Reveal>
          </Container>
        </section>
      )}

      <Container className="pb-section">
        <div className="border-border gap-md pt-lg flex flex-wrap items-center justify-between border-t">
          <Link
            to="/events"
            className="text-label text-text-muted hover:text-text gap-xs duration-fast group inline-flex items-center transition-colors"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="duration-fast transition-transform group-hover:-translate-x-0.5"
            />
            {EVENT_PAGE.back}
          </Link>

          {next && (
            <Link
              to={`/events/${next.slug}`}
              className="text-label gap-xs duration-fast group inline-flex items-center transition-colors"
            >
              <span className="text-text-muted">{EVENT_PAGE.next}</span>
              <span className="text-text">{next.name}</span>
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="duration-fast transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>
      </Container>
    </>
  );
}
