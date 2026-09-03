import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { ACCENT_WORD_CLASS } from '@/components/motion/AccentWord';
import { TextReveal } from '@/components/motion/TextReveal';
import { fadeInOnly, riseIn, stagger } from '@/components/motion/variants';
import { useIntroDone } from '@/components/motion/IntroContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Button } from '@/components/ui';
import { HOME_HERO } from '../data';
import { RecruiterMarquee } from '../components/RecruiterMarquee';

/**
 * The home hero.
 *
 * The headline is set in the site's sans with one word in serif italic. That
 * face change does the job a highlight colour would do on a site that had one,
 * and it is the most characterful thing on the page.
 *
 * The headline animates word by word on `animate`, not `whileInView`: it is on
 * screen at load, so a scroll trigger would play behind the visitor's back.
 * The block then drifts and fades as it leaves rather than simply scrolling
 * away.
 */
/**
 * The headline's word timings, as one chain.
 *
 * `TextReveal` staggers within its own string, so three of them side by side
 * only read as one sentence if each starts where the last left off. Written
 * out here rather than inline because the accent word sits between the two
 * halves and every delay after it shifts by one — an easy thing to get subtly
 * wrong when the copy changes.
 */
const WORD_STEP = 0.075;
const BEFORE_DELAY = 0.1;
const ACCENT_DELAY = BEFORE_DELAY + HOME_HERO.titleBefore.split(' ').length * WORD_STEP;
const AFTER_DELAY = ACCENT_DELAY + WORD_STEP;

export function HomeHero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const introDone = useIntroDone();
  const { scrollY } = useScroll();
  const patternY = useTransform(scrollY, [0, 800], [0, 110]);
  const contentOpacity = useTransform(scrollY, [0, 520], [1, 0.15]);
  const contentY = useTransform(scrollY, [0, 520], [0, 60]);

  return (
    <header
      data-tone="ink"
      className="py-3xl relative isolate flex min-h-[86vh] flex-col justify-center overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        style={{ y: prefersReducedMotion ? 0 : patternY }}
        className="bg-dot-grid mask-radial-fade absolute inset-x-0 -inset-y-24 -z-10"
      />

      <Container>
        <motion.div
          initial="hidden"
          animate={introDone ? 'visible' : 'hidden'}
          variants={prefersReducedMotion ? fadeInOnly : stagger}
          style={prefersReducedMotion ? undefined : { opacity: contentOpacity, y: contentY }}
          className="gap-lg flex flex-col items-center text-center"
        >
          <motion.p
            variants={prefersReducedMotion ? fadeInOnly : riseIn}
            className="text-eyebrow text-text-muted border-border bg-surface-raised gap-xs rounded-pill inline-flex items-center border px-3 py-1.5 uppercase"
          >
            <span aria-hidden="true" className="bg-accent rounded-pill size-1.5" />
            {HOME_HERO.eyebrow}
          </motion.p>

          {/* Three reveals rather than one, so the accent word keeps its own
              face while every word still rises in sequence — the accent one
              included. It used to be a plain `AccentWord`, which meant it was
              on screen from the first frame while its neighbours were held
              down behind the curtain: when the curtain lifted, a single
              italic word was sitting alone in an empty hero. The delays chain
              through it as though it were just another word, because to the
              reader it is. */}
          <h1 className="text-display max-w-[18ch]">
            <TextReveal
              as="span"
              text={HOME_HERO.titleBefore}
              delay={BEFORE_DELAY}
              play={introDone}
            />{' '}
            <TextReveal
              as="span"
              text={HOME_HERO.accent}
              delay={ACCENT_DELAY}
              play={introDone}
              className={ACCENT_WORD_CLASS}
            />{' '}
            <TextReveal
              as="span"
              text={HOME_HERO.titleAfter}
              delay={AFTER_DELAY}
              play={introDone}
            />
          </h1>

          <motion.p
            variants={prefersReducedMotion ? fadeInOnly : riseIn}
            className="text-body-lg text-text-muted max-w-content-narrow"
          >
            {HOME_HERO.description}
          </motion.p>

          <motion.div
            variants={prefersReducedMotion ? fadeInOnly : riseIn}
            className="gap-sm pt-xs flex flex-wrap justify-center"
          >
            <Button
              to={HOME_HERO.actions.primary.to}
              iconRight={<ArrowRight size={16} strokeWidth={2} aria-hidden="true" />}
            >
              {HOME_HERO.actions.primary.label}
            </Button>
            <Button to={HOME_HERO.actions.secondary.to} variant="secondary">
              {HOME_HERO.actions.secondary.label}
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      <RecruiterMarquee />
    </header>
  );
}
