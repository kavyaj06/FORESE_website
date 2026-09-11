import { useCallback, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { JourneyBar } from '../components/JourneyBar';
import { ConvergeSection } from './ConvergeSection';
import { EventCanvasSection, EventCanvasSectionReduced } from './EventCanvasSection';

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
 * Nothing here is driven by a scroll *fraction* any more. The bar measures
 * its own travel from the canvas section's approach, and the canvas section
 * decides which event is current from where its boards actually are — both
 * read live rectangles, so neither can drift when a section changes height.
 * What this component still owns is the pair of markers the bar flies between
 * and the one piece of state both sections need: which event is current.
 */
export function EventJourney() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The travel runs at every width now, at the club's request. What differs
  // below the desktop breakpoint is where it lands — full-bleed near the top
  // rather than a quarter-width panel on the left — which is a matter of
  // where the marker is laid out, not of a different component.
  const prefersReducedMotion = usePrefersReducedMotion();
  const travelling = !prefersReducedMotion;

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
        <EventCanvasSectionReduced />
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
      <JourneyBar startRef={startRef} dockRef={dockRef} panelRef={panelRef} active={active} />
    </div>
  );
}
