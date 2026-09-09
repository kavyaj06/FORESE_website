import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, type MotionValue } from 'framer-motion';
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
 * Where in the section's travel the bar opens.
 *
 * Late enough that the closed bar is read as a thing in its own right — the
 * heading above it is still arriving before this — and early enough that the
 * whole of the second half belongs to the canvas.
 */
const OPEN_AT = 0.3;

/** How wide the bar is before it opens, in pixels. */
const CLOSED_WIDTH = 420;

const EASE = [0.22, 1, 0.36, 1] as const;
const OPEN_TRANSITION = { duration: 0.8, ease: EASE } as const;

/**
 * How far above its docking point the closed bar starts, as a share of the
 * stage's height.
 *
 * The bar is not parked where it opens. It arrives under the heading as the
 * section comes up, and the first stretch of the scroll walks it down the
 * screen towards the board's line — so by the time it opens it has already
 * travelled, and the opening reads as an arrival rather than as a thing that
 * was sitting there waiting. 0.42 puts it just under the description at rest
 * and lands it on the stage's centre line exactly at `OPEN_AT`, which is what
 * makes the descent and the opening one continuous move instead of two.
 */
const DESCENT = 0.42;

/** Milliseconds per character of the closed bar's typing. */
const TYPE_MS = 45;

/**
 * How wide one event's group is, as a multiple of the board's width.
 *
 * Exactly one board: the groups butt together rather than being spaced out.
 * At 1.3 there was a third of a screen of empty canvas after each event, so
 * when the pan settled on an event the board's edges held nothing and it read
 * as a panel again. Butted together, the next group's first node begins right
 * at the board's right edge — and since that node straddles its own group's
 * left edge (see `SLOTS`), part of it is always in view.
 */
const GROUP_SPAN = 1;

/**
 * Where the three nodes sit inside a group, as percentages of the group's own
 * width and the board's height.
 *
 * Not a column and not a row: two across the top and one dropped below and
 * between them is the shape that lets both connectors bend, which is what
 * makes it read as a canvas rather than as a list with lines drawn on. The
 * third sits left of centre so its connector crosses under the second.
 *
 * The first slot's `x` is **negative on purpose**: every group's first node
 * straddles its own left edge, so it is cut by the board when its event is
 * current and — because the groups butt together — the *next* event's first
 * node is always half in view at the right. That is what keeps the board
 * reading as a window onto something larger rather than as a card with three
 * pictures on it, at rest as well as mid-pan.
 *
 * Sized so that **no two overlap in both axes at once** and none runs past the
 * board's bottom edge. A node is its picture at 4:3 plus a label strip, so its
 * height follows from its width — the first pass used 30% and the third node
 * hung 100px out of the board. Verified by measurement at every width, not by
 * eye.
 */
const SLOTS = [
  { x: -6, y: 5, w: 22 },
  { x: 52, y: 2, w: 23 },
  { x: 24, y: 47, w: 22 },
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
 * and the backdrop behind it are not the same picture. An album with fewer
 * than three photographs wraps, which is honest — it is the same event either
 * way — and none of them currently does.
 */
const EVENTS: WorkflowEvent[] = HOME_WORKFLOW.events.flatMap((entry): WorkflowEvent[] => {
  const event = findEvent(entry.id);
  const photos = albumFor(entry.id)?.photos ?? [];
  if (!event || photos.length === 0) return [];

  return [
    {
      id: entry.id,
      name: event.name,
      // The acronym alone for the node label and the bar's title line; the
      // registered name in full would be three lines inside a 30% node.
      short: event.name.split(' (')[0],
      when: formatEventWhen(event),
      blurb: event.blurb ?? '',
      prompt: entry.prompt,
      tag: entry.tag,
      stages: HOME_WORKFLOW.stages.map((tag, i): Stage => ({
        tag,
        image: photos[Math.floor((i * photos.length) / HOME_WORKFLOW.stages.length)]?.src,
      })),
      backdrop: Array.from({ length: 6 }, (_, i) => photos[i % photos.length]?.src ?? ''),
    },
  ];
});

export const WORKFLOW_EVENTS = EVENTS;

/**
 * Which event the section is on, and how far between events it is.
 *
 * Exported because the section needs it too: the photograph columns either
 * side are this section's backdrop and have to change with the event, and the
 * only way they cannot disagree with the canvas is for both to read the same
 * function of the same scroll value.
 */
export function eventPosition(p: number): number {
  const span = 1 - OPEN_AT;
  const within = Math.min(1, Math.max(0, (p - OPEN_AT) / span));
  return within * (EVENTS.length - 1);
}

/**
 * The prompt bar that opens into a workflow canvas.
 *
 * This replaced the pillars — a number, an uppercase title, two terms and a
 * bar that opened into four names. The club asked for the reference's
 * prompt-to-canvas interaction in its place, with the club's own events in it.
 *
 * **The sequence, and all of it is scroll:** a small dark bar sits on the
 * centre line typing a line of its own; as the section is scrolled it widens,
 * moves left and becomes the panel holding the current event; a dark board
 * opens on the right with a dotted field on it; three photographs from that
 * event arrive as nodes joined by orange connectors that draw themselves; and
 * scrolling on pans the canvas sideways to the next event, whose nodes are
 * already out there to the right waiting to come in.
 *
 * **It is a canvas being panned, not a carousel.** The difference is not
 * cosmetic: a carousel moves one item out and the next in, so only one is ever
 * real. Here every event's nodes exist at their own place on one wide canvas
 * at all times, the window onto it moves, and at any point between two events
 * the tail of one and the head of the next are both on screen and both
 * connected. `GROUP_SPAN` is what guarantees that — a group is wider than the
 * board, so there is always canvas beyond both edges.
 *
 * **Two states for the opening, continuous for the pan.** The bar's width and
 * position animate between closed and open at a threshold rather than tracking
 * progress directly: driven continuously it would sit half-open wherever the
 * reader happened to stop, which is a bar caught mid-thought. The pan is the
 * opposite — it is a position on a canvas, and it interpolates.
 *
 * **Written through motion values in a subscription, never `useTransform`.** A
 * transform reading a scroll value compiles to a native scroll timeline, whose
 * sub-ranges do not clamp outside themselves; that is what put three slides'
 * text through one card on the phone board. The pan is also a function of a
 * measured board width, which a compiled timeline cannot see change.
 *
 * **No `AnimatePresence`.** Banned here — its exit callback never fires in a
 * production build and has white-screened whole pages. Every event's group is
 * mounted for the life of the section; what changes is where the canvas is and
 * which group is lit.
 */
export function EventWorkflow({ progress, reduced, compact = false }: EventWorkflowProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState(0);

  /**
   * The closed bar's descent, and its fade-in.
   *
   * Motion values written in the same subscription as the pan, not state and
   * not `useTransform`: this runs on every frame of a scroll, and the descent
   * is a function of a *measured* stage height, which a compiled scroll
   * timeline cannot see change. Applied to a wrapper rather than to the bar
   * itself, because the bar's own `y` is already carrying its `-50%` centring
   * and a single transform cannot hold both.
   */
  const barY = useMotionValue(0);
  const barOpacity = useMotionValue(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = boardRef.current;
    if (!node || reduced) return;
    const measure = () =>
      setBoard((current) =>
        current.width === node.clientWidth && current.height === node.clientHeight
          ? current
          : { width: node.clientWidth, height: node.clientHeight },
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  // The pan, and which event is current. Written straight onto the canvas
  // element rather than through React, so a scroll does not re-render three
  // groups of nodes to move them all by the same amount.
  useEffect(() => {
    if (reduced) return;
    const apply = (p: number) => {
      setOpen((current) => current || p >= OPEN_AT);

      // The walk down. `t` reaches 1 at exactly the point the bar opens, so the
      // offset is already 0 by then and the opening has nothing to undo.
      const t = Math.min(1, Math.max(0, p / OPEN_AT));
      barY.set(-(1 - t) * board.height * DESCENT);
      barOpacity.set(Math.min(1, p / 0.12));

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
  }, [progress, reduced, board.width, board.height, barY, barOpacity]);

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
      <div className="mt-xl w-full">
        {/* The same bar, growing downward instead of sideways: there is no
            left to move to on a 390px screen, so the move it makes is from a
            pill to a full-width panel. */}
        <motion.div
          initial={false}
          animate={{ height: open ? 'auto' : 56 }}
          transition={OPEN_TRANSITION}
          className="border-wf-edge bg-wf-panel relative overflow-hidden rounded-2xl border"
        >
          <motion.div
            aria-hidden={open}
            initial={false}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="gap-sm absolute inset-x-0 top-0 flex h-14 items-center px-3"
          >
            <p className="text-small text-wf-text min-w-0 flex-1 truncate">
              {promptText.slice(0, typed)}
              <span
                aria-hidden="true"
                className="bg-wf-accent ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em]"
              />
            </p>
            <span
              aria-hidden="true"
              className="bg-wf-accent flex size-7 shrink-0 items-center justify-center rounded-full text-white"
            >
              <ArrowRight size={13} strokeWidth={2.5} />
            </span>
          </motion.div>

          <motion.div
            aria-hidden={!open}
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.4, delay: open ? 0.2 : 0 }}
            className="p-4"
          >
            <p className="text-eyebrow text-wf-muted uppercase">{HOME_WORKFLOW.eyebrow}</p>
            <span className="text-caption bg-wf-accent text-wf-ink mt-3 inline-block rounded-sm px-2 py-0.5">
              {current.tag}
            </span>
            <h3 className="text-h3 mt-2 text-white">{current.short}</h3>
            <p className="text-small text-wf-muted mt-1">{current.when}</p>
            <p className="text-small text-wf-text mt-3">{current.blurb}</p>
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
            {current.stages.map((stage, i) => (
              <li key={stage.tag}>
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
                      {stage.tag}
                    </span>
                    <span className="text-caption text-wf-muted truncate">{current.short}</span>
                  </div>
                  <div className="bg-wf-board aspect-[4/3] overflow-hidden rounded-sm">
                    {stage.image && (
                      <img
                        src={stage.image}
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
    <div className="mt-xl relative h-[52vh] max-h-[30rem] min-h-[22rem] w-full">
      {/* The descent. A wrapper the bar rides down, carrying nothing but a
          translate and the fade-in — `pointer-events-none` because it covers
          the board, and the board needs the pointer for its dot highlight.
          Zero-height, so the open panel is measured from the stage. */}
      <motion.div
        style={{ y: barY, opacity: barOpacity }}
        className="pointer-events-none absolute inset-0 z-20"
      >
        {/* The bar. One element the whole way through: closed it is a prompt
          walking down the screen, open it is the panel on the left. Animating a
          single box from one to the other is what makes it read as the same
          object arriving somewhere, which swapping two elements at a threshold
          would not. */}
        <motion.div
          initial={false}
          animate={
            open
              ? { width: '27%', height: '100%', left: '0%', x: '0%', top: 0, y: '0%' }
              : { width: CLOSED_WIDTH, height: 64, left: '50%', x: '-50%', top: '50%', y: '-50%' }
          }
          transition={OPEN_TRANSITION}
          className="border-wf-edge bg-wf-panel absolute overflow-hidden rounded-2xl border"
        >
          {/* Closed: the icon, the line being typed, and the action. */}
          <motion.div
            aria-hidden={open}
            initial={false}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="gap-sm absolute inset-0 flex items-center px-4"
          >
            <span aria-hidden="true" className="text-wf-muted shrink-0">
              <svg viewBox="0 0 32 12" width="26" height="10" fill="none" aria-hidden="true">
                <path
                  d="M24.5.7c2.3-.6 4.7.4 5.8 2.6.3.5.4 1.1.5 1.7v.6a5 5 0 0 1-.6 2.4c-1.2 2-3.5 3-5.8 2.4a8 8 0 0 1-.8-.3 5 5 0 0 1-.6-.3c-2.2-1.2-4.6-1.9-7.1-1.9h-.6c-2.5 0-4.9.7-7.1 1.9a5 5 0 0 1-.6.3 7 7 0 0 1-.8.3c-2.2.6-4.6-.3-5.7-2.4A5 5 0 0 1 .3 5.6l.1-.6c.1-.6.2-1.2.5-1.7C2.1 1.1 4.5.1 6.8.7l.2.1q.4.1.8.2l.3.2q.1 0 .3.1c2.1 1.2 4.5 1.8 7 1.8h.6c2.5 0 4.9-.6 7-1.8l.3-.2.3-.1z"
                  stroke="currentColor"
                />
              </svg>
            </span>
            <p className="text-small text-wf-text min-w-0 flex-1 truncate">
              {promptText.slice(0, typed)}
              <span
                aria-hidden="true"
                className="bg-wf-accent ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em]"
              />
            </p>
            <span
              aria-hidden="true"
              className="bg-wf-accent flex size-8 shrink-0 items-center justify-center rounded-full text-white"
            >
              <ArrowRight size={14} strokeWidth={2.5} />
            </span>
          </motion.div>

          {/* Open: the current event. Every event is mounted and cross-faded, so
            nothing unmounts and there is no exit to wait on. */}
          {/* Faded, not merely `aria-hidden`. Left painted, the open panel's
            "Events" eyebrow showed through the closed bar behind the line it
            was typing. */}
          <motion.div
            aria-hidden={!open}
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.4, delay: open ? 0.25 : 0 }}
            className="absolute inset-0 p-5"
          >
            <p className="text-eyebrow text-wf-muted uppercase">{HOME_WORKFLOW.eyebrow}</p>
            <div className="relative mt-4 h-[calc(100%-2rem)]">
              {EVENTS.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={false}
                  animate={{ opacity: open && i === active ? 1 : 0, y: i === active ? 0 : 10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute inset-x-0 top-0"
                >
                  <span className="text-caption bg-wf-accent text-wf-ink rounded-sm px-2 py-0.5">
                    {event.tag}
                  </span>
                  <h3 className="text-h3 mt-3 text-white">{event.short}</h3>
                  <p className="text-small text-wf-muted mt-1">{event.when}</p>
                  <p className="text-small text-wf-text mt-4">{event.blurb}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* The board. Opens from the right edge inward, so the bar is moving left
          and the board growing right at the same moment. */}
      <motion.div
        ref={boardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          if (dotsRef.current) dotsRef.current.style.opacity = '0';
        }}
        initial={false}
        animate={{ opacity: open ? 1 : 0, width: open ? '70%' : '30%' }}
        transition={OPEN_TRANSITION}
        className="border-wf-edge bg-wf-board absolute top-0 right-0 h-full overflow-hidden rounded-2xl border"
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
            one. Wider than the board by `GROUP_SPAN`, which is what keeps
            content beyond both edges at all times. */}
        <div ref={canvasRef} className="absolute inset-y-0 left-0 will-change-transform">
          {EVENTS.map((event, i) => (
            <Group
              key={event.id}
              event={event}
              index={i}
              board={board}
              lit={i === active && open}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * One event's three nodes and the connectors between them.
 *
 * Positioned by percentage inside its own group box, and the group box is
 * placed by index along the canvas — so the whole arrangement scales with the
 * board and no node needs its own breakpoint.
 *
 * The connectors are drawn from the slot geometry rather than measured,
 * unlike the canvas elsewhere on this page: here the nodes are a fixed aspect
 * with no text below the picture, so their boxes *are* computable, and the
 * percentages the slots are placed by are the same ones the paths use.
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

  // Node boxes in the group's own pixels. Height follows from the 4:3 picture
  // plus the label strip above it.
  // Widths are a share of the group, but height is not: a node is its 4:3
  // picture plus a 34px label strip, and the board's height is capped while
  // its width is not. Left unclamped the nodes grew with the viewport and hung
  // out of the bottom of the board at 1920 — measured, three of them. The
  // clamp is the width at which a node is 46% of the board's height, which
  // leaves the two stacked rows clear of each other and of the edges.
  const maxNodeWidth = (height * 0.46 - 34) / 0.75;

  const boxes = SLOTS.map((slot) => {
    const w = Math.min((slot.w / 100) * width, maxNodeWidth);
    return {
      x: (slot.x / 100) * width,
      y: (slot.y / 100) * height,
      w,
      h: (w * 3) / 4 + 34,
    };
  });

  // Two connectors: the first node feeds the second, and also drops to the
  // third. A chain would say the third comes after the second, which is not
  // what the three photographs are — they are one event seen three ways.
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
  ];

  return (
    <div className="absolute inset-y-0" style={{ left: index * width, width }} aria-hidden={!lit}>
      <svg className="absolute inset-0 h-full w-full" fill="none">
        {edges.map(([from, to], i) => {
          const a = boxes[from];
          const b = boxes[to];
          const x1 = a.x + a.w;
          const y1 = a.y + a.h / 2;
          const x2 = b.x + (to === 2 ? b.w / 2 : 0);
          const y2 = to === 2 ? b.y : b.y + b.h / 2;
          const bend = Math.max(40, Math.abs(x2 - x1) * 0.5);
          const d =
            to === 2
              ? `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2} ${y2 - bend}, ${x2} ${y2}`
              : `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;

          return (
            <g key={i}>
              <motion.path
                d={d}
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
                [x1, y1],
                [x2, y2],
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
