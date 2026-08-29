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
 * The list is rendered twice. A track that translates by exactly half its
 * width with two identical copies has no seam — the loop point is invisible
 * because copy two is already where copy one started.
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
      <div className="marquee-track gap-xl flex w-max group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="gap-xl flex shrink-0 items-center">
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
