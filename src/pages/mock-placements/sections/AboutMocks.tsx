import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { ScrollLitText } from '@/components/motion/ScrollLitText';
import { CountUp } from '@/components/motion/CountUp';
import { MOCK_PLACEMENTS_ABOUT } from '../data';

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
  const { eyebrow, title, paragraphs, figures } = MOCK_PLACEMENTS_ABOUT;

  return (
    <section className="py-section border-border border-b">
      <Container width="narrow">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} />
        </Reveal>

        <ScrollLitText
          paragraphs={paragraphs}
          // `text-h3` is the right *size* for the sweep to read a line at a
          // time, but it carries a 600 weight meant for headings; three
          // paragraphs of it is a wall of bold. The weight and leading are
          // dialled back to prose values on top of it.
          className="mt-2xl text-body-lg tablet:text-h3 tablet:leading-relaxed text-text tablet:font-normal text-pretty"
        />
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
    </section>
  );
}
