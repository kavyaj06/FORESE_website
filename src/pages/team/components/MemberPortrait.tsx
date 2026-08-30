import type { ClubMember } from '@/data/team';
import { cn } from '@/lib/cn';

/**
 * A person's portrait, or their initials when there is no photograph.
 *
 * Deliberately a monogram and not a stock face or a silhouette icon. A
 * generated face would misrepresent a real person, and a grey silhouette makes
 * a page of people look like a page of empty accounts. Initials read as "photo
 * pending" while still identifying who the card belongs to.
 */
export function MemberPortrait({ member, className }: { member: ClubMember; className?: string }) {
  const initials = member.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-surface text-text-subtle font-display flex h-full w-full items-center justify-center text-[1.5rem] font-semibold tracking-tight select-none',
        className,
      )}
    >
      {initials}
    </span>
  );
}
