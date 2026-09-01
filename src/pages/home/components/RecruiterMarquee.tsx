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
 * The list is rendered several times and the track travels exactly one copy,
 * so the next copy lands where the last began and the loop point is invisible.
 *
 * **Why four copies and not two.** Seamlessness and coverage are different
 * requirements, and two copies only satisfied the first. At the end of the
 * loop the track has moved one copy to the left, so what remains on screen is
 * whatever follows that copy — with two copies, one copy's width. Anything
 * wider than that showed blank: measured at 226px of empty space after the
 * last name on a 1440px screen and 706px on a 1920px one, once per cycle. The
 * rule is that the copies after the first must cover the viewport, so a
 * viewport up to three copies wide — 3642px here — is covered by four.
 *
 * The spacing between copies is a trailing gutter on each copy rather than a
 * gap on the track. On the track it made the track `n x copy + (n-1) x gap`
 * wide, so one nth of it fell short of a full copy by a fraction of the gap,
 * and the strip snapped back by that much every loop.
 */
/**
 * Enough copies that the ones after the first cover the widest screen this is
 * likely to meet. See the note above: this is a coverage number, not a
 * stylistic one, and it is shared with the keyframe through a custom property
 * so the two can never disagree.
 */
const COPIES = 4;

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
      <div
        style={{ '--marquee-copies': COPIES } as React.CSSProperties}
        className="marquee-track flex w-max group-hover:[animation-play-state:paused]"
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          // `pr-xl` matching the inner `gap-xl` is what keeps the seam exact:
          // the gutter after the last name of a copy has to equal the gutter
          // between names, and it has to belong to the copy rather than to the
          // track. See the note above.
          <ul key={copy} aria-hidden={copy > 0} className="gap-xl pr-xl flex shrink-0 items-center">
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
