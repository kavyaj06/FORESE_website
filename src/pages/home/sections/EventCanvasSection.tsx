import { useRef } from 'react';
import { motion, useScroll, useSpring, type MotionValue } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { HOME_WORKFLOW } from '../data';
import {
  CompactWorkflow,
  ReducedWorkflow,
  WORKFLOW_EVENTS,
  WorkflowBoard,
} from '../components/EventWorkflow';

/**
 * The section the bar lands in.
 *
 * It is a section of its own, not the tail of the one above: its own band, its
 * own background, its own pinned panel. What it does not own is the bar —
 * that arrives from the section above and docks in the empty column on the
 * left, which is why the column here is empty markup rather than a component.
 * The bar is `position: fixed` and reads this element's rectangle, so the
 * column can be laid out normally and the bar will land on it at any width.
 *
 * The background is the current event's own photograph, filling the section
 * and crossfading as the canvas moves from one event to the next — so the
 * event changes in three places at once: the tabs in the bar, the nodes on the
 * board, and the room the whole thing is standing in.
 */
export function EventCanvasSection({
  progress,
  dockRef,
  active,
}: {
  progress: MotionValue<number>;
  dockRef: React.RefObject<HTMLDivElement | null>;
  active: number;
}) {
  return (
    <section className="border-border relative h-[300vh] border-b">
      <div className="bg-surface sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* The room. Blurred and under a scrim: several of the club's
            photographs carry a burned-in geotag caption, which is invisible at
            thumbnail size and a paragraph of stray text across the screen at
            full bleed. */}
        <div aria-hidden="true" className="absolute inset-0">
          {WORKFLOW_EVENTS.map((event, i) => (
            <motion.img
              key={event.id}
              src={event.cover}
              alt=""
              loading="lazy"
              decoding="async"
              initial={false}
              animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.06 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full scale-105 object-cover blur-[3px]"
            />
          ))}
          <div className="bg-surface/85 absolute inset-0" />
        </div>

        <div className="px-gutter desktop:max-w-[92vw] desktop:px-0 relative mx-auto w-full">
          <div className="gap-lg flex h-[52vh] max-h-[30rem] min-h-[22rem] items-stretch">
            {/* The dock. Empty on purpose — the bar flies in and fills it. */}
            <div ref={dockRef} className="w-[29%] shrink-0" aria-hidden="true" />
            <WorkflowBoard progress={progress} active={active} className="h-full flex-1" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The same section for a phone, and for reduced motion.
 *
 * A different composition rather than a squeezed one: nothing is pinned, the
 * bar does not travel — there is no left for it to travel to — and the canvas
 * runs down the page instead of across it.
 */
export function EventCanvasSectionCompact() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 64rem)');

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.9', 'end start'],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section ref={sectionRef} className="border-border py-section border-b">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={HOME_WORKFLOW.eyebrow}
            title={HOME_WORKFLOW.title}
            align="left"
          />
        </Reveal>
        <div className="mt-xl">
          {prefersReducedMotion || isDesktop ? (
            <ReducedWorkflow />
          ) : (
            <CompactWorkflow progress={progress} />
          )}
        </div>
      </Container>
    </section>
  );
}
