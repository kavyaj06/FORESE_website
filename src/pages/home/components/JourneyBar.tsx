import { useEffect, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import {
  ArrowButton,
  Caret,
  CLOSED_HEIGHT,
  CLOSED_WIDTH,
  CROSS_END,
  DESCENT_VH,
  DRIFT_END,
  ERASE_MS,
  FADE_END,
  HOLD_MS,
  PARK_END,
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
  /** That section's sticky panel, which is what the dock's rest position is
   *  measured against — see the flight code below. */
  panelRef: React.RefObject<HTMLElement | null>;
  active: number;
}

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
 * interpolates between them. The markers are ordinary layout, so the two
 * sections can be laid out and reflowed normally and the bar still lands
 * exactly on its dock at any width.
 *
 * That also gives the docking for free: once it has arrived it is pinned to a
 * rectangle inside a sticky panel, so it holds still while that panel does,
 * and scrolls away with it when the panel releases.
 *
 * **It waits its turn.** Nothing moves until `PARK_END`, which is where the
 * section it is standing in has finished its own animation. While parked it
 * types a line, holds it, erases it and types the next — one at a time, so the
 * bar has something to say without saying all of it at once.
 *
 * **Then it drifts, then it flies, and it grows upward.** The growth
 * interpolates the bar's *bottom* edge rather than its top, so the box rises
 * into its full height instead of dropping into it.
 *
 * **It arrives as a different object than it left.** The line it was typing is
 * gone before it reaches the second section; the tab row fades in during the
 * flight, the rule under it draws itself late, and the cord mark spins into
 * place in the lower half. Only once it has landed does that lower half fill
 * in with the event's own description, typed over the event's own photograph.
 */
export function JourneyBar({ progress, startRef, dockRef, panelRef, active }: JourneyBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  /**
   * Where the flight starts from, frozen once the drift is done.
   *
   * The marker it drifts from lives in the first section's pinned panel, so
   * its rectangle is constant while that panel holds — and then the panel
   * releases and the rectangle races up the screen. The flight has to leave
   * from where the bar actually was, not from where the marker has since gone,
   * so the last position of the drift is kept and used for the whole crossing.
   * Cleared on resize, and recomputed live any time the drift is not finished,
   * so scrolling backwards puts it back.
   */
  const launchRef = useRef<{ x: number; bottom: number; w: number; h: number } | null>(null);
  useEffect(() => {
    const clear = () => {
      launchRef.current = null;
    };
    window.addEventListener('resize', clear);
    return () => window.removeEventListener('resize', clear);
  }, []);
  const [parked, setParked] = useState(true);
  const [docked, setDocked] = useState(false);

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
       * the whole of the crossing the dock is still travelling up the screen —
       * and a bar interpolating towards a moving target chases it downward:
       * measured, the bar's foot reached 1018px on a 900px screen, a third of
       * it below the fold. The panel is `sticky top-0` and full height, so the
       * dock's offset inside it is what it will be at, and that offset is
       * constant at every scroll position.
       */
      const to = {
        left: dock.left,
        top: dock.top - panel.top,
        width: dock.width,
        height: dock.height,
      };
      const toBottom = to.top + to.height;

      // Three ranges of one continuous parameter — parked, drifting, crossing
      // — so the bar is somewhere definite at every scroll position rather
      // than mid-animation on a clock of its own.
      const drift = ease(clamp01((p - PARK_END) / (DRIFT_END - PARK_END)));
      const cross = ease(clamp01((p - DRIFT_END) / (CROSS_END - DRIFT_END)));

      // Parked, then drifting: down a little, and a little larger.
      let launch = launchRef.current;
      if (drift < 1 || !launch) {
        const w = Math.min(CLOSED_WIDTH, from.width || CLOSED_WIDTH) + drift * 64;
        const h = CLOSED_HEIGHT + drift * 30;
        launch = {
          x: from.left + (from.width - w) / 2,
          bottom: from.top + drift * window.innerHeight * DESCENT_VH + h,
          w,
          h,
        };
        launchRef.current = drift >= 1 ? launch : null;
      }
      const { x: driftX, bottom: driftBottom, w: driftW, h: driftH } = launch;

      // Crossing. The bottom edge is what is interpolated, so the top edge
      // rises as the height grows and the bar reads as expanding upward.
      const lerp = (a: number, b: number) => a + (b - a) * cross;
      const w = lerp(driftW, to.width);
      const h = lerp(driftH, to.height);
      const bottom = lerp(driftBottom, toBottom);

      bar.style.transform = `translate3d(${lerp(driftX, to.left)}px, ${bottom - h}px, 0)`;
      bar.style.width = `${w}px`;
      bar.style.height = `${h}px`;
      bar.style.opacity = `${clamp01(p / FADE_END)}`;

      // The parts, each on its own stretch of the crossing. The line it was
      // typing goes first and is gone well before the second section; the tab
      // row comes in behind it; the rule under the tabs draws last, which is
      // what makes the bar look like it is dividing rather than swapping.
      bar.style.setProperty('--line', `${1 - clamp01(cross / 0.22)}`);
      bar.style.setProperty('--tabs', `${clamp01((cross - 0.18) / 0.42)}`);
      bar.style.setProperty('--divider', `${clamp01((cross - 0.55) / 0.4)}`);
      bar.style.setProperty('--icon', `${clamp01((cross - 0.32) / 0.4)}`);
      // Spins with the flight and stops dead on arrival. Two and a half turns:
      // enough to read as rotation, and it ends on zero so the mark is level.
      bar.style.setProperty('--spin', `${cross * 900}deg`);

      setParked((current) => {
        const next = p < PARK_END;
        return current === next ? current : next;
      });
      setDocked((current) => {
        const next = cross > 0.98;
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
      className="border-wf-edge bg-wf-panel pointer-events-none fixed top-0 left-0 z-30 flex flex-col overflow-hidden rounded-2xl border shadow-lg will-change-transform"
    >
      {/* The upper section: the events, switching as the canvas does. */}
      <div style={{ opacity: 'var(--tabs, 0)' } as React.CSSProperties} className="shrink-0">
        <Tabs active={active} divider={false} />
      </div>
      {/* The rule between the two halves, drawn last and on its own. */}
      <div
        aria-hidden="true"
        style={{ opacity: 'var(--divider, 0)' } as React.CSSProperties}
        className="bg-wf-edge h-px w-full shrink-0"
      />

      {/* The line the parked bar types. Gone before the second section — the
          first section's words do not travel into the second. */}
      <div
        aria-hidden={!parked}
        style={{ opacity: 'var(--line, 1)' } as React.CSSProperties}
        className="gap-sm absolute inset-x-0 top-0 flex h-16 items-center px-4"
      >
        <Squiggle />
        <p className="text-small text-wf-text min-w-0 flex-1 truncate">
          {text.slice(0, n)}
          <Caret />
        </p>
        <ArrowButton size={32} />
      </div>

      {/* The lower section: this event, over this event's photograph. The
          photograph comes in with the two-part structure rather than on
          arrival, so the bar is already the event's own colour as it lands. */}
      <div className="relative flex-1">
        <div
          style={{ opacity: 'var(--tabs, 0)' } as React.CSSProperties}
          className="absolute inset-0"
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
        </div>

        <div className="relative flex h-full flex-col p-5">
          <motion.div
            aria-hidden={!docked}
            initial={false}
            animate={{ opacity: docked ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-eyebrow text-wf-muted uppercase">{current.tag}</p>
            <p className="text-h4 mt-3 text-white">
              {blurb.slice(0, typed)}
              <Caret />
            </p>
          </motion.div>

          <span className="flex-1" />

          {/* The cord mark, in the lower half where the reference keeps it.
              It fades in mid-flight rather than on arrival, so the spin is
              visible while the bar is still travelling — the spin is the cue
              that it is moving, and it stops when the bar does. */}
          <div
            style={{ opacity: 'var(--icon, 0)' } as React.CSSProperties}
            className="flex items-center justify-between"
          >
            <span className="gap-sm flex items-center">
              <span style={{ rotate: 'var(--spin, 0deg)' }} className="inline-flex">
                <Squiggle />
              </span>
              <motion.span
                initial={false}
                animate={{ opacity: docked ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="text-caption text-wf-muted"
              >
                {current.short} · {current.when}
              </motion.span>
            </span>
            <ArrowButton size={32} />
          </div>
        </div>
      </div>
    </div>
  );
}
