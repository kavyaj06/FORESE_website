import type { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { TextReveal } from '@/components/motion/TextReveal';
import { fadeInOnly, riseIn, stagger } from '@/components/motion/variants';
import { useIntroDone } from '@/components/motion/IntroContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface PageHeroProps {
  eyebrow?: string;
  /**
   * The page's `h1`. A plain string, because the headline animates word by
   * word and that requires owning the text rather than arbitrary markup.
   */
  title: string;
  description?: ReactNode;
  /** Buttons or other calls to action. */
  actions?: ReactNode;
  /** Small facts under the headline — "6 stages", "27 photographs". */
  meta?: string[];
  align?: 'left' | 'center';
  size?: 'display' | 'compact';
  /**
   * `inverse` is the default: a black hero gives each page a hard opening and
   * is the strongest contrast move available in a palette with no colour in
   * it. `light` is for pages that open straight into imagery.
   */
  tone?: 'inverse' | 'light';
  pattern?: boolean;
  className?: string;
}

/**
 * Top-of-page header carrying the `h1`.
 *
 * Every page uses this, which is what guarantees a consistent landing rhythm
 * and exactly one `h1` per page.
 *
 * The motion runs on `animate`, not `whileInView` — the hero is on screen at
 * load, so a scroll trigger would either never fire or play behind the user's
 * back. The pattern drifts at a fraction of scroll speed, which gives the
 * header depth without hijacking the scroll itself.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  meta,
  align = 'center',
  size = 'display',
  tone = 'inverse',
  pattern = true,
  className,
}: PageHeroProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const introDone = useIntroDone();
  const centred = align === 'center';

  const { scrollY } = useScroll();
  const patternY = useTransform(scrollY, [0, 700], [0, 90]);
  const contentOpacity = useTransform(scrollY, [0, 420], [1, 0.25]);

  return (
    <header
      data-theme={tone === 'inverse' ? 'inverse' : undefined}
      className={cn(
        'border-border relative isolate overflow-hidden border-b',
        size === 'display' ? 'py-section tablet:py-3xl' : 'py-section',
        className,
      )}
    >
      {pattern && (
        <motion.div
          aria-hidden="true"
          style={{ y: prefersReducedMotion ? 0 : patternY }}
          className="bg-dot-grid mask-radial-fade absolute inset-x-0 -inset-y-24 -z-10"
        />
      )}

      <Container>
        <motion.div
          initial="hidden"
          animate={introDone ? 'visible' : 'hidden'}
          variants={prefersReducedMotion ? fadeInOnly : stagger}
          style={{ opacity: prefersReducedMotion ? 1 : contentOpacity }}
          className={cn('gap-lg flex flex-col', centred && 'items-center text-center')}
        >
          {eyebrow && (
            <motion.p
              variants={prefersReducedMotion ? fadeInOnly : riseIn}
              // Filled, not outlined with a dot inside it. An outlined chip
              // holding a coloured dot is the site apologising for its own
              // palette: three elements to say one word. The chip is the
              // colour now, which is how every reference sets a label.
              className="text-eyebrow bg-accent text-accent-fg rounded-pill inline-flex w-fit items-center px-3 py-1.5 uppercase"
            >
              {eyebrow}
            </motion.p>
          )}

          <TextReveal
            as="h1"
            text={title}
            delay={0.12}
            play={introDone}
            className={cn(
              size === 'display' ? 'text-display' : 'text-h1',
              centred && 'max-w-content-narrow',
            )}
          />

          {description && (
            <motion.p
              variants={prefersReducedMotion ? fadeInOnly : riseIn}
              className="text-body-lg text-text-muted max-w-content-narrow"
            >
              {description}
            </motion.p>
          )}

          {meta && meta.length > 0 && (
            <motion.ul
              variants={prefersReducedMotion ? fadeInOnly : riseIn}
              className={cn(
                'text-small text-text-muted gap-lg flex flex-wrap',
                centred && 'justify-center',
              )}
            >
              {meta.map((item) => (
                <li key={item} className="gap-xs flex items-center">
                  <span aria-hidden="true" className="bg-border-strong rounded-pill size-1" />
                  {item}
                </li>
              ))}
            </motion.ul>
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
