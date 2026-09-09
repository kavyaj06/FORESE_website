import { useEffect, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import {
  ArrowButton,
  Caret,
  CLOSED_HEIGHT,
  CLOSED_WIDTH,
  CROSS_END,
  ERASE_MS,
  FADE_END,
  HOLD_MS,
  PARK_END,
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
  /** That section's sticky panel, which the dock's rest position is measured
   *  against — see the flight code below. */
  panelRef: React.RefObject<HTMLElement | null>;
  active: number;
}

/** The tab row's open height, in pixels — the reference's is 55. */
const TABS_HEIGHT = 55;

/** The lines the parked bar types, one after another. */
const LINES = WORKFLOW_EVENTS.map((event) => event.prompt);

/**
 * The bar that travels between the two sections.
 *
 * **Fixed, and flying between two real elements.** It is not laid out inside
 * either section: an element in normal flow moves *up* the viewport as the
 * page scrolls, and this one has to move *down* it and then across a section
 * boundary, which nothing in one section's coordinate space can do. So it is
 * `position: fixed` and every frame it reads the viewport rectangles of two
 * markers — one in "Shaping futures", one in the canvas section — and
 * interpolates. The markers are ordinary layout, so both sections lay out
 * normally and the bar still lands exactly on its dock at any width.
 *
 * **One move, one width, one direction.** A single eased parameter along a
 * straight line: no bow, no second range, nothing that could read as a bounce
 * or a stop. The width never changes — it is the dock's width from the first
 * frame — and the height only ever grows upward.
 *
 * **The controls stay at the foot.** The cord mark and the arrow are anchored
 * to the bottom of the bar and never fade: they are the same two controls the
 * whole way through, and the growth happens above them. What fades is the line
 * of text between them, which is gone by the time the bar meets the section
 * below; the tab row and then the rule under it appear in the space the growth
 * opens up.
 */
export function JourneyBar({ progress, startRef, dockRef, panelRef, active }: JourneyBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [parked, setParked] = useState(true);
  const [docked, setDocked] = useState(false);

  /**
   * Where the move starts from, frozen the moment it starts.
   *
   * The marker it leaves from lives in the first section's pinned panel, so
   * its rectangle holds while that panel does — and then the panel releases
   * and the rectangle races up the screen. The move has to leave from where
   * the bar actually was. Recomputed live while the bar is still parked, so
   * scrolling back up puts it where it belongs, and cleared on resize.
   */
  const launchRef = useRef<{ x: number; bottom: number } | null>(null);
  useEffect(() => {
    const clear = () => {
      launchRef.current = null;
    };
    window.addEventListener('resize', clear);
    return () => window.removeEventListener('resize', clear);
  }, []);

  useEffect(() => {
    const apply = (p: number) => {
      const bar = barRef.current;
      const from = startRef.current?.getBoundingClientRect();
      const dock = dockRef.current?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      if (!bar || !from || !dock || !panel) return;

      /**
       * Where the dock will be once its section has pinned.
       *
       * Not where it is. That section pins 260vh into a 460vh journey, so for
       * the whole of the move the dock is still travelling up the screen — and
       * a bar interpolating towards a moving target chases it downward:
       * measured, the bar's foot reached 1018px on a 900px screen. The panel
       * is `sticky top-0` and full height, so the dock's offset inside it is
       * where it comes to rest, and that offset is the same at every scroll
       * position.
       */
      const to = {
        left: dock.left,
        top: dock.top - panel.top,
        width: dock.width,
        height: dock.height,
      };

      const raw = clamp01((p - PARK_END) / (CROSS_END - PARK_END));
      const t = ease(raw);

      const width = to.width;
      let launch = launchRef.current;
      if (raw <= 0 || !launch) {
        launch = { x: from.left + (from.width - width) / 2, bottom: from.top + CLOSED_HEIGHT };
        launchRef.current = raw > 0 ? launch : null;
      }

      /**
       * A straight line to the dock, and height that follows it.
       *
       * The path used to bow downward on a sine before coming up, which was
       * meant to read as "down first, then across" and read as a bounce
       * instead. There is nothing in the movement now but one eased
       * interpolation: the foot goes where it is going, without detour, and
       * the head rises away from it.
       */
      const height = CLOSED_HEIGHT + (to.height - CLOSED_HEIGHT) * t;
      const bottom = launch.bottom + (to.top + to.height - launch.bottom) * t;
      const left = launch.x + (to.left - launch.x) * t;

      bar.style.transform = `translate3d(${left}px, ${bottom - height}px, 0)`;
      bar.style.width = `${width}px`;
      bar.style.height = `${height}px`;
      bar.style.opacity = `${clamp01(p / FADE_END)}`;

      /**
       * The line it was typing fades as it goes and is gone by the time the
       * bar meets the section below — measured against that section's own top
       * edge rather than against a number, so it is the meeting that ends it.
       * Only the words: the cord mark and the arrow are not touched.
       */
      bar.style.setProperty('--line', `${clamp01((panel.top - bottom) / 140)}`);

      /**
       * The upper section, opened the way the reference opens it: its own
       * **height** animates from 0, and the labels rise into it. Reading its
       * live markup settled that — the container carries `height: 0px` and
       * each label a `translateY(10px)`, so the row grows rather than simply
       * appearing at full size behind a fade.
       */
      const room = (height - CLOSED_HEIGHT) / Math.max(1, to.height - CLOSED_HEIGHT);
      const tabs = clamp01((room - 0.45) / 0.3);
      bar.style.setProperty('--tabs', `${tabs}`);
      bar.style.setProperty('--tabs-h', `${tabs * TABS_HEIGHT}px`);
      bar.style.setProperty('--divider', `${clamp01((room - 0.72) / 0.22)}`);
      // Spins with the move and stops dead on arrival. Two and a half turns:
      // enough to read as rotation, and it ends on zero so the mark is level.
      bar.style.setProperty('--spin', `${t * 900}deg`);

      setParked((current) => {
        const next = raw <= 0;
        return current === next ? current : next;
      });
      setDocked((current) => {
        const next = raw > 0.99;
        return current === next ? current : next;
      });
    };

    apply(progress.get());
    return progress.on('change', apply);
  }, [progress, startRef, dockRef, panelRef]);

  /**
   * The parked bar's line, typed, held, erased, and replaced by the next.
   *
   * On a clock rather than on scroll, and deliberately: a line typed by
   * dragging the scrollbar is a line the reader is typing, not the page. One
   * line at a time — the section it sits in already carries the argument, and
   * three prompts stacked in a box would be a list.
   */
  const [line, setLine] = useState(0);
  const [step, setStep] = useState<'type' | 'hold' | 'erase'>('type');
  const [n, setN] = useState(0);
  const text = LINES[line] ?? '';

  useEffect(() => {
    if (!parked) return;
    const wait = (ms: number, then: () => void) => {
      const timer = window.setTimeout(then, ms);
      return () => window.clearTimeout(timer);
    };
    if (step === 'type') {
      return n < text.length
        ? wait(TYPE_MS, () => setN((c) => c + 1))
        : wait(0, () => setStep('hold'));
    }
    if (step === 'hold') return wait(HOLD_MS, () => setStep('erase'));
    if (n > 0) return wait(ERASE_MS, () => setN((c) => c - 1));
    return wait(220, () => {
      setLine((c) => (c + 1) % LINES.length);
      setStep('type');
    });
  }, [parked, step, n, text.length]);

  /** The docked bar's description — retyped for each event, once it lands. */
  const current = WORKFLOW_EVENTS[active] ?? WORKFLOW_EVENTS[0];
  const blurb = current?.blurb ?? '';
  const [typed, setTyped] = useState(0);
  useEffect(() => setTyped(0), [active, docked]);
  useEffect(() => {
    if (!docked || typed >= blurb.length) return;
    const timer = window.setTimeout(() => setTyped((c) => c + 1), TYPE_MS);
    return () => window.clearTimeout(timer);
  }, [docked, typed, blurb.length]);

  if (!current) return null;

  return (
    <div
      ref={barRef}
      style={{ width: CLOSED_WIDTH, height: CLOSED_HEIGHT, opacity: 0 }}
      className="border-wf-edge bg-wf-panel group pointer-events-none fixed top-0 left-0 z-30 flex flex-col overflow-hidden rounded-lg border shadow-lg will-change-transform"
    >
      {/* The upper section. Its own height is what opens — clipped, so the tab
          row inside is always at its full size and is revealed by the box
          growing rather than by being scaled or faded into place. */}
      <div
        style={{ height: 'var(--tabs-h, 0px)', opacity: 'var(--tabs, 0)' } as React.CSSProperties}
        className="shrink-0 overflow-hidden"
      >
        <Tabs active={active} divider={false} />
      </div>

      {/* The lower section, with the rule along its top edge.

          Laid out the way the reference lays it out, which is not how this had
          it: the row is `items-center`, and the two pieces of text are
          absolutely positioned layers inside the slot between the controls —
          the line being typed centred in the slot, the event's description
          top-aligned and clamped to five lines. That is what lets one replace
          the other without the controls moving a pixel, and without the row's
          height depending on how long the sentence happens to be. */}
      <div className="relative flex flex-1 items-center gap-2 px-4">
        <div
          aria-hidden="true"
          style={{ opacity: 'var(--divider, 0)' } as React.CSSProperties}
          className="border-wf-edge absolute inset-x-0 top-0 border-t"
        />

        <span style={{ rotate: 'var(--spin, 0deg)' }} className="inline-flex shrink-0">
          <Squiggle />
        </span>

        <div className="relative min-w-0 flex-1 self-stretch">
          {/* The line it sets off with: centred in the slot, two lines at
              most, as the reference clamps its own. */}
          <span
            style={{ opacity: 'var(--line, 1)' } as React.CSSProperties}
            className="absolute inset-0 flex items-center"
          >
            <p className="text-small text-wf-text line-clamp-2 w-full">
              {text.slice(0, n)}
              <Caret />
            </p>
          </span>

          {/* …and the event it arrives with, from the top of the slot. */}
          <motion.span
            aria-hidden={!docked}
            initial={false}
            animate={{ opacity: docked ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-start pt-5"
          >
            <p className="text-small line-clamp-5 w-full text-white">
              {blurb.slice(0, typed)}
              <Caret />
            </p>
            <p className="text-caption text-wf-muted mt-2">
              {current.short} · {current.when}
            </p>
          </motion.span>
        </div>

        <ArrowButton size={32} live={docked} />
      </div>
    </div>
  );
}
