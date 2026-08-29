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
 */
export function StatBand() {
  return (
    <section data-theme="inverse" className="py-section relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-dot-grid mask-radial-fade absolute inset-0 -z-10" />

      <Container>
        <Reveal staggerChildren className="gap-xl desktop:grid-cols-3 grid">
          {HOME_STATS.map((stat) => (
            <RevealItem key={stat.label} className="gap-xs flex flex-col">
              <CountUp value={stat.value} className="text-display leading-none" />
              <p className="text-body-lg">{stat.label}</p>
              <p className="text-small text-text-muted">{stat.note}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
