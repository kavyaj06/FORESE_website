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
  panelRef,
  active,
}: {
  progress: MotionValue<number>;
  dockRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  active: number;
}) {
  return (
    <section className="border-border relative h-[300vh] border-b">
      <div
        ref={panelRef}
        className="bg-surface sticky top-0 flex h-screen flex-col justify-center overflow-hidden"
      >
        {/* The room, at full strength. Not blurred and not washed out: this
            section is meant to be standing *in* the event, the way the
            reference stands in its product shot, and a photograph behind a
            85% scrim is a tint, not a place. What is left over it is a soft
            vertical gradient — dark at the edges, clear through the middle —
            which is only enough to keep the dark board and the panel from
            sitting on a bright sky. */}
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
              className="absolute inset-0 h-full w-full scale-105 object-cover"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/45" />
        </div>

        {/*
          The composition, measured off the reference frames rather than
          guessed at. Three things follow from them and none of them was what
          this section had:

          - the board is much larger and **runs off the right edge** — it is a
            window onto a canvas, and a window with a margin on all four sides
            reads as a card;
          - the bar lands as a **small panel**, about a quarter of the screen
            wide and a fifth of it tall, not a full-height column;
          - it sits **left of centre with clear space to its left**, level with
            the top of the board, floating over the photograph rather than
            docked against the edge of the page.

          Absolute rather than a flex row, because those three do not sit in
          one line: the panel is a fifth as tall as the board and level with
          its top, and the board is wider than the section.
        */}
        <div
          ref={dockRef}
          aria-hidden="true"
          style={{ top: '18vh', left: '17%', width: 'min(24.5%, 34rem)', height: '13rem' }}
          className="absolute"
        />

        <WorkflowBoard
          progress={progress}
          active={active}
          className="absolute"
          style={{ top: '18vh', left: '45%', right: '-6%', height: '70vh' }}
        />
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
