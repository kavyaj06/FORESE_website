import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  ArrowButton,
  Caret,
  CLOSED_HEIGHT,
  CLOSED_WIDTH,
  ERASE_MS,
  HOLD_MS,
  Squiggle,
  Tabs,
  TYPE_MS,
  WORKFLOW_EVENTS,
  clamp01,
} from './EventWorkflow';

interface JourneyBarProps {
  /** Where the bar starts: a marker in the first section. */
  startRef: React.RefObject<HTMLElement | null>;
  /**
   * That section's own panel. The bar appears only once this has settled: a
   * parked bar is anchored to its marker, so while the section is still
   * arriving it rides up the screen with it — which reads as a little upward
   * drift before the travel, and is not the travel.
   */
  stageRef: React.RefObject<HTMLElement | null>;
  /** Where it lands: the empty column in the second section. */
  dockRef: React.RefObject<HTMLElement | null>;
  /** That section's sticky panel, which the dock's rest position is measured
   *  against — see the flight code below. */
  panelRef: React.RefObject<HTMLElement | null>;
  active: number;
}

/** The tab row's open height, in pixels, as the docked reference measures. */
const TABS_HEIGHT = 48;

/**
 * How far ahead of its section the bar starts moving, in screen-heights.
 *
 * Long enough that the first section has finished its own animation before
 * anything here begins: that section's panel releases one screen-height
 * before the canvas section arrives, and its columns and headline are done
 * well before that.
 */
const TRAVEL_SCREENS = 1.2;

/** The bar's corners, closed and open — 16px and 8px in the reference. */
const CLOSED_RADIUS = 16;
const OPEN_RADIUS = 8;

/** The lines the parked bar types, one after another. */
const LINES = WORKFLOW_EVENTS.map((event) => event.prompt);

/**
 * The bar that travels between the two sections, and hands off to the dock.
 *
 * **Fixed, and flying, only until it lands.** While parked and travelling it
 * is not laid out inside either section: an element in normal flow moves *up*
 * the viewport as the page scrolls, and this one has to move *down* it and
 * then across a section boundary, which nothing in one section's coordinate
 * space can do. So it is `position: fixed` and every frame it reads the
 * viewport rectangles of two markers — one in "Shaping futures", one in the
 * canvas section — and interpolates.
 *
 * **Once docked, it stops being fixed at all.** The empty dock marker in
 * `EventCanvasSection` sits inside a `sticky top-0` panel that is itself
 * bounded by the events' own container — which already is, natively, exactly
 * "pinned while there is more to read, released the moment there is not".
 * Reimplementing that by hand (a fixed element with a hand-tuned fade timed
 * against the container's bottom edge) is what every earlier version of this
 * file did, and it kept drifting out of sync with the real geometry: still
 * visible a stretch after the last event had actually scrolled past, or
 * overlapping whatever the next section had already brought into view. A
 * `React.createPortal` into the dock marker, the instant the bar arrives,
 * hands the rest of the job to the browser's own sticky implementation —
 * which cannot drift, because it isn't a second opinion about the layout, it
 * *is* the layout. The bar simply disappears with the events the way any
 * other in-flow element on the page would, the same as a board scrolling
 * past — no fade to mistime.
 *
 * **One move, one width, one direction**, while it is still flying: a single
 * eased parameter along a straight line, no bow, no second range. The width
 * barely changes and the height only ever grows upward, both toward the
 * dock's own measured size — so the portal handoff lands on a box that is
 * already the right shape.
 */
export function JourneyBar({ startRef, stageRef, dockRef, panelRef, active }: JourneyBarProps) {
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
    const apply = () => {
      const bar = barRef.current;
      const from = startRef.current?.getBoundingClientRect();
      const dock = dockRef.current?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      const stage = stageRef.current?.getBoundingClientRect();
      if (!bar || !from || !dock || !panel || !stage) return;

      /**
       * How far through the move the bar is — measured, not a fraction of the
       * journey.
       *
       * It is the canvas section's own approach: the bar is parked while that
       * section is more than `TRAVEL` below the fold, and has arrived exactly
       * as the section pins. Written as a fraction of the wrapper's scroll it
       * would have to be re-tuned every time the boards change height, and
       * they now depend on the viewport's width. This cannot drift.
       */
      const travel = window.innerHeight * TRAVEL_SCREENS;
      const raw = clamp01(1 - panel.top / travel);

      setParked((current) => {
        const next = raw <= 0;
        return current === next ? current : next;
      });
      const nextDocked = raw > 0.99;
      setDocked((current) => (current === nextDocked ? current : nextDocked));

      /**
       * Docked: nothing left to compute. The portal below has already handed
       * the bar to the sticky panel, which carries it for the rest of the
       * run and releases it on its own. This only starts writing to `bar`
       * again if the reader scrolls back up out of the dock.
       */
      if (nextDocked) return;

      /**
       * Where the dock comes to rest.
       *
       * Subtracting the panel's own top gives the rectangle the dock will hold
       * once its section has pinned — so the bar flies to a fixed target
       * rather than chasing one that is itself still sliding up the screen.
       */
      const to = {
        left: dock.left,
        top: dock.top - panel.top,
        width: dock.width,
        height: dock.height,
      };

      const t = raw;
      const grow = raw * raw;

      // The width grows too, but barely: 323 to 351 across the reference's
      // frames, which is the 9% that keeps it the same object rather than a
      // different one.
      // Never wider than where it lands: on a 390px screen the dock is the
      // width of the page minus its gutters, and a 322px bar shrinking into
      // it would travel the wrong way.
      const closed = Math.min(CLOSED_WIDTH, to.width);
      const width = closed + (to.width - closed) * t;
      let launch = launchRef.current;
      if (raw <= 0 || !launch) {
        launch = {
          x: from.left + (from.width - CLOSED_WIDTH) / 2,
          bottom: from.top + CLOSED_HEIGHT,
        };
        launchRef.current = raw > 0 ? launch : null;
      }

      // A straight line to the dock. The path used to bow downward on a sine
      // before coming up, which was meant to read as "down first, then
      // across" and read as a bounce instead.
      const height = CLOSED_HEIGHT + (to.height - CLOSED_HEIGHT) * grow;
      const bottom = launch.bottom + (to.top + to.height - launch.bottom) * t;
      const left = launch.x + (to.left - launch.x) * t;

      bar.style.transform = `translate3d(${left}px, ${bottom - height}px, 0)`;
      bar.style.width = `${width}px`;
      bar.style.height = `${height}px`;
      // In as its marker rises into view, over the last 40px before its
      // section's panel reaches the top of the screen — not as the marker
      // enters the viewport, which had the bar on screen for the whole of
      // the section's arrival, riding up with it.
      const arriving = clamp01((40 - stage.top) / 40);
      bar.style.opacity = `${arriving}`;
      // 16px closed, 8px open. Both captures of the reference carry it: the
      // small bar is `border-radius: 16px` and the docked one 8px, so the
      // corners tighten as the box grows rather than holding one value.
      bar.style.borderRadius = `${CLOSED_RADIUS + (OPEN_RADIUS - CLOSED_RADIUS) * t}px`;

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
      // One full turn, which is what the docked reference holds:
      // `transform: rotate(360deg)`. Two and a half turns was mine.
      bar.style.setProperty('--spin', `${t * 360}deg`);
    };

    /**
     * Driven by the scroll itself, not by the section's progress value.
     *
     * A `useScroll` progress stops changing once its target is behind you, and
     * the handler stops firing with it — so the bar froze at its docked
     * position and floated there over everything below, which is the same bug
     * in a second disguise. Every number here is read from live rectangles
     * anyway; the only thing the progress value was providing was a reason to
     * recompute. Coalesced to one measurement per frame, because scroll fires
     * far more often than the screen repaints.
     */
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [startRef, stageRef, dockRef, panelRef]);

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

  const content = (
    <div
      ref={barRef}
      style={
        docked
          ? ({
              '--line': 0,
              '--tabs': 1,
              '--tabs-h': `${TABS_HEIGHT}px`,
              '--divider': 1,
            } as React.CSSProperties)
          : { width: CLOSED_WIDTH, height: CLOSED_HEIGHT, opacity: 0, borderRadius: CLOSED_RADIUS }
      }
      className={
        docked
          ? // Filling the dock marker exactly, which is what gives it the
            // sticky panel's own behaviour for free: no position, no size, no
            // opacity of its own to compute or get wrong.
            'border-wf-edge bg-wf-panel group pointer-events-none relative z-30 flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-lg'
          : 'border-wf-edge bg-wf-panel group pointer-events-none fixed top-0 left-0 z-30 flex flex-col overflow-hidden border shadow-lg will-change-transform'
      }
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
          Laid out the way the reference lays it out: the row is
          `items-center`, and the two pieces of text are absolutely
          positioned layers inside the slot between the controls — the line
          being typed centred in the slot, the event's description
          top-aligned and clamped to five lines. That is what lets one
          replace the other without the controls moving a pixel, and without
          the row's height depending on how long the sentence happens to
          be. */}
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
          </motion.span>
        </div>

        <ArrowButton size={32} live={docked} />
      </div>
    </div>
  );

  const target = docked ? dockRef.current : (typeof document !== 'undefined' ? document.body : null);
  return target ? createPortal(content, target) : null;
}
