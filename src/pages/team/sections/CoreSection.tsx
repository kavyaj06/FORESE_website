import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { membersByRank } from '@/data/teams';
import { MemberCard } from '../components/MemberCard';
import { TEAM_SECTIONS } from '../data';

/**
 * Senior core, then junior core.
 *
 * Senior core get the taller portrait and a four-across grid; junior core
 * follow five across. The size difference is the hierarchy — rendered at one
 * scale the page would say the nine and the ten are interchangeable, which is
 * the one thing a team page has to get right.
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
              description={TEAM_SECTIONS.seniorCore.description}
            />
          </Reveal>

          <div className="mt-2xl gap-lg tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-2">
            {senior.map((member, index) => (
              <Reveal key={member.id} delay={(index % 4) * 0.06} motionStyle="scale">
                <MemberCard member={member} size="lead" />
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
                <MemberCard member={member} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
