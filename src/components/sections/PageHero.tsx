import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

interface PageHeroProps {
  eyebrow?: string;
  /** The page's `h1`. There must be exactly one per page. */
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or other calls to action. */
  actions?: ReactNode;
  /** The outline centres every page hero, so that is the default. */
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Top-of-page header carrying the `h1`.
 *
 * Every page uses this, which is what guarantees a consistent landing rhythm
 * across the site and exactly one `h1` per page.
 *
 * ⚠️ The visual treatment here is provisional — Phase 0b replaces it with the
 * hero design from the anchor template.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  align = 'center',
  className,
}: PageHeroProps) {
  return (
    <header className={cn('border-border border-b py-section', className)}>
      <Container>
        <Reveal className={cn('flex flex-col gap-lg', align === 'center' && 'items-center text-center')}>
          {eyebrow && <p className="text-eyebrow text-accent uppercase">{eyebrow}</p>}

          <h1 className="text-h1">{title}</h1>

          {description && (
            <p className="text-body-lg text-text-muted max-w-content-narrow">{description}</p>
          )}

          {actions && (
            <div className={cn('flex flex-wrap gap-sm pt-xs', align === 'center' && 'justify-center')}>
              {actions}
            </div>
          )}
        </Reveal>
      </Container>
    </header>
  );
}
