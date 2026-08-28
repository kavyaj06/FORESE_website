import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TimelineStep } from '../components/TimelineStep';
import { MOCK_PLACEMENTS_INTRO, PROCESS_STEPS } from '../data';

/**
 * Where the spine head sits on screen, as a fraction of viewport height.
 *
 * One constant, used twice: `useScroll` anchors the fill to it, and the active
 * step is the last node this same line has passed. That shared value is what
 * keeps the filled line ending exactly at the lit node — if these ever drift
 * apart, the two effects stop looking like one mechanism.
 */
const SPINE_HEAD = 0.65;

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
 * drops to opacity only, and no step is highlighted.
 */
export function ProcessTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const nodesRef = useRef<Array<HTMLDivElement | null>>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  // -1 means the line has not reached the first stage yet.
  const [activeIndex, setActiveIndex] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: [`start ${SPINE_HEAD * 100}%`, `end ${SPINE_HEAD * 100}%`],
  });

  // Spring-smoothed: raw scroll progress driving a transform reads as jittery
  // on a trackpad.
  const fillScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const registerNode = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      nodesRef.current[index] = element;
    },
    [],
  );

  /**
   * Exactly one step is active: the last one whose node centre the spine head
   * has passed.
   *
   * This replaced a per-step IntersectionObserver, which could not work — an
   * observer band wide enough to catch a node reliably is also wide enough for
   * two neighbouring cards to sit in it at once, so two nodes lit together.
   * Activity is a property of the list, so the list decides it.
   */
  useEffect(() => {
    if (prefersReducedMotion) {
      setActiveIndex(-1);
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = window.innerHeight * SPINE_HEAD;
      let next = -1;

      nodesRef.current.forEach((element, index) => {
        if (!element) return;
        const { top, height } = element.getBoundingClientRect();
        if (top + height / 2 <= line) next = index;
      });

      setActiveIndex((previous) => (previous === next ? previous : next));
    };

    // Coalesce to one measurement per frame — scroll fires far more often
    // than the screen repaints, and each measurement reads layout.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [prefersReducedMotion]);

  return (
    <section className="border-border bg-surface py-section relative isolate overflow-hidden border-b">
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
                  <TimelineStep
                    step={step}
                    index={i + 1}
                    active={i === activeIndex}
                    nodeRef={registerNode(i)}
                  />
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
