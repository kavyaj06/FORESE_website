import { Reveal } from '@/components/motion/Reveal';
import type { ClubTeam } from '@/data/teams';
import { teamLeads, teamMembers } from '@/data/teams';

/**
 * One working team: what it does, who leads it, and everyone on it.
 *
 * The leads are named here, not pictured. Their portraits are already in the
 * junior core section above, and showing the same face twice on one page is
 * exactly what this structure exists to avoid — so the team block references
 * them by name and the reader has already met them.
 *
 * Members are names in columns rather than cards. With around eighteen per
 * team, cards would turn a readable list into five walls, and a name with a
 * batch is the information anyone is actually looking for.
 */
export function TeamBlock({ team }: { team: ClubTeam }) {
  const leads = teamLeads(team.id);
  const members = teamMembers(team.id);

  return (
    <article className="border-border py-2xl border-t">
      <div className="gap-xl desktop:grid-cols-[22rem_1fr] grid">
        <div className="gap-sm flex flex-col">
          <h3 className="text-h2">{team.name}</h3>
          <p className="text-body text-text-muted max-w-[46ch]">{team.description}</p>

          {leads.length > 0 && (
            <p className="text-small text-text mt-xs">
              <span className="text-text-subtle">Led by </span>
              {leads.map((lead, i) => (
                <span key={lead.id}>
                  {i > 0 && <span className="text-text-subtle"> and </span>}
                  {lead.name}
                </span>
              ))}
            </p>
          )}

          <p className="text-caption text-text-subtle">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        <ul className="gap-x-lg gap-y-sm desktop:columns-3 columns-2">
          {members.map((member, index) => (
            <Reveal key={member.id} as="li" delay={Math.min(index, 8) * 0.02}>
              <span className="text-small gap-xs flex break-inside-avoid items-baseline">
                <span className="text-text">{member.name}</span>
                {member.batch && (
                  <span className="text-caption text-text-subtle tabular-nums">{member.batch}</span>
                )}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </article>
  );
}
