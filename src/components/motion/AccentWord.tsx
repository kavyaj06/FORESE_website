import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A single word set in serif italic inside a sans headline.
 *
 * This is how a headline gets emphasis on a site with no colour in it. The
 * face change does what a highlight colour would do elsewhere, and because it
 * is only ever one or two words it reads as stress rather than as a second
 * typeface competing with the first.
 *
 * Purely visual — it carries no semantic weight, so it is a `span` and not an
 * `<em>`. If a word ever needs real emphasis for a screen reader, that is a
 * different element.
 */
export function AccentWord({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('pr-[0.06em] font-serif italic', className)}>{children}</span>;
}
