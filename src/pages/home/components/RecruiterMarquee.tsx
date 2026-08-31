import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { RECRUITERS } from '../data';

/**
 * The companies that send interviewers, scrolling slowly across the foot of
 * the hero.
 *
 * A moving strip is the one place this site uses continuous animation, and it
 * is a considered exception: the list is real content that does not fit the
 * width, so the motion is what makes it readable rather than decoration for
 * its own sake. It pauses on hover so a name can actually be read, and stops
 * entirely under `prefers-reduced-motion`, where it becomes a plain wrapped
 * list.
 *
 * The list is rendered twice and the track translates by half its own width,
 * so copy two lands exactly where copy one began and the loop point is
 * invisible.
 *
 * That only holds if half the track width is exactly one copy. The gap between
 * the two copies used to live on the track, which made the track
 * `2 x copy + gap` wide — so half of it was `copy + gap/2`, sixteen pixels
 * short of a full copy on a 32px gap. Every loop the strip snapped back by
 * that much: the last name appeared to stall, then the first two jumped in.
 * The spacing between copies is now a trailing gutter on each copy instead, so
 * the track is exactly `2 x (copy + gap)` and half of it is exactly one copy.
 */
export function RecruiterMarquee() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <ul className="gap-x-xl gap-y-sm text-label text-text-muted px-gutter mt-3xl flex flex-wrap justify-center">
        {RECRUITERS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-3xl group relative overflow-hidden">
      <div className="marquee-track flex w-max group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          // `pr-xl` matching the inner `gap-xl` is what keeps the seam exact:
          // the gutter after the last name of a copy has to equal the gutter
          // between names, and it has to belong to the copy rather than to the
          // track. See the note above.
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="gap-xl pr-xl flex shrink-0 items-center"
          >
            {RECRUITERS.map((name) => (
              <li key={name} className="text-h3 text-text-muted whitespace-nowrap opacity-70">
                {name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
