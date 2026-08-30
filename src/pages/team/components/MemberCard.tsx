import { SocialIcon } from '@/components/ui/SocialIcon';
import type { ClubMember } from '@/data/team';
import { findTeam } from '@/data/teams';
import { cn } from '@/lib/cn';
import { MemberPortrait } from './MemberPortrait';

interface MemberCardProps {
  member: ClubMember;
  /** `lead` is the larger senior-core treatment. */
  size?: 'lead' | 'standard';
}

/**
 * One person: portrait, name, role, their line, and how to reach them.
 *
 * Portraits are greyscale at rest and come to full colour on hover. That is
 * not a stylistic tic — a roster of a hundred photographs taken by different
 * people in different light looks like a jumble in colour, and greyscale is
 * what makes the grid read as one deliberate set. It also fits a site that has
 * no colour anywhere else, and gives the hover something to do.
 *
 * The social strip slides in over the portrait rather than sitting under the
 * name. Two links per card across a hundred cards would be two hundred small
 * targets competing with the names; on hover they belong to one person and
 * nothing else is asking to be clicked.
 *
 * The links are real anchors, present in the DOM at all times and revealed by
 * opacity — so they are reachable by keyboard and readable by a screen reader
 * even though sighted users only see them on hover.
 */
export function MemberCard({ member, size = 'standard' }: MemberCardProps) {
  const team = member.team ? findTeam(member.team) : undefined;

  return (
    <article className="group flex flex-col">
      <div
        className={cn(
          'border-border bg-surface-raised relative overflow-hidden rounded-lg border',
          'duration-base ease-out-brand transition-[border-color,box-shadow]',
          'group-hover:border-border-strong group-hover:shadow-lg',
          size === 'lead' ? 'aspect-[4/5]' : 'aspect-square',
        )}
      >
        <div
          className={cn(
            'duration-slow ease-out-brand h-full w-full transition-[transform,filter]',
            'grayscale group-hover:scale-[1.04] group-hover:grayscale-0',
          )}
        >
          <MemberPortrait member={member} />
        </div>

        {/* Scrim only under the strip, so the portrait stays clean. */}
        <span
          aria-hidden="true"
          className="duration-base ease-out-brand pointer-events-none absolute inset-0 bg-gradient-to-l from-black/45 to-transparent opacity-0 group-hover:opacity-100"
        />

        <ul className="gap-xs absolute top-3 right-3 flex flex-col">
          {member.linkedin && (
            <SocialLink
              href={member.linkedin}
              label={`${member.name} on LinkedIn`}
              delay="delay-[40ms]"
            >
              <SocialIcon name="linkedin" size={16} />
            </SocialLink>
          )}
          {member.email && (
            <SocialLink
              href={`mailto:${member.email}`}
              label={`Email ${member.name}`}
              delay="delay-[90ms]"
            >
              <SocialIcon name="mail" size={16} />
            </SocialLink>
          )}
        </ul>
      </div>

      <div className="mt-md flex flex-col gap-0.5">
        <h3 className={cn(size === 'lead' ? 'text-h3' : 'text-body font-semibold')}>
          {member.name}
        </h3>

        <p className="text-small text-text-muted">
          {member.role ?? team?.name ?? 'Member'}
          {member.batch && <span className="text-text-subtle"> · {member.batch}</span>}
        </p>

        {member.quote && (
          <p className="text-caption text-text-muted mt-sm border-border border-l pl-3 italic">
            “{member.quote}”
          </p>
        )}
      </div>
    </article>
  );
}

function SocialLink({
  href,
  label,
  delay,
  children,
}: {
  href: string;
  label: string;
  delay: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');

  return (
    <li>
      <a
        href={href}
        aria-label={label}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={cn(
          'flex size-9 items-center justify-center rounded-md bg-white/15 text-white backdrop-blur-sm',
          'duration-base ease-out-brand translate-x-2 opacity-0 transition-[opacity,transform,background-color]',
          'hover:bg-white/30',
          'group-hover:translate-x-0 group-hover:opacity-100',
          // Keyboard users never trigger the group hover, so focus reveals it too.
          'focus-visible:translate-x-0 focus-visible:opacity-100',
          delay,
        )}
      >
        {children}
      </a>
    </li>
  );
}
