import { useEffect, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { findEvent, formatEventWhen } from '@/data/events';
import { albumFor } from '@/pages/gallery/data';
import { HOME_WORKFLOW } from '../data';

interface EventWorkflowProps {
  /** The section's scroll progress, 0–1 across its pinned travel. */
  progress: MotionValue<number>;
  reduced: boolean;
  /**
   * The phone and tablet arrangement: same sequence, one column.
   *
   * A canvas panned sideways needs width on both sides of the board to hold
   * the content it is panning between, and a phone has none — the board would
   * be narrower than one node. So below the desktop breakpoint the same three
   * nodes stack down the screen with the connectors running between them
   * vertically. The prompt still types, still opens, and the scroll still
   * changes the event; what goes is the sideways pan, which is the one part
   * that cannot survive the width.
   */
  compact?: boolean;
}

/**
 * The scroll timeline, as fractions of the section's travel.
 *
 * Every stage of the interaction is a range on this line, and the bar's
 * geometry is read off it continuously — there is no state that says "open"
 * and animates on its own clock. That is the difference between a bar that
 * travels and a bar that jumps: driven by a threshold the move happens over
 * its own 800ms wherever the reader happens to be, and driven by the scroll it
 * happens *as* the reader scrolls, which is what makes it feel physical.
 */
const FADE_END = 0.1;
/** The bar walks down and then left across this stretch. */
const MOVE_END = 0.34;
/** …and grows into the panel across this one. */
const EXPAND_END = 0.46;

/** How wide the bar is before it opens, in pixels. */
const CLOSED_WIDTH = 420;
/** …and how tall. */
const CLOSED_HEIGHT = 64;

/** The panel's share of the stage once open, and the board's. */
const PANEL_WIDTH = 0.29;
const BOARD_WIDTH = 0.67;

const EASE = [0.22, 1, 0.36, 1] as const;

/** Milliseconds per character of the closed bar's typing. */
const TYPE_MS = 45;

/** Cubic ease, for the parts written by hand rather than by framer. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * How wide one event's group is, as a multiple of the board's width.
 *
 * Exactly one board: the groups butt together rather than being spaced out.
 * At 1.3 there was a third of a screen of empty canvas after each event, so
 * when the pan settled on an event the board's edges held nothing and it read
 * as a panel again. Butted together, the next group's first node begins right
 * at the board's right edge — and since that node straddles its own group's
 * left edge, part of it is always in view.
 */
const GROUP_SPAN = 1;

/**
 * Where the nodes sit inside a group — **one arrangement per event**, as
 * percentages of the group's own width and the board's height.
 *
 * Three different shapes, not one repeated. This is the fix for the thing that
 * made the canvas read as a single card having its pictures swapped: the pan
 * was real and the groups were genuinely side by side, but every group had its
 * nodes in the same three places, so what arrived looked exactly like what
 * left. A canvas is a place, and two places do not look alike.
 *
 * The constraint each set is checked against: a node is a 4:3 picture plus a
 * 34px label strip and is clamped to 46% of the board's height, so two nodes
 * clear each other vertically only when their `y` differ by 46 or more, and
 * horizontally only when their `x` differ by more than the widest a node gets
 * (22% of the group). Every pair in every set satisfies one or the other, and
 * no `y` exceeds 54 — verified by measurement at 1024/1280/1440/1920, not by
 * eye.
 *
 * The first slot's `x` is negative in two of the three sets on purpose: that
 * group's first node straddles its own left edge, so it is cut by the board
 * when its event is current and — because the groups butt together — the next
 * event's first node is already half in view at the right.
 */
const SLOT_SETS = [
  [
    { x: -6, y: 4, w: 22 },
    { x: 50, y: 0, w: 22 },
    { x: 22, y: 48, w: 22 },
  ],
  [
    { x: 4, y: 0, w: 22 },
    { x: 56, y: 8, w: 22 },
    { x: 28, y: 52, w: 22 },
  ],
  [
    { x: -4, y: 50, w: 22 },
    { x: 50, y: 48, w: 22 },
    { x: 24, y: 0, w: 22 },
  ],
] as const;

interface Stage {
  tag: string;
  image?: string;
}

interface WorkflowEvent {
  id: string;
  name: string;
  short: string;
  when: string;
  blurb: string;
  prompt: string;
  tag: string;
  stages: Stage[];
  /**
   * The one photograph shown full-bleed behind the composition.
   *
   * The event's own editorial cover rather than an index into its album: the
   * album is a record of the day and several of its frames carry a burned-in
   * geotag caption, which is invisible at column size and a paragraph of
   * stray text across the screen at full bleed. The covers were chosen by a
   * person, and none of them has one.
   */
  cover: string;
  /** Photographs for the columns either side, six of them. */
  backdrop: string[];
}

/**
 * The three events, each resolved into a workflow.
 *
 * Built once at module scope: every input is a module constant, and rebuilding
 * it per render would hand the canvas new object identities on every frame of
 * a scroll.
 *
 * The three nodes of an event are three photographs from that event's own
 * gallery album, spaced across it rather than taken off the front, so a node
 * and the scene behind it are not the same picture. An album with fewer than
 * three photographs wraps, which is honest — it is the same event either way —
 * and none of them currently does.
 */
const EVENTS: WorkflowEvent[] = HOME_WORKFLOW.events.flatMap((entry): WorkflowEvent[] => {
  const event = findEvent(entry.id);
  const photos = albumFor(entry.id)?.photos ?? [];
  if (!event || photos.length === 0) return [];

  return [
    {
      id: entry.id,
      name: event.name,
      // The acronym alone for the node label and the panel's title line; the
      // registered name in full would be three lines inside a 22% node.
      short: event.name.split(' (')[0],
      when: formatEventWhen(event),
      blurb: event.blurb ?? '',
      prompt: entry.prompt,
      tag: entry.tag,
      stages: HOME_WORKFLOW.stages.map((tag, i): Stage => ({
        tag,
        image: photos[Math.floor((i * photos.length) / HOME_WORKFLOW.stages.length)]?.src,
      })),
      cover: event.cover ?? photos[0]?.src ?? '',
      backdrop: Array.from({ length: 6 }, (_, i) => photos[i % photos.length]?.src ?? ''),
    },
  ];
});

export const WORKFLOW_EVENTS = EVENTS;

/**
 * Which event the section is on, and how far between events it is.
 *
 * Exported because the section needs it too: the scene behind the board is
 * this section's backdrop and has to change with the event, and the only way
 * it cannot disagree with the canvas is for both to read the same function of
 * the same scroll value.
 */
export function eventPosition(p: number): number {
  const span = 1 - EXPAND_END;
  const within = clamp01((p - EXPAND_END) / span);
  return within * (EVENTS.length - 1);
}

/** Where the scene behind the board fades in, for the section to read. */
export const SCENE_AT = MOVE_END;

/**
 * The prompt bar that travels into a workflow canvas.
 *
 * **The sequence, and all of it is scroll:** a small dark bar fades in on the
 * centre line typing a line of its own; it walks *down* the screen, then
 * *left* to the edge; there it grows into a tall prompt panel carrying the
 * event tabs; a dark board opens beside it on the right; and scrolling on pans
 * a canvas behind that board from one event's arrangement of nodes to the
 * next.
 *
 * **The panel and the board are two systems, not one card.** The panel is the
 * prompt — tabs, the line a student would ask, an arrow — and the board is a
 * window onto a canvas. Nothing crosses between them.
 *
 * **It is a canvas being panned, not a carousel.** Every event's nodes exist
 * at their own place on one wide canvas at all times, in *their own
 * arrangement* (`SLOT_SETS`), and the window onto it moves. At any point
 * between two events the tail of one and the head of the next are both on
 * screen.
 *
 * **The whole opening is scroll-driven, continuously.** The bar's position and
 * size are written frame by frame from the scroll value, not animated between
 * two states at a threshold: a threshold gives you a bar that jumps to a new
 * size on its own clock, which is precisely what "it grows in place" looks
 * like. What is still a transition is the *content* inside the bar, which
 * crossfades — text cannot usefully be interpolated.
 *
 * **Written through the DOM in a subscription, never `useTransform`.** A
 * transform reading a scroll value compiles to a native scroll timeline, whose
 * sub-ranges do not clamp outside themselves; that is what put three slides'
 * text through one card on the phone board. This geometry is also a function
 * of a measured stage size, which a compiled timeline cannot see change.
 *
 * **No `AnimatePresence`.** Banned here — its exit callback never fires in a
 * production build and has white-screened whole pages.
 */
export function EventWorkflow({ progress, reduced, compact = false }: EventWorkflowProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState({ width: 0, height: 0 });
  const [stage, setStage] = useState({ width: 0, height: 0 });

  // The board's width is fixed in CSS and never animated: the nodes are laid
  // out against it, and a board whose width changed during the opening would
  // relayout every node on every frame of it. What the opening animates is the
  // board's opacity and a small slide, which cost nothing to measure.
  useEffect(() => {
    if (reduced) return;
    const nodes = [[boardRef.current, setBoard] as const, [stageRef.current, setStage] as const];
    const observers = nodes.flatMap(([node, set]) => {
      if (!node) return [];
      const measure = () =>
        set((current) =>
          current.width === node.clientWidth && current.height === node.clientHeight
            ? current
            : { width: node.clientWidth, height: node.clientHeight },
        );
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return [observer];
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [reduced, compact]);

  /**
   * The whole timeline, written straight onto three elements.
   *
   * Not through React: a scroll would otherwise re-render three groups of
   * nodes to move the bar a few pixels.
   */
  useEffect(() => {
    if (reduced || compact) return;

    const apply = (p: number) => {
      setOpen((current) => {
        const next = p >= MOVE_END + 0.04;
        return current === next ? current : next;
      });

      const bar = barRef.current;
      if (bar && stage.width) {
        const closedW = Math.min(CLOSED_WIDTH, stage.width * 0.55);
        const openW = stage.width * PANEL_WIDTH;
        const startX = (stage.width - closedW) / 2;
        const startY = stage.height * 0.05;
        const dockY = (stage.height - CLOSED_HEIGHT) / 2;

        let x: number;
        let y: number;
        let w = closedW;
        let h = CLOSED_HEIGHT;

        if (p < MOVE_END) {
          // The walk. Down first and left second — the two legs overlap in the
          // middle, so it is one arc rather than two moves with a corner.
          const t = clamp01((p - FADE_END) / (MOVE_END - FADE_END));
          const yT = ease(clamp01(t / 0.55));
          const xT = ease(clamp01((t - 0.3) / 0.7));
          x = startX * (1 - xT);
          y = startY + (dockY - startY) * yT;
        } else {
          // The growth, from the docked bar to the panel. Still scroll: at any
          // point in this range the bar is a definite, held size.
          const e = ease(clamp01((p - MOVE_END) / (EXPAND_END - MOVE_END)));
          x = 0;
          y = dockY * (1 - e);
          w = closedW + (openW - closedW) * e;
          h = CLOSED_HEIGHT + (stage.height - CLOSED_HEIGHT) * e;
        }

        bar.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        bar.style.width = `${w}px`;
        bar.style.height = `${h}px`;
        bar.style.opacity = `${clamp01(p / FADE_END)}`;
      }

      const boardEl = boardRef.current;
      if (boardEl) {
        const e = clamp01((p - MOVE_END) / (EXPAND_END - MOVE_END));
        boardEl.style.opacity = `${e}`;
        boardEl.style.transform = `translate3d(${(1 - ease(e)) * 60}px, 0, 0)`;
      }

      const pos = eventPosition(p);
      const next = Math.round(pos);
      setActive((current) => (current === next ? current : next));

      const canvas = canvasRef.current;
      if (canvas && board.width) {
        canvas.style.transform = `translate3d(${-pos * board.width * GROUP_SPAN}px, 0, 0)`;
      }
    };

    apply(progress.get());
    return progress.on('change', apply);
  }, [progress, reduced, compact, board.width, stage.width, stage.height]);

  // The compact arrangement has no travel to drive, only an opening and an
  // event index.
  useEffect(() => {
    if (reduced || !compact) return;
    const apply = (p: number) => {
      setOpen((current) => {
        const next = p >= MOVE_END;
        return current === next ? current : next;
      });
      const next = Math.round(eventPosition(p));
      setActive((current) => (current === next ? current : next));
    };
    apply(progress.get());
    return progress.on('change', apply);
  }, [progress, reduced, compact]);

  /**
   * The typing, which runs on a clock rather than on scroll.
   *
   * The one thing here that is not scroll-driven, and deliberately: a line
   * typed by dragging the scrollbar is a line the reader is typing, not the
   * page. It types once, before the bar opens, and stops there.
   */
  const promptText = EVENTS[0]?.prompt ?? '';
  useEffect(() => {
    if (reduced || open || typed >= promptText.length) return;
    const timer = window.setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
    return () => window.clearTimeout(timer);
  }, [reduced, open, typed, promptText.length]);

  /**
   * The cursor's position on the board, as two CSS custom properties.
   *
   * Set on the element rather than held in state: this fires on every pointer
   * move, and re-rendering three groups of nodes to move a highlight would
   * cost more than the highlight is worth. The brighter dot layer is masked to
   * a circle at these coordinates, so only the dots near the cursor come up —
   * the board itself never lightens.
   */
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dots = dotsRef.current;
    if (!dots) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dots.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    dots.style.setProperty('--my', `${event.clientY - rect.top}px`);
    dots.style.opacity = '1';
  };

  const current = EVENTS[active] ?? EVENTS[0];

  if (!current) return null;

  // Under reduced motion nothing opens, pans or types: the same events as a
  // plain list of cards, in the section's normal flow.
  if (reduced) {
    return (
      <ul className="gap-lg mt-2xl tablet:grid-cols-3 grid">
        {EVENTS.map((event) => (
          <li key={event.id}>
            <div className="bg-line-grid aspect-[4/3] overflow-hidden rounded-lg">
              {event.stages[0]?.image && (
                <img
                  src={event.stages[0].image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <p className="text-eyebrow text-text-subtle mt-md uppercase">{event.tag}</p>
            <h3 className="text-h3 mt-xs">{event.short}</h3>
            <p className="text-small text-text-muted mt-xs">{event.when}</p>
            <p className="text-body text-text-muted mt-sm">{event.blurb}</p>
          </li>
        ))}
      </ul>
    );
  }

  if (compact) {
    return (
      <div ref={stageRef} className="mt-xl w-full">
        {/* The same bar, growing downward instead of travelling: there is no
            left to move to on a 390px screen, so the move it makes is from a
            pill to a full-width prompt panel. */}
        <motion.div
          initial={false}
          animate={{ height: open ? 'auto' : CLOSED_HEIGHT }}
          transition={{ duration: 0.8, ease: EASE }}
          className="border-wf-edge bg-wf-panel relative overflow-hidden rounded-2xl border"
        >
          <motion.div
            aria-hidden={open}
            initial={false}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="gap-sm absolute inset-x-0 top-0 flex h-16 items-center px-3"
          >
            <Squiggle />
            <p className="text-small text-wf-text min-w-0 flex-1 truncate">
              {promptText.slice(0, typed)}
              <Caret />
            </p>
            <ArrowButton size={28} />
          </motion.div>

          <motion.div
            aria-hidden={!open}
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.4, delay: open ? 0.2 : 0 }}
            className="p-3"
          >
            <Tabs active={active} />
            <div className="gap-sm mt-4 flex items-end">
              <Squiggle />
              <p className="text-body min-w-0 flex-1 text-white">{current.prompt}</p>
              <ArrowButton size={28} />
            </div>
            <p className="text-caption text-wf-muted mt-3">
              {current.short} · {current.when}
            </p>
          </motion.div>
        </motion.div>

        {/* The board, stacked. Same dot field and the same orange connectors,
            running down instead of across. */}
        <motion.div
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.5, delay: open ? 0.3 : 0 }}
          className="border-wf-edge bg-wf-board mt-md relative overflow-hidden rounded-2xl border p-3"
        >
          <div className="bg-wf-dots absolute inset-0" />
          <ul className="relative">
            {current.stages.map((stageItem, i) => (
              <li key={stageItem.tag}>
                {i > 0 && (
                  <div aria-hidden="true" className="flex h-8 justify-center">
                    <svg width="12" height="32" viewBox="0 0 12 32" fill="none">
                      <path
                        d="M6 2 V30"
                        stroke="var(--color-wf-accent)"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                      />
                      <circle cx="6" cy="2" r="2" fill="var(--color-wf-accent)" />
                      <circle cx="6" cy="30" r="2" fill="var(--color-wf-accent)" />
                    </svg>
                  </div>
                )}
                <div className="border-wf-edge bg-wf-panel/90 rounded-lg border p-1.5">
                  <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
                    <span className="text-caption bg-wf-accent text-wf-ink rounded-sm px-1.5">
                      {stageItem.tag}
                    </span>
                    <span className="text-caption text-wf-muted truncate">{current.short}</span>
                  </div>
                  <div className="bg-wf-board aspect-[4/3] overflow-hidden rounded-sm">
                    {stageItem.image && (
                      <img
                        src={stageItem.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={stageRef} className="mt-xl relative h-[52vh] max-h-[30rem] min-h-[22rem] w-full">
      {/* The bar. One element the whole way through: a prompt on the centre
          line, then the same box lower and to the left, then the panel. Its
          geometry is written from the scroll value, so it is somewhere
          definite at every scroll position rather than mid-animation. */}
      <div
        ref={barRef}
        style={{ width: CLOSED_WIDTH, height: CLOSED_HEIGHT, opacity: 0 }}
        className="border-wf-edge bg-wf-panel absolute top-0 left-0 z-20 overflow-hidden rounded-2xl border shadow-lg will-change-transform"
      >
        {/* Closed: the icon, the line being typed, and the action. */}
        <motion.div
          aria-hidden={open}
          initial={false}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          className="gap-sm absolute inset-x-0 top-0 flex h-16 items-center px-4"
        >
          <Squiggle />
          <p className="text-small text-wf-text min-w-0 flex-1 truncate">
            {promptText.slice(0, typed)}
            <Caret />
          </p>
          <ArrowButton size={32} />
        </motion.div>

        {/* Open: the prompt panel. Tabs across the top, the line a student
            would actually ask in the middle, the action at the foot — the
            same three parts the closed bar had, given room. Deliberately not
            an information card: the event's name and date are one muted line,
            and the blurb is not here at all. */}
        <motion.div
          aria-hidden={!open}
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.35, delay: open ? 0.15 : 0 }}
          className="absolute inset-0 flex flex-col"
        >
          <Tabs active={active} />

          <div className="relative flex-1 px-5">
            {EVENTS.map((event, i) => (
              <motion.div
                key={event.id}
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : 12 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="absolute inset-x-5 top-5"
              >
                <p className="text-h4 text-white">{event.prompt}</p>
                <p className="text-caption text-wf-muted mt-3">
                  {event.short} · {event.when}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="gap-sm flex items-center px-5 pb-5">
            <Squiggle />
            <span className="flex-1" />
            <ArrowButton size={32} />
          </div>
        </motion.div>
      </div>

      {/* The board: a fixed window, never a card that changes. Everything that
          moves is behind it. */}
      <div
        ref={boardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          if (dotsRef.current) dotsRef.current.style.opacity = '0';
        }}
        // Width set here rather than animated in the timeline: the nodes are
        // laid out against this box, and a board whose width changed during
        // the opening would relayout every one of them on every frame of it.
        style={{ opacity: 0, width: `${BOARD_WIDTH * 100}%` }}
        className="border-wf-edge bg-wf-board absolute top-0 right-0 h-full overflow-hidden rounded-2xl border will-change-transform"
      >
        {/* The dot field, and the brighter one the cursor reveals through a
            circular mask. Two layers rather than one that changes colour: a
            gradient cannot recolour individual dots, but it can decide which
            of two identical fields is visible where. */}
        <div className="bg-wf-dots absolute inset-0" />
        <div
          ref={dotsRef}
          aria-hidden="true"
          className="bg-wf-dots-lit absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            maskImage:
              'radial-gradient(160px at var(--mx, -999px) var(--my, -999px), #000, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(160px at var(--mx, -999px) var(--my, -999px), #000, transparent 70%)',
          }}
        />

        {/* The canvas: every event's group laid out side by side and panned as
            one, each in its own arrangement. Wider than the board, which is
            what keeps content beyond both edges at all times. */}
        <div ref={canvasRef} className="absolute inset-y-0 left-0 will-change-transform">
          {EVENTS.map((event, i) => (
            <Group key={event.id} event={event} index={i} board={board} lit={i === active} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The category row across the top of the panel — the reference's tab strip,
 * with the club's three stages in it.
 *
 * Not clickable, and not pretending to be: the scroll is what changes it, so
 * these are labels showing where you are, marked up as such. A button that
 * looked identical and did the same thing as scrolling would be a second
 * control fighting the first, which is the rule the rest of this repo's
 * scroll-driven strips already follow.
 */
function Tabs({ active }: { active: number }) {
  return (
    <div
      role="presentation"
      className="border-wf-edge gap-xs flex shrink-0 items-center border-b px-3 py-3"
    >
      {EVENTS.map((event, i) => (
        <span
          key={event.id}
          className={`text-caption duration-base ease-out-brand rounded-sm px-2.5 py-1 transition-colors ${
            i === active ? 'bg-wf-accent text-wf-ink' : 'text-wf-muted'
          }`}
        >
          {event.tag}
        </span>
      ))}
    </div>
  );
}

/** The reference's little knotted-cord mark, redrawn. */
function Squiggle() {
  return (
    <span aria-hidden="true" className="text-wf-muted shrink-0">
      <svg viewBox="0 0 32 12" width="26" height="10" fill="none">
        <path
          d="M24.5.7c2.3-.6 4.7.4 5.8 2.6.3.5.4 1.1.5 1.7v.6a5 5 0 0 1-.6 2.4c-1.2 2-3.5 3-5.8 2.4a8 8 0 0 1-.8-.3 5 5 0 0 1-.6-.3c-2.2-1.2-4.6-1.9-7.1-1.9h-.6c-2.5 0-4.9.7-7.1 1.9a5 5 0 0 1-.6.3 7 7 0 0 1-.8.3c-2.2.6-4.6-.3-5.7-2.4A5 5 0 0 1 .3 5.6l.1-.6c.1-.6.2-1.2.5-1.7C2.1 1.1 4.5.1 6.8.7l.2.1q.4.1.8.2l.3.2q.1 0 .3.1c2.1 1.2 4.5 1.8 7 1.8h.6c2.5 0 4.9-.6 7-1.8l.3-.2.3-.1z"
          stroke="currentColor"
        />
      </svg>
    </span>
  );
}

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="bg-wf-accent ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em]"
    />
  );
}

function ArrowButton({ size }: { size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="bg-wf-accent flex shrink-0 items-center justify-center rounded-full text-white"
    >
      <ArrowRight size={size * 0.44} strokeWidth={2.5} />
    </span>
  );
}

/**
 * One event's three nodes and the connectors between them.
 *
 * Positioned by percentage inside its own group box, and the group box is
 * placed by index along the canvas — so the whole arrangement scales with the
 * board and no node needs its own breakpoint. Each event reads its own set of
 * slots, so the canvas is three different places rather than one repeated.
 */
function Group({
  event,
  index,
  board,
  lit,
}: {
  event: WorkflowEvent;
  index: number;
  board: { width: number; height: number };
  lit: boolean;
}) {
  const width = board.width * GROUP_SPAN;
  const height = board.height;
  if (!width || !height) return null;

  // Widths are a share of the group, but height is not: a node is a 4:3
  // picture plus a 34px label strip, and the board's height is capped while
  // its width is not. Left unclamped the nodes grew with the viewport and hung
  // out of the bottom of the board at 1920 — measured, three of them. The
  // clamp is the width at which a node is 46% of the board's height.
  const maxNodeWidth = (height * 0.46 - 34) / 0.75;

  const boxes = (SLOT_SETS[index % SLOT_SETS.length] ?? SLOT_SETS[0]).map((slot) => {
    const w = Math.min((slot.w / 100) * width, maxNodeWidth);
    return {
      x: (slot.x / 100) * width,
      y: (slot.y / 100) * height,
      w,
      h: (w * 3) / 4 + 34,
    };
  });

  // Two connectors: the first node feeds the second, and also the third. A
  // chain would say the third comes after the second, which is not what the
  // three photographs are — they are one event seen three ways.
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
  ];

  return (
    <div className="absolute inset-y-0" style={{ left: index * width, width }} aria-hidden={!lit}>
      <svg className="absolute inset-0 h-full w-full" fill="none">
        {edges.map(([from, to], i) => {
          const path = route(boxes[from], boxes[to]);

          return (
            <g key={i}>
              <motion.path
                d={path.d}
                stroke="var(--color-wf-accent)"
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: lit ? 0.25 + i * 0.15 : 0 }}
              />
              {/* The endpoints, which is where the reference puts its ring and
                  dot. They arrive with the line rather than before it. */}
              {[
                [path.x1, path.y1],
                [path.x2, path.y2],
              ].map(([cx, cy], n) => (
                <motion.g
                  key={n}
                  initial={false}
                  animate={{ opacity: lit ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: lit ? 0.25 + i * 0.15 + n * 0.4 : 0 }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="var(--color-wf-board)"
                    stroke="var(--color-wf-accent)"
                    strokeWidth={1.2}
                  />
                  <circle cx={cx} cy={cy} r={2} fill="var(--color-wf-accent)" />
                </motion.g>
              ))}
            </g>
          );
        })}
      </svg>

      {boxes.map((box, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ opacity: lit ? 1 : 0.28, y: lit ? 0 : 14 }}
          transition={{ duration: 0.6, ease: EASE, delay: lit ? i * 0.12 : 0 }}
          style={{ left: box.x, top: box.y, width: box.w }}
          className="absolute"
        >
          <div className="group border-wf-edge bg-wf-panel/90 duration-base ease-out-brand rounded-lg border p-1.5 transition-transform hover:-translate-y-1">
            <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
              <span className="text-caption bg-wf-accent text-wf-ink rounded-sm px-1.5">
                {event.stages[i]?.tag}
              </span>
              <span className="text-caption text-wf-muted truncate">{event.short}</span>
            </div>
            <div className="bg-wf-board aspect-[4/3] overflow-hidden rounded-sm">
              {event.stages[i]?.image && (
                <img
                  src={event.stages[i].image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A curved connector between two node boxes.
 *
 * Chosen from the geometry rather than hard-coded per edge, because the three
 * events no longer share one arrangement: the same pair of indices is a
 * sideways run in one event and a drop in another, and a path that assumed the
 * first would leave the second's line crossing its own node.
 */
function route(a: Box, b: Box): { d: string; x1: number; y1: number; x2: number; y2: number } {
  const gap = b.x - (a.x + a.w);

  if (gap > 20) {
    const x1 = a.x + a.w;
    const y1 = a.y + a.h / 2;
    const x2 = b.x;
    const y2 = b.y + b.h / 2;
    const bend = Math.max(40, Math.abs(x2 - x1) * 0.5);
    return {
      d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
      x1,
      y1,
      x2,
      y2,
    };
  }

  if (b.y > a.y) {
    const x1 = a.x + a.w / 2;
    const y1 = a.y + a.h;
    const x2 = b.x + b.w / 2;
    const y2 = b.y;
    const bend = Math.max(40, Math.abs(y2 - y1) * 0.6);
    return {
      d: `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`,
      x1,
      y1,
      x2,
      y2,
    };
  }

  const x1 = a.x + a.w / 2;
  const y1 = a.y;
  const x2 = b.x + b.w / 2;
  const y2 = b.y + b.h;
  const bend = Math.max(40, Math.abs(y1 - y2) * 0.6);
  return {
    d: `M ${x1} ${y1} C ${x1} ${y1 - bend}, ${x2} ${y2 + bend}, ${x2} ${y2}`,
    x1,
    y1,
    x2,
    y2,
  };
}
