import { Container } from '@/components/layout/Container';
import { CountUp } from '@/components/motion/CountUp';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { HOME_STATS } from '../data';

/**
 * Three figures, on the inverse band.
 *
 * Kept to three. A row of six numbers is a dashboard, and nobody reads the
 * fourth one on a home page.
 *
 * The figures count up the first time the band is reached. The motion is the
 * point of the section — a number that arrives rather than one that was
 * always sitting there.
 *
 * Centred within their columns, not left-aligned. The columns are equal
 * thirds, but the labels are not equal lengths, so left-aligning them left
 * each figure hard against its column's left edge and a widening band of empty
 * space to its right — worst at the third, where it read as the row having
 * been pushed off-centre. Centring puts the weight in the middle of each third
 * and the gaps between them become even.
 */
export function StatBand() {
  // A solid brand panel rather than the black band this was. Three figures
  // across the full width is the one place on the home page that is already a
  // block, so it is the place the palette can be a block too — and it gives
  // the page a band of colour between two white sections instead of a second
  // run of black.
  //
  // Flat crimson, not the gradient: white over the ramp's amber end is 2.0:1.
  // A panel that has to carry text is a flat colour, and crimson under white
  // is 4.64:1.
  return (
    <section data-tone="brand" className="py-section relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-dot-grid mask-radial-fade absolute inset-0 -z-10" />

      <Container>
        {/* Three across at every width, phones included. The band reads as a
            row of figures or it does not read at all: stacked one per screen,
            they arrive as three unrelated numbers with no sense that they
            belong together, and the section costs three screens of scrolling
            to say one thing. The type shrinks to fit instead — see below. */}
        <Reveal staggerChildren className="gap-md tablet:gap-xl grid grid-cols-3">
          {HOME_STATS.map((stat) => (
            <RevealItem key={stat.label} className="gap-xs flex flex-col items-center text-center">
              {/* The figure steps down twice on the way to a phone. At
                  `text-display` three of these will not sit side by side on a
                  390px screen, and shrinking the row rather than stacking it
                  is the trade that keeps the three readable as one set. */}
              <CountUp
                value={stat.value}
                className="text-h2 tablet:text-h1 desktop:text-display leading-none"
              />
              <p className="text-caption tablet:text-body desktop:text-body-lg text-balance">
                {stat.label}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
