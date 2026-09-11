import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { HOME_WORKFLOW } from '../data';
import {
  CompactWorkflow,
  EventBoard,
  ReducedWorkflow,
  WORKFLOW_EVENTS,
} from '../components/EventWorkflow';

/**
 * The section the bar lands in.
 *
 * **One board per event, stacked and scrolled past** — the reference's own
 * structure, and the club's request: a `<section>` each, right-aligned at
 * 54.2vw with a 16px gap, rising into view as it arrives. What stood here
 * was a single window panned sideways across one long canvas, which meant
 * every event shared one box and none of them could ever *arrive*.
 *
 * The bar is not laid out here. It flies in from the section above and docks
 * in the empty marker on the left, which is why that marker is empty markup
 * rather than a component: the bar is `position: fixed` and reads this
 * element's rectangle, so the marker can be laid out normally and the bar will
 * land on it at any width.
 *
 * The marker and the background both sit in `sticky` panels spanning the
 * section, so they hold still while the boards pass and then release with it —
 * the bar leaves when the last event does rather than following the reader
 * down to the footer.
 */
export function EventCanvasSection({
  dockRef,
  panelRef,
  active,
  onActive,
}: {
  dockRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  active: number;
  onActive: (index: number) => void;
}) {
  const stackRef = useRef<HTMLDivElement>(null);

  /**
   * Which event is current: the board whose centre is nearest the middle of
   * the screen.
   *
   * Read from the boards themselves rather than from a fraction of the
   * section's scroll, because the boards are now ordinary layout — their
   * heights depend on the viewport's width, and any fraction I wrote here
   * would be a second opinion about where they are. Coalesced to one
   * measurement per frame: scroll fires far more often than the screen
   * repaints, and each measurement reads layout.
   */
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let best = 0;
      let bestDistance = Infinity;
      stack.querySelectorAll('[data-event-board]').forEach((node) => {
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = Number(node.getAttribute('data-event-board'));
        }
      });
      onActive(best);
    };

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
  }, [onActive]);

  return (
    <section className="border-border relative border-b">
      {/* The room, at full strength: not blurred and not washed out. This
          section is meant to be standing *in* the event, and a photograph
          behind an 85% scrim is a tint, not a place. What is over it is a soft
          vertical gradient, only enough to keep the dark boards and the panel
          off a bright sky. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="sticky top-0 h-screen overflow-hidden">
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
      </div>

      {/* The bar's dock: empty on purpose, in a sticky panel of its own.

          `h-0`, not `h-screen`, and that is the whole difference between the
          bar staying put and the bar leaving early. A screen-tall sticky panel
          releases as soon as its *bottom* reaches the viewport's bottom —
          which here is a full screen-height before the section ends, so the
          bar began sliding away while the last board was still being read,
          then slid back down when you scrolled up to it. A zero-height one
          holds until the section's own bottom edge reaches the top of the
          screen: the bar sits still for every event and only leaves when the
          section itself is done. */}
      <div
        aria-hidden="true"
        // The region the dock is sticky *within*, and it deliberately stops
        // short of the section's end: 24vh of bottom padding plus half a
        // screen. A sticky element releases when its container's bottom edge
        // reaches its own top offset, so ending the container here lets the
        // bar go once the last board's bottom has risen to the middle of the
        // screen — that board has been read by then. Spanning the whole
        // section instead, the bar held its place while the empty tail
        // scrolled past it, which reads as the bar drifting on down the page
        // after the events are over.
        className="pointer-events-none absolute inset-x-0 top-0 bottom-[74vh] z-30"
      >
        <div ref={panelRef} className="sticky top-0 h-0">
          <div
            ref={dockRef}
            style={{ top: '31vh', left: '17%', width: 'min(24.5%, 34rem)', height: '9.5rem' }}
            className="absolute"
          />
        </div>
      </div>

      {/* The boards. Right-aligned at the reference's own width, with its own
          gap and its own generous room above and below. */}
      <div ref={stackRef} className="gap-md relative z-10 flex flex-col pt-[24vh] pb-[24vh]">
        {WORKFLOW_EVENTS.map((event, i) => (
          <section
            key={event.id}
            aria-label={event.short}
            className="px-gutter desktop:pr-2.5 desktop:pl-0 relative flex justify-end"
          >
            <div className="desktop:w-[54.2vw] w-full">
              <EventBoard event={event} index={i} />
            </div>
          </section>
        ))}
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
