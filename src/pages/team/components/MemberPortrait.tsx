import { useState } from 'react';
import type { ClubMember } from '@/data/team';
import { cn } from '@/lib/cn';

/**
 * A person's portrait, or their initials when there is no photograph.
 *
 * Deliberately a monogram and not a stock face or a silhouette icon. A
 * generated face would misrepresent a real person, and a grey silhouette makes
 * a page of people look like a page of empty accounts. Initials read as "photo
 * pending" while still identifying who the card belongs to.
 *
 * A photograph that fails to load falls back to the same monogram. The roster
 * names a file for everyone, and the files arrive separately — so until they
 * do, and any time one is missing or misnamed, the card shows initials rather
 * than a broken-image icon. The roster is the record of what the photograph
 * should be called; whether it is on disk yet is not something it can know.
 */
/**
 * Where a portrait sits in its frame when nobody has said otherwise.
 *
 * Not the browser's centre. These photographs are nearly all taller than the
 * square they are cropped into — 40 of them with no framing of their own —
 * and a person photographed standing has their head in the top third, so a
 * centre crop takes the face off: measured across the roster, it was cutting
 * heads on a dozen cards at once.
 *
 * A fifth of the way down is the value the hand-tuned entries already settled
 * on most often, and it is safe for the rest: where a photograph is square or
 * wider there is no vertical overflow for it to act on, and where a face is
 * already centred the window still contains it.
 */
const DEFAULT_POSITION = '50% 20%';

export function MemberPortrait({ member, className }: { member: ClubMember; className?: string }) {
  const [failed, setFailed] = useState(false);

  const initials = member.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  if (member.photo && !failed) {
    return (
      <img
        src={member.photo}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        // Framing corrections live on the person, not here — see the fields
        // on `ClubMember`. The zoom is a transform on the image itself rather
        // than on the wrapper, which already carries the card's hover scale;
        // the two would otherwise fight over one property.
        style={{
          objectPosition: member.photoPosition ?? DEFAULT_POSITION,
          transform: member.photoZoom ? `scale(${member.photoZoom})` : undefined,
        }}
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
