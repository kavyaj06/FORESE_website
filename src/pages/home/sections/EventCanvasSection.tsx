import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { HOME_WORKFLOW } from '../data';
import { EventBoard, ReducedWorkflow, WORKFLOW_EVENTS } from '../components/EventWorkflow';

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
 * The background and the dock both sit in `sticky` panels, so the room and the
 * bar hold still while the boards pass. The dock's panel is sticky only as far
 * as the last board's bottom edge, so the bar leaves when the events do.
 */
export function EventCanvasSection({
  dockRef,
  panelRef,
  regionRef,
  active,
  onActive,
}: {
  dockRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  regionRef: React.RefObject<HTMLDivElement | null>;
  active: number;
  onActive: (index: number) => void;
}) {
  const stackRef = useRef<HTMLDivElement>(null);

  /**
   * How far the dock stays sticky: from the top of the section to the top of
   * the last board.
   *
   * Measured rather than written as a length, because that distance is three
   * boards plus their gaps and the boards' height follows the viewport's
   * width. A sticky panel releases when its container's bottom reaches its own
   * top offset, so ending the container here means the bar holds its place for
   * every event up to the last one, and the moment that last one fills the
   * screen it stops being sticky and stays where it is on the page.
   */
  const [stickyHeight, setStickyHeight] = useState(0);
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const measure = () => {
      const boards = stack.querySelectorAll<HTMLElement>('[data-event-board]');
      const last = boards[boards.length - 1];
      if (!last) return;
      // Offsets, not rectangles: this must not depend on where the page
      // happens to be scrolled when it runs.
      const top = last.getBoundingClientRect().top + window.scrollY;
      const sectionTop = stack.closest('section')!.getBoundingClientRect().top + window.scrollY;
      setStickyHeight((current) => {
        const next = Math.round(top - sectionTop);
        return current === next ? current : next;
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stack);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

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

      {/* The bar's dock, in a sticky panel of its own.

          The panel is sticky *within* this box, and the box ends at the top of
          the last board — so the bar keeps its place for every event up to
          that one, and the moment the last event fills the screen it stops
          being sticky and stays where it is on the page, scrolling away with
          the board it belongs to rather than holding on over what comes next.

          `h-0`, not `h-screen`: a screen-tall panel releases as soon as its
          own bottom reaches the viewport's bottom, which is a full screen too
          early. */}
      <div
        aria-hidden="true"
        style={{ height: stickyHeight || undefined }}
        className="pointer-events-none absolute inset-x-0 top-0 z-30"
        ref={regionRef}
      >
        <div ref={panelRef} className="sticky top-0 h-0">
          {/* Where the bar lands. Below the desktop breakpoint it lands
              full-bleed near the top, which is what the reference does in a
              narrow window — its own dock measures 716px in a 740px one, the
              width minus its margins. There is no left for a quarter-width
              panel to sit in at 390px. */}
          <div
            ref={dockRef}
            className="desktop:top-[31vh] desktop:right-auto desktop:left-[17%] desktop:w-[min(24.5%,34rem)] absolute top-[12vh] right-4 left-4 h-[9.5rem]"
          />
        </div>
      </div>

      {/* The boards. Right-aligned at the reference's own width, with its own
          gap and its own generous room above and below. */}
      <div ref={stackRef} className="gap-md relative z-10 flex flex-col pt-[24vh] pb-[8vh]">
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
 * The same section under `prefers-reduced-motion`: the events as a plain list
 * of cards in the page's normal flow. Nothing travels, docks, rises or types.
 */
export function EventCanvasSectionReduced() {
  return (
    <section className="border-border py-section border-b">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={HOME_WORKFLOW.eyebrow}
            title={HOME_WORKFLOW.title}
            align="left"
          />
        </Reveal>
        <div className="mt-xl">
          <ReducedWorkflow />
        </div>
      </Container>
    </section>
  );
}
