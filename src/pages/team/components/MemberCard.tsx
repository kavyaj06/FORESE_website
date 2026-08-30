import { SocialIcon } from '@/components/ui/SocialIcon';
import type { ClubMember } from '@/data/team';
import { findTeam } from '@/data/teams';
import { cn } from '@/lib/cn';
import { MemberPortrait } from './MemberPortrait';

interface MemberCardProps {
  member: ClubMember;
  /** `lead` is the taller senior-core treatment. */
  size?: 'lead' | 'standard';
}

/**
 * One person, in one card: portrait, name, position, their line — and their
 * links on hover.
 *
 * On hover the whole card takes the theme colour, exactly as the reference
 * does in green. Ours is black, so the card fills black and its text flips to
 * white: the hovered person is lifted out of the grid and everyone around them
 * recedes. That single fill is doing what a coloured brand would do elsewhere.
 *
 * The portrait sits inset inside the card rather than bleeding to its edge.
 * That inset is what makes the fill read as a frame around the person instead
 * of the card simply changing colour behind them.
 *
 * Portraits are greyscale at rest and full colour on hover — a hundred
 * photographs taken by different people in different light look like a jumble
 * in colour, and greyscale is what makes the grid read as one deliberate set.
 *
 * The links are real anchors, in the DOM at all times and revealed by opacity,
 * so keyboard users reach them and screen readers read them even though
 * sighted users only see them on hover. Focus reveals the strip too, since
 * keyboard users never fire a group hover.
 */
export function MemberCard({ member, size = 'standard' }: MemberCardProps) {
  const team = member.team ? findTeam(member.team) : undefined;
  const position = member.role ?? team?.name ?? 'Member';

  return (
    <article
      className={cn(
        'group border-border bg-surface-raised relative flex h-full flex-col rounded-lg border p-2',
        // 400ms on an even curve: the fill should be seen happening. Movement
        // and colour together are what make the hovered card feel picked up
        // rather than simply repainted.
        'ease-smooth transition-[background-color,border-color,box-shadow,translate] duration-[400ms]',
        'hover:border-accent hover:bg-accent hover:-translate-y-1.5 hover:shadow-lg',
        'focus-within:border-accent focus-within:bg-accent focus-within:-translate-y-1.5',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-md',
          size === 'lead' ? 'aspect-[4/5]' : 'aspect-square',
        )}
      >
        <div className="duration-slow ease-out-brand h-full w-full grayscale transition-[transform,filter] group-focus-within:grayscale-0 group-hover:scale-[1.04] group-hover:grayscale-0">
          <MemberPortrait member={member} />
        </div>

        {/* Vertical pill on the photograph's right edge, as in the reference. */}
        <ul
          className={cn(
            'bg-accent-fg absolute top-1/2 right-2 flex -translate-y-1/2 flex-col gap-1.5 rounded-xl p-1.5 shadow-md',
            'duration-base ease-out-brand translate-x-3 opacity-0 transition-[opacity,transform]',
            'group-hover:translate-x-0 group-hover:opacity-100',
            'group-focus-within:translate-x-0 group-focus-within:opacity-100',
          )}
        >
          {member.linkedin && (
            <SocialPill href={member.linkedin} label={`${member.name} on LinkedIn`}>
              <SocialIcon name="linkedin" size={15} />
            </SocialPill>
          )}
          {member.email && (
            <SocialPill href={`mailto:${member.email}`} label={`Email ${member.name}`}>
              <SocialIcon name="mail" size={15} />
            </SocialPill>
          )}
        </ul>
      </div>

      <div className="pt-md flex flex-1 flex-col gap-0.5 px-1.5 pb-1">
        <h3
          className={cn(
            'ease-smooth group-hover:text-accent-fg group-focus-within:text-accent-fg transition-colors duration-[400ms]',
            size === 'lead' ? 'text-h3' : 'text-body font-semibold',
          )}
        >
          {member.name}
        </h3>

        <p className="text-small text-text-muted ease-smooth group-hover:text-accent-fg/75 group-focus-within:text-accent-fg/75 transition-colors duration-[400ms]">
          {position}
          {member.batch && <span> · {member.batch}</span>}
        </p>

        {member.quote && (
          <p className="text-caption text-text-muted border-border mt-sm ease-smooth group-hover:border-accent-fg/25 group-hover:text-accent-fg/80 group-focus-within:text-accent-fg/80 border-l pl-3 italic transition-colors duration-[400ms]">
            “{member.quote}”
          </p>
        )}
      </div>
    </article>
  );
}

function SocialPill({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');

  return (
    <li>
      <a
        href={href}
        aria-label={label}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="bg-accent text-accent-fg hover:bg-primary-hover duration-fast rounded-pill flex size-8 items-center justify-center transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
