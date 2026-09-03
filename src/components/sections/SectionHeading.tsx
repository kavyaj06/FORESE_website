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
      {/* A filled pill, not a line of coloured type. Every reference sets its
          section label this way, and the reason is hierarchy: a label and a
          title stacked in two weights of the same treatment read as one lump,
          where a solid chip above a large title reads as a tag on a thing.
          Black rather than brand — the brand is spent on the marker and the
          panels, and a crimson chip on every section would leave those
          nothing to be. `bg-text` inverts itself on a dark section. */}
      {eyebrow && (
        <p
          className={cn(
            'text-eyebrow bg-text text-text-inverse rounded-pill w-fit px-3 py-1 uppercase',
            align === 'center' && 'mx-auto',
          )}
        >
          {eyebrow}
        </p>
      )}

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
