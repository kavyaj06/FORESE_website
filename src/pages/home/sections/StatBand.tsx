import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { HOME_STATS } from '../data';

/**
 * Three figures, on the inverse band.
 *
 * Kept to three. A row of six numbers is a dashboard, and nobody reads the
 * fourth one on a home page.
 */
export function StatBand() {
  return (
    <section data-theme="inverse" className="py-section relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-dot-grid mask-radial-fade absolute inset-0 -z-10" />

      <Container>
        <Reveal staggerChildren className="gap-xl desktop:grid-cols-3 grid">
          {HOME_STATS.map((stat) => (
            <RevealItem key={stat.label} className="gap-xs flex flex-col">
              <p className="text-display leading-none">{stat.value}</p>
              <p className="text-body-lg">{stat.label}</p>
              <p className="text-small text-text-muted">{stat.note}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
