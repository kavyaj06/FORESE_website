import type { ClubMember } from '@/data/team';
import { cn } from '@/lib/cn';
import { MemberPortrait } from './MemberPortrait';

interface CoreCardProps {
  member: ClubMember;
  /** `lead` is the larger senior-core treatment. */
  size?: 'lead' | 'standard';
}

/**
 * A core member: portrait, name, title.
 *
 * Only the 19 core members get a card like this. The 90 general members are
 * listed by name inside their team instead — ninety portrait cards would be a
 * wall to scroll rather than a page to read, and no club has ninety usable
 * headshots.
 */
export function CoreCard({ member, size = 'standard' }: CoreCardProps) {
  return (
    <article className="group">
      <div
        className={cn(
          'border-border bg-surface-raised relative overflow-hidden rounded-lg border',
          'duration-base ease-out-brand transition-[border-color,box-shadow]',
          'group-hover:border-border-strong group-hover:shadow-md',
          size === 'lead' ? 'aspect-[4/5]' : 'aspect-square',
        )}
      >
        <div className="duration-slow ease-out-brand h-full w-full transition-transform group-hover:scale-[1.03]">
          <MemberPortrait member={member} />
        </div>
      </div>

      <div className="mt-md flex flex-col gap-0.5">
        <h3 className={cn(size === 'lead' ? 'text-h3' : 'text-body font-semibold')}>
          {member.name}
        </h3>
        {member.role && <p className="text-small text-text-muted">{member.role}</p>}
        {member.batch && <p className="text-caption text-text-subtle">Batch of {member.batch}</p>}
      </div>
    </article>
  );
}
