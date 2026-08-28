import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  /** Small uppercase kicker above the title. Optional. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  /**
   * Heading level. Defaults to `h2`, which is correct for a section inside a
   * page whose `h1` is the page title. Override only to keep the document
   * outline correct — never to change the visual size.
   */
  as?: 'h2' | 'h3';
  className?: string;
}

/**
 * The standard section title block.
 *
 * Exists so that the eyebrow → title → description rhythm is identical in
 * every section on every page. Sections should not hand-roll their own
 * heading markup; the vertical spacing here is part of the design system.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'gap-sm flex flex-col',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && <p className="text-eyebrow text-accent uppercase">{eyebrow}</p>}

      <Tag className={cn(Tag === 'h2' ? 'text-h2' : 'text-h3')}>{title}</Tag>

      {description && (
        <p
          className={cn(
            'text-body-lg text-text-muted max-w-content-narrow',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
