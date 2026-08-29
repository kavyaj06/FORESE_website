import { Link } from 'react-router-dom';
import { SITE } from '@/data/site';
import { cn } from '@/lib/cn';

interface LogoProps {
  /** Extra classes for the wordmark text. */
  className?: string;
}

/**
 * The site's identity mark, linking home.
 *
 * Renders the logo file when `SITE.logoSrc` is set and falls back to the
 * wordmark otherwise. The fallback is the point: the club has not supplied a
 * logo yet, and a broken image in the header is worse than well-set type.
 * Supplying one later is a single value in `site.ts` — nothing here changes.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label={`${SITE.name} — home`}
      className="duration-fast ease-out-brand group inline-flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-70"
    >
      {SITE.logoSrc ? (
        <img src={SITE.logoSrc} alt="" width={32} height={32} className="size-8 object-contain" />
      ) : (
        /* Four squares standing in for a mark. Deliberately geometric rather
           than a made-up emblem — it reads as a placeholder, not as a logo
           someone might mistake for the club's real one. */
        <span aria-hidden="true" className="grid shrink-0 grid-cols-2 gap-0.5">
          <span className="bg-accent size-2" />
          <span className="bg-accent size-2" />
          <span className="bg-accent size-2" />
          <span className="bg-accent size-2 opacity-40" />
        </span>
      )}
      <span className={cn('text-h3 tracking-tight', className)}>{SITE.name}</span>
    </Link>
  );
}
