import { useMemo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { CLUB_MEMBERS } from '@/data/team';

/**
 * How many faces are in the strip.
 *
 * Not all hundred and sixty-five. The rail is rendered four times over (see
 * `COPIES`), so every face here costs four `<img>` elements, and a strip of
 * six hundred and sixty is a page that scrolls badly on a phone to show you
 * portraits a centimetre wide. Twenty-four is a wide screen and a half, which
 * is as much as anyone sees of it at once.
 */
const FACES = 24;

/**
 * Enough copies that the ones after the first cover the widest screen.
 *
 * The same coverage argument as `RecruiterMarquee`, and the same number: at
 * the end of a cycle the track has travelled exactly one copy, so what is
 * left on screen is the copies behind it. Shared with the keyframe through
 * `--marquee-copies` so the two cannot disagree.
 */
const COPIES = 4;

/**
 * A strip of the club's own faces, drifting under the team hero.
 *
 * The team page is the largest set of photographs on this site and showed
 * none of them above the fold: a black hero, then tabs, then a grid of
 * portraits at two hundred pixels each. This is the page saying what it is
 * before you have scrolled — a hundred and sixty-five people — in the one
 * currency it has plenty of.
 *
 * **One animated element.** The track moves; the images do not. Animating
 * even twenty-four portraits individually is the documented way to make a
 * page feel worse for having been animated, and the whole strip is a single
 * `transform` on a single container either way.
 *
 * Faces are sampled evenly across the roster rather than taken from the top,
 * so the strip is the club rather than the senior core twice. The sample is
 * an arithmetic stride over the list, so it is stable between renders and
 * costs nothing.
 *
 * Decorative, and marked so: `aria-hidden` on the whole strip and empty alt
 * text on every portrait. A screen reader reaching the team page should find
 * the roster, not twenty-four unnamed images in front of it.
 *
 * Under `prefers-reduced-motion` it renders nothing at all. A still row of
 * cropped faces is not the content — it is the motion that made it read as a
 * crowd — and the roster itself is directly below.
 */
export function PortraitRail() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const faces = useMemo(() => {
    const withPhotos = CLUB_MEMBERS.filter((member) => member.photo);
    if (withPhotos.length === 0) return [];

    const stride = Math.max(1, Math.floor(withPhotos.length / FACES));
    const picked: typeof withPhotos = [];
    for (let i = 0; picked.length < FACES && i < withPhotos.length; i += stride) {
      picked.push(withPhotos[i]);
    }
    return picked;
  }, []);

  if (prefersReducedMotion || faces.length === 0) return null;

  return (
    // `data-theme="inverse"` rather than a black class: it flips `--color-bg`
    // for the subtree, so the band *and* the two edge gradients below read
    // the same token and cannot drift apart. Black because the hero directly
    // above is black — the rail reads as the foot of it rather than as a
    // white shelf between two sections.
    <div
      data-theme="inverse"
      aria-hidden="true"
      className="bg-bg relative w-full overflow-hidden py-4"
    >
      <div
        style={{ '--marquee-copies': COPIES } as React.CSSProperties}
        className="marquee-track flex w-max"
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          // The trailing gutter belongs to the copy, not to the track. On the
          // track it would make the whole thing `n x copy + (n-1) x gap` wide,
          // so one nth of it falls short of a copy by a fraction of the gap
          // and the strip snaps back by that much every loop.
          <div key={copy} className="gap-sm pr-sm flex shrink-0">
            {faces.map((member) => (
              <img
                key={member.id}
                src={member.photo}
                alt=""
                // Only the first copy is worth fetching eagerly; the rest are
                // the same files and come out of cache.
                loading={copy === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                style={{ objectPosition: member.photoPosition ?? '50% 20%' }}
                className="tablet:h-36 tablet:w-28 desktop:h-44 desktop:w-36 h-28 w-22 shrink-0 rounded-md object-cover opacity-85"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Both ends fade into the band rather than being cut off by it, so the
          strip reads as continuing past the screen instead of starting and
          stopping at the edges. */}
      <div
        className="from-bg pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent"
        aria-hidden="true"
      />
      <div
        className="from-bg pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
