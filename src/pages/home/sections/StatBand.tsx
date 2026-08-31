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
  return (
    <section data-theme="inverse" className="py-section relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-dot-grid mask-radial-fade absolute inset-0 -z-10" />

      <Container>
        {/* Equal columns from tablet up. It used to go three-across only at
            `desktop`, so every laptop between the two breakpoints stacked the
            three figures into one long left-aligned column — the band reads as
            a row of figures or it does not read at all. `grid-cols-3` gives
            three 1fr tracks, so the columns stay equal whatever the numbers
            underneath them are. */}
        <Reveal staggerChildren className="gap-xl tablet:grid-cols-3 grid grid-cols-1">
          {HOME_STATS.map((stat) => (
            <RevealItem key={stat.label} className="gap-xs flex flex-col items-center text-center">
              <CountUp value={stat.value} className="text-display leading-none" />
              <p className="text-body-lg text-balance">{stat.label}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
