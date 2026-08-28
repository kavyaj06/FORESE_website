import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerWidth = 'default' | 'narrow' | 'full';

interface ContainerProps {
  children: ReactNode;
  /**
   * `default` — standard 1200px content column.
   * `narrow`  — 768px, for long-form prose where line length matters.
   * `full`    — edge-to-edge, gutters only. For full-bleed media.
   */
  width?: ContainerWidth;
  /** Render as a different element, e.g. `section` or `header`. */
  as?: ElementType;
  className?: string;
}

const WIDTHS: Record<ContainerWidth, string> = {
  default: 'max-w-content',
  narrow: 'max-w-content-narrow',
  full: 'max-w-none',
};

/**
 * The single source of horizontal layout on the site.
 *
 * Max-width and page gutter are defined here and nowhere else, which is what
 * keeps every section's left edge aligned. If a section needs a different
 * width, it passes a `width` prop — it never sets its own padding.
 */
export function Container({ children, width = 'default', as: Tag = 'div', className }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-gutter', WIDTHS[width], className)}>{children}</Tag>
  );
}
