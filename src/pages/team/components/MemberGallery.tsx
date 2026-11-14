import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import type { ClubMember } from '@/data/team';
import { TEAM_GALLERY } from '../data';
import { MemberPortrait } from './MemberPortrait';

/**
 * The membership as a gallery: a grid of portraits, and one of them large.
 *
 * Built to the reference the club supplied. A structured grid on the left, a
 * single featured portrait held on the right, and the rest of the grid
 * stepping back once somebody has been picked.
 *
 * **A real grid, explicitly.** The brief rules out scattered cards, random
 * offsets and masonry, and this is a plain CSS grid: equal columns, one gap,
 * one aspect ratio. Nothing is positioned by hand, so adding a person cannot
 * put a hole in it.
 *
 * **The featured panel is sticky, not fixed.** There are 84 people in the
 * larger of the two ranks and the grid is several screens tall; sticky keeps
 * the portrait beside whatever part of the grid is on screen, and still lets
 * it scroll away with the section rather than hanging over the footer.
 *
 * **The grid does not dim until it has been used.** Both of the club's
 * reference shots are in this component: untouched the portraits are all at
 * full strength, and once a face has been picked the others fall back so the
 * chosen one reads. Dimming on arrival would mean a reader's first sight of
 * the membership is 139 faded photographs.
 *
 * Under `prefers-reduced-motion` nothing dims and nothing transitions. The
 * panel still changes, instantly: the content is the point, the fade is not.
 */
export function MemberGallery({ members }: { members: ClubMember[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [pickedId, setPickedId] = useState<string | null>(null);

  // A different rank arrived; whoever was picked is not in it.
  useEffect(() => {
    setPickedId(null);
  }, [members]);

  const featured = members.find((member) => member.id === pickedId) ?? members[0];
  // Nothing dims until the reader has actually chosen somebody.
  const dimming = pickedId !== null && !prefersReducedMotion;

  if (!featured) return null;

  return (
    <div className="gap-xl desktop:gap-2xl desktop:grid-cols-[1fr_20rem] wide:desktop:grid-cols-[1fr_24rem] grid grid-cols-1">
      {/* The panel comes first in the source so a phone, which stacks, meets
          the person before the wall of faces. At desktop the grid is pulled
          back into the first column, so reading order and visual order agree
          at both widths without duplicating the markup. */}
      <div className="desktop:order-2">
        <div className="desktop:sticky desktop:top-28">
          <motion.figure
            // Keyed on the person, so a new portrait arrives rather than one
            // face cross-dissolving into another.
            key={featured.id}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-inverse relative overflow-hidden rounded-lg"
          >
            <div className="aspect-[3/4] w-full">
              <MemberPortrait member={featured} />
            </div>

            {/* Its own layer, so the caption above it does not have to own a
                background at all. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
            />

            <figcaption
              data-theme="inverse"
              data-rules="off"
              // The inverse theme is here for its text colours — white, and a
              // light grey under it — but it also paints a background, which
              // sat under the gradient and turned it into a solid black bar
              // below the photograph instead of a wash across it. Inline,
              // because a utility class ties with the theme block on
              // specificity and the winner is then down to stylesheet order.
              style={{ backgroundColor: 'transparent' }}
              className="p-lg absolute inset-x-0 bottom-0"
            >
              <p className="text-h3">{featured.name}</p>
              <p className="text-body text-text-muted">
                {featured.role ?? TEAM_GALLERY.ranks[featured.rank] ?? TEAM_GALLERY.noRole}
              </p>
            </figcaption>
          </motion.figure>
        </div>
      </div>

      <ul className="gap-md tablet:grid-cols-4 desktop:grid-cols-5 desktop:order-1 grid grid-cols-3">
        {members.map((member) => {
          const isPicked = member.id === featured.id && pickedId !== null;

          return (
            <li key={member.id}>
              <button
                type="button"
                aria-pressed={isPicked}
                aria-label={TEAM_GALLERY.pick.replace('{name}', member.name)}
                onClick={() => setPickedId(member.id)}
                // Hover and focus pick too, which is what makes it a gallery
                // rather than a list of buttons: on a pointer device the
                // featured panel follows the cursor across the wall.
                onMouseEnter={() => setPickedId(member.id)}
                onFocus={() => setPickedId(member.id)}
                className={cn(
                  'bg-surface-inverse block w-full overflow-hidden rounded-md',
                  'ease-out-brand transition-opacity duration-300',
                  dimming && !isPicked && 'opacity-25 hover:opacity-100',
                )}
              >
                <span className="block aspect-[3/4] w-full">
                  <MemberPortrait member={member} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
