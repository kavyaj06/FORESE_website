import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface IconChipProps {
  icon: LucideIcon;
  className?: string;
}

/**
 * The square an icon sits in on a Placement Prep card — and the part of the
 * card that answers a pointer.
 *
 * These cards are not links. They go nowhere, so they must not lift: `Card`'s
 * `interactive` prop is a promise of a click, and the repeated advice of this
 * page is that a card which moves under the cursor and then does nothing is
 * worse than a card which never moved. The chip filling in is the opposite
 * trade — the card acknowledges the pointer without claiming to be a target.
 *
 * It used to invert to black, on the grounds that the whole site was black
 * and white and a tint would be the only coloured hover on it. The site has a
 * brand colour now, so the chip takes it. Outside the pages that opt into
 * that colour `--color-accent` is still black, so this is the same hover it
 * always was anywhere else.
 *
 * `group-hover/tip` and not plain `group-hover`: these cards sit inside
 * reveal wrappers and grids that may carry groups of their own, and an
 * unnamed group binds to the nearest one, whichever that turns out to be.
 */
export function IconChip({ icon: Icon, className }: IconChipProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'border-border bg-surface text-text flex size-10 shrink-0 items-center justify-center rounded-md border',
        'duration-base ease-out-brand transition-colors',
        'group-hover/tip:bg-accent group-hover/tip:text-accent-fg group-hover/tip:border-accent',
        className,
      )}
    >
      <Icon size={18} strokeWidth={1.75} />
    </span>
  );
}
