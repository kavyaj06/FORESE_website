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
 * Two pieces of motion, and they do different jobs:
 *
 *  1. The spine fills as you scroll. It is bound to scroll position rather
 *     than played on entry, so it acts as a progress indicator — you can see
 *     how far through the process you are. The dashed track underneath shows
 *     the part still ahead.
 *
 *  2. Each step reveals independently as it reaches the viewport. Deliberately
 *     not a single staggered burst: the list is taller than the screen, so a
 *     stagger would play out mostly off-screen and the later steps would
 *     already be finished by the time you scrolled to them.
 *
 * Under `prefers-reduced-motion` the spine is drawn complete and static, and
 * `Reveal` drops to opacity only.
 */
export function ProcessTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // The fill tracks the list's travel through the lower-middle of the screen,
  // so a step is lit as you arrive at it rather than after it has gone past.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 65%', 'end 65%'],
  });

  // Spring-smoothed: raw scroll progress tied straight to a transform reads as
  // jittery on trackpads and mouse wheels.
  const fillScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section className="py-section">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={MOCK_PLACEMENTS_INTRO.eyebrow}
            title={MOCK_PLACEMENTS_INTRO.title}
            description={MOCK_PLACEMENTS_INTRO.description}
          />
        </Reveal>

        <div className="mt-2xl relative">
          {/* The spine. Sits behind the list; the opaque step nodes cover it,
              which is what makes it read as running between the stages.
              Inset top and bottom by half a node so it starts and ends at the
              first and last node's centre instead of overshooting. */}
          <div
            aria-hidden="true"
            className="tablet:top-6 tablet:bottom-6 tablet:left-6 absolute top-5 bottom-5 left-5 w-px -translate-x-1/2"
          >
            <div className="border-border h-full w-full border-l border-dashed" />
            <motion.div
              className="bg-text absolute inset-0 w-px origin-top"
              style={{ scaleY: prefersReducedMotion ? 1 : fillScale }}
            />
          </div>

          <ol ref={listRef} className="gap-2xl relative flex flex-col">
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
