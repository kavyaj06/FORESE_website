import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  /**
   * Adds hover lift and a stronger border. Use only when the whole card is
   * genuinely clickable — never as decoration, or the card lies about being
   * interactive.
   */
  interactive?: boolean;
  padding?: CardPadding;
  as?: ElementType;
  className?: string;
}

const PADDING: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-md',
  md: 'p-lg',
  lg: 'p-xl',
};

/**
 * The surface primitive: bordered panel on the page background.
 *
 * Radius, border and shadow all come from tokens, so every card on the site
 * shares one silhouette. Page-specific cards should compose this rather than
 * re-declaring `rounded-* border-* shadow-*` themselves.
 */
export function Card({
  children,
  interactive = false,
  padding = 'md',
  as: Tag = 'div',
  className,
}: CardProps) {
  return (
    <Tag
      className={cn(
        'bg-surface-raised border-border rounded-lg border',
        PADDING[padding],
        interactive &&
          'ease-out-brand duration-base hover:border-border-strong hover:shadow-md transition-[border-color,box-shadow,transform] hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
