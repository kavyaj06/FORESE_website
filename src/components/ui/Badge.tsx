import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-text-muted border-border',
  accent: 'bg-accent-subtle text-accent border-transparent',
  success: 'bg-surface text-success border-border',
  warning: 'bg-surface text-warning border-border',
};

/**
 * Small non-interactive status label — "Upcoming", "Registrations open".
 *
 * Deliberately not clickable. If the design turns out to need clickable
 * filter chips (likely on Gallery), that becomes its own component rather
 * than a variant here, because the semantics differ: a chip is a button.
 */
export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-eyebrow rounded-pill inline-flex items-center border px-2.5 py-1 uppercase',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
