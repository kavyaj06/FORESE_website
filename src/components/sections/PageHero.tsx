import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { fadeInOnly, riseIn, stagger } from '@/components/motion/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
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
  /**
   * `display` is the full-height landing treatment. `compact` is for pages
   * whose content should start higher up the screen.
   */
  size?: 'display' | 'compact';
  /** Set false to drop the dot field, e.g. behind a hero image. */
  pattern?: boolean;
  className?: string;
}

/**
 * Top-of-page header carrying the `h1`.
 *
 * Every page uses this, which is what guarantees a consistent landing rhythm
 * across the site and exactly one `h1` per page.
 *
 * Three things are doing the visual work here, since there is no colour to do
 * it with:
 *
 *  - A dot field, masked to fade out radially. An unmasked pattern ends on a
 *    hard rectangle and instantly looks like a mistake.
 *  - The eyebrow as a bordered pill rather than loose text, which gives the
 *    block something to sit against.
 *  - A short entrance stagger. This runs on `animate`, not `whileInView` —
 *    the hero is on screen at load, so waiting for a scroll trigger would
 *    mean it either never plays or plays behind the user's back.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  align = 'center',
  size = 'display',
  pattern = true,
  className,
}: PageHeroProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const centred = align === 'center';

  return (
    <header
      className={cn(
        'border-border relative isolate overflow-hidden border-b',
        size === 'display' ? 'py-section tablet:pt-3xl tablet:pb-3xl' : 'py-section',
        className,
      )}
    >
      {pattern && (
        <div aria-hidden="true" className="bg-dot-grid mask-radial-fade absolute inset-0 -z-10" />
      )}

      <Container>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={prefersReducedMotion ? fadeInOnly : stagger}
          className={cn('gap-lg flex flex-col', centred && 'items-center text-center')}
        >
          {eyebrow && (
            <motion.p
              variants={prefersReducedMotion ? fadeInOnly : riseIn}
              className="text-eyebrow text-text-muted border-border bg-surface-raised gap-xs rounded-pill inline-flex items-center border px-3 py-1.5 uppercase shadow-sm"
            >
              <span aria-hidden="true" className="bg-accent rounded-pill size-1.5" />
              {eyebrow}
            </motion.p>
          )}

          <motion.h1
            variants={prefersReducedMotion ? fadeInOnly : riseIn}
            className={cn(
              size === 'display' ? 'text-display' : 'text-h1',
              centred && 'max-w-content-narrow',
            )}
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p
              variants={prefersReducedMotion ? fadeInOnly : riseIn}
              className="text-body-lg text-text-muted max-w-content-narrow"
            >
              {description}
            </motion.p>
          )}

          {actions && (
            <motion.div
              variants={prefersReducedMotion ? fadeInOnly : riseIn}
              className={cn('gap-sm pt-xs flex flex-wrap', centred && 'justify-center')}
            >
              {actions}
            </motion.div>
          )}
        </motion.div>
      </Container>
    </header>
  );
}
