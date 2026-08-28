import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TimelineStep } from '../components/TimelineStep';
import { MOCK_PLACEMENTS_INTRO, PROCESS_STEPS } from '../data';

/**
 * The six-stage vertical timeline.
 *
 * The section sits on `surface` while the cards stay `surface-raised`, so the
 * cards are lifted by the background being darker than they are rather than by
 * a heavy drop shadow. In a monochrome palette that contrast *is* the
 * elevation — shadows only confirm it.
 *
 * Two pieces of motion, doing different jobs:
 *
 *  1. The spine fills with scroll position rather than playing on entry, so it
 *     works as a progress indicator through the process. The dashed track
 *     underneath shows what is still ahead.
 *  2. Each step reveals independently as it reaches the viewport. Deliberately
 *     not one staggered burst: the list is taller than the screen, so a
 *     stagger would play out mostly off-screen and the later steps would be
 *     finished before you ever scrolled to them.
 *
 * Under `prefers-reduced-motion` the spine draws complete and static, `Reveal`
 * drops to opacity only, and the nodes hold their resting state.
 */
export function ProcessTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Tied to the same point on screen the step nodes light at, so the filled
  // line always ends at the lit node.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 65%', 'end 65%'],
  });

  // Spring-smoothed: raw scroll progress driving a transform reads as jittery
  // on a trackpad.
  const fillScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section className="border-border bg-surface py-section relative isolate overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="bg-line-grid mask-fade-b absolute inset-0 -z-10 opacity-60"
      />

      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={MOCK_PLACEMENTS_INTRO.eyebrow}
            title={MOCK_PLACEMENTS_INTRO.title}
            description={MOCK_PLACEMENTS_INTRO.description}
          />
        </Reveal>

        <div className="mt-3xl relative">
          {/* The spine. Sits behind the list; the opaque step nodes cover it,
              which is what makes it read as running between the stages. Inset
              top and bottom by half a node so it starts and ends at the first
              and last node's centre instead of overshooting. */}
          <div
            aria-hidden="true"
            className="tablet:top-6 tablet:bottom-6 tablet:left-6 absolute top-5 bottom-5 left-5 w-px -translate-x-1/2"
          >
            <div className="border-border-strong h-full w-full border-l border-dashed" />
            <motion.div
              className="bg-text absolute inset-0 w-px origin-top"
              style={{ scaleY: prefersReducedMotion ? 1 : fillScale }}
            />
          </div>

          <ol ref={listRef} className="gap-2xl tablet:gap-3xl relative flex flex-col">
            {PROCESS_STEPS.map((step, i) => (
              <li key={step.id} id={step.id}>
                <Reveal>
                  <TimelineStep step={step} index={i + 1} />
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
