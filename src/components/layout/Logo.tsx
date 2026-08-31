import { Link } from 'react-router-dom';
import { SITE } from '@/data/site';
import { cn } from '@/lib/cn';
import { ForeseMark } from './ForeseMark';

interface LogoProps {
  /**
   * Sizing for the mark, as a height. Width follows from the artwork's own
   * proportions, so only ever set a height here — `h-8`, `h-10` — and never a
   * width, or the logo distorts.
   */
  className?: string;
}

/**
 * The site's identity mark, linking home.
 *
 * The club's artwork already contains the word FORESE, so this renders the
 * lockup alone — there is deliberately no text node beside it, which would
 * print the name twice.
 *
 * That also means the link needs its own accessible name: the mark is
 * `aria-hidden`, and `aria-label` here is the only thing announcing where the
 * link goes.
 *
 * The mark inherits `currentColor`, so it is dark in the header and light in
 * the inverse footer and loading curtain without a second asset or a filter.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label={`${SITE.name} home`}
      // `w-fit` stops the link stretching to its container's full width inside
      // the footer's flex column, which left a click target hundreds of pixels
      // wide that navigated home from empty space. It has to be `w-fit` alone:
      // `self-start` also fixes that, but it overrides the header row's
      // `items-center` and pins the logo to the top of the bar instead.
      className="duration-fast ease-out-brand inline-flex w-fit shrink-0 items-center transition-opacity hover:opacity-70"
    >
      {/* h-12, not something smaller: only about a third of this artwork's
          height is letterforms — the rest is the tall rule and its crossbars.
          At 36px the word rendered at an 12px cap height, noticeably smaller
          than the text wordmark it replaced. 48px puts the cap back at ~16px,
          level with the `text-h3` lockup that was here before. */}
      <ForeseMark className={cn('h-12 w-auto', className)} />
    </Link>
  );
}
