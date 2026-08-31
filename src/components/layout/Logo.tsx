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
      aria-label={`${SITE.name} — home`}
      // `w-fit` and `self-start` matter: inside a flex column the link would
      // otherwise stretch to the container's full width, leaving a click
      // target hundreds of pixels wide that navigates home from empty space.
      className="duration-fast ease-out-brand inline-flex w-fit shrink-0 items-center self-start transition-opacity hover:opacity-70"
    >
      <ForeseMark className={cn('h-9 w-auto', className)} />
    </Link>
  );
}
