import { useEffect, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import {
  ArrowButton,
  BOARD_AT,
  Caret,
  CLOSED_HEIGHT,
  CLOSED_WIDTH,
  CROSS_END,
  DESCENT_END,
  DESCENT_VH,
  FADE_END,
  SceneWash,
  Squiggle,
  Tabs,
  TYPE_MS,
  WORKFLOW_EVENTS,
  clamp01,
  ease,
} from './EventWorkflow';

interface JourneyBarProps {
  /** The journey's progress — both sections on one clock. */
  progress: MotionValue<number>;
  /** Where the bar starts: a marker in the first section. */
  startRef: React.RefObject<HTMLElement | null>;
  /** Where it lands: the empty column in the second section. */
  dockRef: React.RefObject<HTMLElement | null>;
  active: number;
}

/**
 * The bar that travels between the two sections.
 *
 * **Fixed, and flying between two real elements.** It is not laid out inside
 * either section: an element in normal flow moves *up* the viewport as the
 * page scrolls, and this one has to move *down* it and then across a section
 * boundary, which nothing in one section's coordinate space can do. So it is
 * `position: fixed` and every frame it reads the viewport rectangles of two
 * markers — one in "Shaping futures", one in the canvas section — and
 * interpolates between them. The markers are ordinary layout, so the two
 * sections can be laid out and reflowed normally and the bar still lands
 * exactly on its dock at any width.
 *
 * That also gives the docking for free: once it has arrived it is pinned to a
 * rectangle inside a sticky panel, so it holds still while that panel does,
 * and scrolls away with it when the panel releases. Nothing has to decide when
 * to hand over.
 *
 * **It arrives as a different object than it left.** Closed it is one line
 * being typed. Across the crossing it grows a second section — the tab row
 * appears with the travel — and only once it has landed does the lower section
 * fill in: the event's own description typed out over its own photograph. The
 * cord mark spins while the bar is in flight and stops dead on arrival, which
 * is the only cue that the movement has finished.
 */
export function JourneyBar({ progress, startRef, dockRef, active }: JourneyBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const apply = (p: number) => {
      const bar = barRef.current;
      const from = startRef.current?.getBoundingClientRect();
      const to = dockRef.current?.getBoundingClientRect();
      if (!bar || !from || !to) return;

      // The walk down the first section, then the flight to the dock. Two
      // ranges of one continuous parameter, so the bar is somewhere definite
      // at every scroll position rather than mid-animation on its own clock.
      const descent = ease(clamp01((p - FADE_END) / (DESCENT_END - FADE_END)));
      const cross = ease(clamp01((p - DESCENT_END) / (CROSS_END - DESCENT_END)));

      const startW = Math.min(CLOSED_WIDTH, from.width || CLOSED_WIDTH);
      const startX = from.left + (from.width - startW) / 2;
      const startY = from.top + descent * window.innerHeight * DESCENT_VH;

      const lerp = (a: number, b: number) => a + (b - a) * cross;

      bar.style.transform = `translate3d(${lerp(startX, to.left)}px, ${lerp(startY, to.top)}px, 0)`;
      bar.style.width = `${lerp(startW, to.width)}px`;
      bar.style.height = `${lerp(CLOSED_HEIGHT, to.height)}px`;
      bar.style.opacity = `${clamp01(p / FADE_END)}`;
      // Spins through the flight and stops on arrival. Two and a half turns:
      // enough to read as rotation rather than as a wobble, and it ends on
      // zero so the mark is level once it has landed.
      bar.style.setProperty('--spin', `${cross * 900}deg`);
      bar.style.setProperty('--tabs', `${clamp01((p - BOARD_AT) / (CROSS_END - BOARD_AT))}`);

      setDocked((current) => {
        const next = cross > 0.98;
        return current === next ? current : next;
      });
    };

    apply(progress.get());
    return progress.on('change', apply);
  }, [progress, startRef, dockRef]);

  const current = WORKFLOW_EVENTS[active] ?? WORKFLOW_EVENTS[0];
  const line = current?.blurb ?? '';

  // Retyped for each event, and only once the bar has landed — a line typing
  // itself while the bar is still in the air would say the writing is what the
  // scroll is doing, when the travelling is.
  useEffect(() => setTyped(0), [active, docked]);
  useEffect(() => {
    if (!docked || typed >= line.length) return;
    const timer = window.setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
    return () => window.clearTimeout(timer);
  }, [docked, typed, line.length]);

  if (!current) return null;

  return (
    <div
      ref={barRef}
      style={{ width: CLOSED_WIDTH, height: CLOSED_HEIGHT, opacity: 0 }}
      className="border-wf-edge bg-wf-panel pointer-events-none fixed top-0 left-0 z-30 flex flex-col overflow-hidden rounded-2xl border shadow-lg will-change-transform"
    >
      {/* The top section: the events, switching as the canvas does. It grows
          in with the flight, so the bar visibly becomes a two-part thing on
          the way over rather than at either end of the trip. */}
      <div style={{ opacity: 'var(--tabs, 0)' } as React.CSSProperties} className="shrink-0">
        <Tabs active={active} />
      </div>

      {/* Closed: the single line it leaves with. */}
      <motion.div
        aria-hidden={docked}
        initial={false}
        animate={{ opacity: docked ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="gap-sm absolute inset-x-0 top-0 flex h-16 items-center px-4"
      >
        <span style={{ rotate: 'var(--spin, 0deg)' }} className="inline-flex">
          <Squiggle />
        </span>
        <p className="text-small text-wf-text min-w-0 flex-1 truncate">{current.prompt}</p>
        <ArrowButton size={32} />
      </motion.div>

      {/* The lower section: this event, over this event's photograph. Filled
          in only after the bar has arrived. */}
      <motion.div
        aria-hidden={!docked}
        initial={false}
        animate={{ opacity: docked ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="relative flex-1"
      >
        {WORKFLOW_EVENTS.map((event, i) => (
          <motion.div
            key={event.id}
            initial={false}
            animate={{ opacity: i === active ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <SceneWash src={event.cover} />
          </motion.div>
        ))}

        <div className="relative flex h-full flex-col p-5">
          <p className="text-eyebrow text-wf-muted uppercase">{current.tag}</p>
          <p className="text-h4 mt-3 text-white">
            {line.slice(0, typed)}
            <Caret />
          </p>
          <span className="flex-1" />
          <div className="flex items-center justify-between">
            <span className="gap-sm flex items-center">
              <span style={{ rotate: 'var(--spin, 0deg)' }} className="inline-flex">
                <Squiggle />
              </span>
              <span className="text-caption text-wf-muted">
                {current.short} · {current.when}
              </span>
            </span>
            <ArrowButton size={32} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
