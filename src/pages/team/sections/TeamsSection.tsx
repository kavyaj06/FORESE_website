import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { CLUB_TEAMS, unassignedMembers } from '@/data/teams';
import { TeamBlock } from '../components/TeamBlock';
import { TEAM_SECTIONS } from '../data';

/**
 * The working teams, and anyone not yet on one.
 *
 * The unassigned block is not decoration: a roster of ninety will always have
 * somebody between teams, and a page that silently omits them is a page that
 * tells a member they are not in the club.
 */
export function TeamsSection() {
  const unassigned = unassignedMembers();

  return (
    <section className="py-section">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={TEAM_SECTIONS.teams.eyebrow}
            title={TEAM_SECTIONS.teams.title}
            description={TEAM_SECTIONS.teams.description}
          />
        </Reveal>

        <div className="mt-2xl">
          {CLUB_TEAMS.map((team) => (
            <Reveal key={team.id}>
              <TeamBlock team={team} />
            </Reveal>
          ))}

          {unassigned.length > 0 && (
            <Reveal>
              <article className="border-border py-2xl border-t">
                <div className="gap-xl desktop:grid-cols-[22rem_1fr] grid">
                  <div className="gap-sm flex flex-col">
                    <h3 className="text-h2">Members</h3>
                    <p className="text-body text-text-muted max-w-[46ch]">
                      Club members not currently assigned to a working team.
                    </p>
                    <p className="text-caption text-text-subtle">{unassigned.length} members</p>
                  </div>

                  <ul className="gap-x-lg gap-y-sm desktop:columns-3 columns-2">
                    {unassigned.map((member) => (
                      <li key={member.id} className="text-small break-inside-avoid">
                        {member.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
