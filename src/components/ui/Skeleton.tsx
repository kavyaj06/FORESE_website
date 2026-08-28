import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

/**
 * Loading placeholder.
 *
 * Size it with utilities at the call site (`h-4 w-32`, `aspect-square`) so the
 * skeleton matches the shape of whatever it stands in for — that is what stops
 * the layout jumping when real content arrives.
 *
 * `aria-hidden` because a screen reader should hear the loading state from a
 * live region, not from a row of empty boxes.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface rounded-md',
        'bg-[linear-gradient(90deg,var(--color-surface)_25%,var(--color-border)_37%,var(--color-surface)_63%)]',
        'bg-[length:400%_100%]',
        'motion-safe:animate-[forese-shimmer_1.4s_ease-in-out_infinite]',
        className,
      )}
    />
  );
}
