import { useCallback, useRef, useState } from 'react';
import { useScroll, useSpring } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { JourneyBar } from '../components/JourneyBar';
import { ConvergeSection } from './ConvergeSection';
import { EventCanvasSection, EventCanvasSectionCompact } from './EventCanvasSection';

/**
 * Two sections and the bar that travels between them.
 *
 * "Shaping futures, beyond the classroom." is one section and the event canvas
 * is the next; the bar starts in the first, walks down it, crosses the
 * boundary and docks in the second. It exists here rather than in either
 * section because a bar positioned inside one of them cannot leave it — and
 * because the two have to agree about which event is current, which means they
 * have to be reading the same clock.
 *
 * That clock is this wrapper's scroll progress. Everything downstream is a
 * function of it: where the bar is, when the board appears, which event the
 * canvas is showing, and which photograph the second section is standing in.
 * One writer, so nothing can disagree — the rule the rest of this page's
 * scroll-driven work already follows.
 */
export function EventJourney() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  // Matches the `desktop` breakpoint. Below it the travel has nowhere to go,
  // so the DOM itself differs rather than just the styling — the precedent
  // `ConvergeSection` already sets for its own columns.
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const travelling = isDesktop && !prefersReducedMotion;

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  });

  /**
   * Smoothed, but not sprung.
   *
   * High stiffness against heavy damping is a follower rather than a spring:
   * it lags the scroll by a frame or two and never passes it, so the bar never
   * overshoots its dock when the wheel stops. The same pair every scrubbed
   * section on this site settled on.
   */
  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  });

  /**
   * Which event is current. Decided by the canvas section, from where its
   * boards actually are, and held here because the bar needs it too — one
   * writer, so the tabs, the description, the room and the boards cannot
   * disagree about which event you are looking at.
   */
  const [active, setActive] = useState(0);
  const onActive = useCallback((next: number) => {
    setActive((current) => (current === next ? current : next));
  }, []);

  if (!travelling) {
    return (
      <>
        <ConvergeSection />
        <EventCanvasSectionCompact />
      </>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <ConvergeSection startSlotRef={startRef} />
      <EventCanvasSection
        dockRef={dockRef}
        panelRef={panelRef}
        active={active}
        onActive={onActive}
      />
      <JourneyBar
        progress={progress}
        startRef={startRef}
        dockRef={dockRef}
        panelRef={panelRef}
        active={active}
      />
    </div>
  );
}
