import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { LogoCarousel3D } from '@/components/motion/LogoCarousel3D';
import {
  MOCK_PLACEMENTS_ABOUT,
  MOCK_PLACEMENTS_COMPANIES_TITLE,
  MOCK_PLACEMENT_CAROUSEL_LOGOS,
} from '../data';

/**
 * What Mock Placements actually is, ahead of the timeline that says how it runs.
 *
 * The problem this section solves is that the source copy is a genuinely long
 * paragraph, and a long paragraph on a landing page is skipped. Rather than
 * cutting it down or dropping it behind a "read more", it is read *through*:
 * `ScrollLitText` dims every word and lights it as the reader scrolls, so
 * scrolling and reading become the same gesture and the length turns into the
 * point of the section instead of a cost.
 *
 * Two consequences shape the layout:
 *
 *  - The type is set large and on a narrow measure. The sweep is only legible
 *    at a size where a whole line is taken in at once, and the effect needs
 *    enough scroll distance to play, which tall narrow text provides for free.
 *  - The section sits on the page's plain background between the black hero
 *    and the `surface` timeline, so the lit words are the brightest thing on
 *    screen while they are being read.
 *
 * The three figures underneath are the numbers already stated in the prose,
 * pulled out so they land for a reader who scrolled past. That is a deliberate
 * repetition, not an oversight — a number inside a paragraph is never seen.
 */
export function AboutMocks() {
  const { eyebrow, title, figures } = MOCK_PLACEMENTS_ABOUT;

  return (
    <section className="py-section border-border border-b">
      <Container width="narrow">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} />
        </Reveal>
      </Container>

      {/* Same `narrow` measure as the prose, so the figures' left edge lands
          on the paragraphs' left edge. On the default width they sat further
          out and the section read as two unrelated blocks. */}
      <Container width="narrow">
        <Reveal
          staggerChildren
          className="mt-3xl gap-lg tablet:grid-cols-3 border-border grid grid-cols-1 border-t"
        >
          {figures.map((figure) => (
            <RevealItem
              key={figure.label}
              className="pt-lg tablet:border-border tablet:border-r tablet:pr-lg tablet:last:border-r-0"
            >
              <p className="text-h2 text-text tabular-nums">
                <CountUp value={figure.value} />
              </p>
              <p className="mt-xs text-body text-text">{figure.label}</p>
              <p className="text-caption text-text-muted mt-1">{figure.note}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>

      {/* Full-bleed, and outside the container on purpose: the strip is meant
          to run off both edges so it reads as continuing past the page rather
          than as a list that happens to be centred. */}
      <div className="mt-3xl">
        <p className="text-eyebrow text-text-subtle px-gutter mb-lg text-center uppercase">
          {MOCK_PLACEMENTS_COMPANIES_TITLE}
        </p>
        <LogoCarousel3D logos={MOCK_PLACEMENT_CAROUSEL_LOGOS} className="text-text-muted" />
      </div>
    </section>
  );
}
