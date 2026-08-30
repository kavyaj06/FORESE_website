import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { membersByRank } from '@/data/teams';
import { CoreCard } from '../components/CoreCard';
import { TEAM_SECTIONS } from '../data';

/**
 * The two core groups.
 *
 * Senior core get the larger portrait and a wider grid; junior core follow in
 * a tighter one. The size difference is the hierarchy — with everyone at the
 * same scale the page would say the nine and the ten are interchangeable.
 */
export function CoreSection() {
  const senior = membersByRank('senior-core');
  const junior = membersByRank('junior-core');

  return (
    <>
      <section className="py-section">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={TEAM_SECTIONS.seniorCore.eyebrow}
              title={TEAM_SECTIONS.seniorCore.title}
            />
          </Reveal>

          <div className="mt-2xl gap-lg tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-2">
            {senior.map((member, index) => (
              <Reveal key={member.id} delay={(index % 4) * 0.06} motionStyle="scale">
                <CoreCard member={member} size="lead" />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-border bg-surface py-section border-t">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={TEAM_SECTIONS.juniorCore.eyebrow}
              title={TEAM_SECTIONS.juniorCore.title}
              description={TEAM_SECTIONS.juniorCore.description}
            />
          </Reveal>

          <div className="mt-2xl gap-lg tablet:grid-cols-4 desktop:grid-cols-5 grid grid-cols-2">
            {junior.map((member, index) => (
              <Reveal key={member.id} delay={(index % 5) * 0.05} motionStyle="scale">
                <CoreCard member={member} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
