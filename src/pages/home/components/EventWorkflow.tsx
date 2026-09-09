import { useEffect, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { findEvent, formatEventWhen } from '@/data/events';
import { albumFor } from '@/pages/gallery/data';
import { HOME_WORKFLOW } from '../data';

/**
 * The journey's scroll timeline, as fractions of its travel.
 *
 * One clock for two sections. The bar starts in "Shaping futures", walks down
 * it, crosses into the canvas section below and docks there — and a bar whose
 * position is a function of one section's progress cannot cross out of it. So
 * the two sections sit inside one wrapper, this is that wrapper's progress,
 * and everything that has to agree — the bar, the board, which event is
 * current — is a function of it.
 */
/** The bar fades in over this, then holds where it is. */
export const FADE_END = 0.06;
/**
 * Nothing moves until here.
 *
 * The first section has its own animation to finish — the two columns of
 * photographs travelling in from the edges and the headline growing into
 * place — and a bar setting off while that is still arriving is two moves
 * competing for the same scroll. This is where that finishes: the first
 * section is 260vh of a 560vh journey and its columns and headline are timed
 * to finish at half its own travel, which is 0.17 of this clock. Until then
 * the bar stays put and types.
 */
export const PARK_END = 0.22;
/**
 * Where the bar has finished its move.
 *
 * Which is where the second section pins: 260vh into a journey whose scroll
 * travel is 460vh. The bar flies to the dock's *pinned* rectangle rather than
 * to wherever the dock currently is, so the two arrive together instead of the
 * bar chasing a target that is itself still sliding up the screen.
 */
export const CROSS_END = 0.58;

/** Where the board behind the dock begins to appear. */
export const BOARD_AT = 0.5;
/** …and where the events start passing through it. */
export const EVENTS_AT = 0.66;

/** How wide the bar is before it opens, in pixels, and how tall. */
export const CLOSED_WIDTH = 420;
export const CLOSED_HEIGHT = 64;

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Milliseconds per character typed, per character erased, and the hold. */
export const TYPE_MS = 32;
export const ERASE_MS = 16;
export const HOLD_MS = 1400;

/** Cubic ease, for the parts written by hand rather than by framer. */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

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
    { x: -6, y: 0, w: 32 },
    { x: 52, y: 0, w: 32 },
    { x: 22, y: 52, w: 32 },
  ],
  [
    { x: 30, y: 0, w: 32 },
    { x: -4, y: 52, w: 32 },
    { x: 56, y: 52, w: 32 },
  ],
  [
    { x: 6, y: 0, w: 32 },
    { x: 62, y: 0, w: 32 },
    { x: 34, y: 52, w: 32 },
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
  const within = clamp01((p - EVENTS_AT) / (1 - EVENTS_AT));
  return within * (EVENTS.length - 1);
}

/**
 * The board: a fixed window onto a canvas larger than itself.
 *
 * The window never changes — it is the same box for the whole section — and
 * everything that moves is behind it. Each event has its own group of nodes at
 * its own place along the canvas, in **its own arrangement**, and the scroll
 * moves the canvas rather than the contents of a card: at any point between
 * two events the tail of one and the head of the next are both on screen.
 *
 * **Written through the DOM in a subscription, never `useTransform`.** A
 * transform reading a scroll value compiles to a native scroll timeline, whose
 * sub-ranges do not clamp outside themselves; that is what put three slides'
 * text through one card on the phone board. The pan is also a function of a
 * measured board width, which a compiled timeline cannot see change.
 *
 * **No `AnimatePresence`.** Banned here — its exit callback never fires in a
 * production build and has white-screened whole pages. Every group is mounted
 * for the life of the section.
 */
export function WorkflowBoard({
  progress,
  active,
  className = '',
  style,
}: {
  progress: MotionValue<number>;
  active: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = boardRef.current;
    if (!node) return;
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
  }, []);

  useEffect(() => {
    const apply = (p: number) => {
      const node = boardRef.current;
      if (node) {
        // Solid by the time the bar docks, not by the time the events start.
        // The section behind it is a photograph at full strength now, and a
        // board still at 40% opacity over that is a window you can see the
        // room through — measured at the moment of docking, and it looked
        // like a bug because it is one.
        const reveal = clamp01((p - BOARD_AT) / (CROSS_END - BOARD_AT));
        node.style.opacity = `${reveal}`;
        node.style.transform = `translate3d(${(1 - ease(reveal)) * 60}px, 0, 0)`;
      }

      const canvas = canvasRef.current;
      if (canvas && board.width) {
        canvas.style.transform = `translate3d(${-eventPosition(p) * board.width * GROUP_SPAN}px, 0, 0)`;
      }
    };

    apply(progress.get());
    return progress.on('change', apply);
  }, [progress, board.width]);

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

  return (
    <div
      ref={boardRef}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        if (dotsRef.current) dotsRef.current.style.opacity = '0';
      }}
      style={{ opacity: 0, ...style }}
      // No `position` of its own: the caller places it, and a `relative`
      // here would fight an `absolute` there — same specificity, so which
      // one wins is down to the order Tailwind happens to emit them in.
      className={`border-wf-edge bg-wf-board overflow-hidden rounded-2xl border will-change-transform ${className}`}
    >
      {/* The dot field, and the brighter one the cursor reveals through a
          circular mask. Two layers rather than one that changes colour: a
          gradient cannot recolour individual dots, but it can decide which of
          two identical fields is visible where. */}
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

      <div ref={canvasRef} className="absolute inset-y-0 left-0 will-change-transform">
        {EVENTS.map((event, i) => (
          <Group key={event.id} event={event} index={i} board={board} lit={i === active} />
        ))}
      </div>
    </div>
  );
}

/**
 * The phone and tablet arrangement: the same sequence in one column.
 *
 * A canvas panned sideways needs width on both sides of the board to hold the
 * content it is panning between, and a phone has none — the board would be
 * narrower than one node. So below the desktop breakpoint the same three nodes
 * stack down the screen with the connectors running between them vertically,
 * and the bar grows downward in place rather than travelling: there is no left
 * to move to on a 390px screen.
 */
export function CompactWorkflow({ progress }: { progress: MotionValue<number> }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const apply = (p: number) => {
      setOpen((current) => {
        const next = p >= 0.2;
        return current === next ? current : next;
      });
      const next = Math.round(clamp01((p - 0.3) / 0.7) * (EVENTS.length - 1));
      setActive((current) => (current === next ? current : next));
    };
    apply(progress.get());
    return progress.on('change', apply);
  }, [progress]);

  const current = EVENTS[active] ?? EVENTS[0];
  const line = current?.blurb ?? '';

  useEffect(() => setTyped(0), [active, open]);
  useEffect(() => {
    if (!open || typed >= line.length) return;
    const timer = window.setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
    return () => window.clearTimeout(timer);
  }, [open, typed, line.length]);

  if (!current) return null;

  return (
    <div className="w-full">
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
          <p className="text-small text-wf-text min-w-0 flex-1 truncate">{EVENTS[0]?.prompt}</p>
          <ArrowButton size={28} />
        </motion.div>

        <motion.div
          aria-hidden={!open}
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.4, delay: open ? 0.2 : 0 }}
        >
          <Tabs active={active} />
          <div className="p-4">
            <p className="text-body text-white">
              {line.slice(0, typed)}
              <Caret />
            </p>
            <div className="mt-md flex items-center justify-between">
              <span className="text-caption text-wf-muted">
                {current.short} · {current.when}
              </span>
              <ArrowButton size={28} />
            </div>
          </div>
        </motion.div>
      </motion.div>

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

/**
 * Under `prefers-reduced-motion`: the same events, as a plain list of cards in
 * the page's normal flow. Nothing travels, opens, pans or types.
 */
export function ReducedWorkflow() {
  return (
    <ul className="gap-lg tablet:grid-cols-3 grid">
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
export function Tabs({ active, divider = true }: { active: number; divider?: boolean }) {
  return (
    <div
      role="presentation"
      className={`gap-xs flex shrink-0 items-center px-3 py-3 ${divider ? 'border-wf-edge border-b' : ''}`}
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
export function Squiggle() {
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

export function Caret() {
  return (
    <span
      aria-hidden="true"
      className="bg-wf-accent ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em]"
    />
  );
}

export function ArrowButton({ size }: { size: number }) {
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
  const maxNodeWidth = (height * 0.44 - NODE_CHROME) / 0.75;

  const boxes = (SLOT_SETS[index % SLOT_SETS.length] ?? SLOT_SETS[0]).map((slot) => {
    const w = Math.min((slot.w / 100) * width, maxNodeWidth);
    return {
      x: (slot.x / 100) * width,
      y: (slot.y / 100) * height,
      w,
      h: (w * 3) / 4 + NODE_CHROME,
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
          {/* The label line sits *above* the card, not inside it — which is
              where the reference puts it, and it is what makes a node read as
              a step with a name rather than as a picture with a caption bar
              stuck on top of it. */}
          <div className="text-caption text-wf-muted mb-2 flex items-center justify-between gap-2 px-1">
            <span className="truncate">{event.short}</span>
            <span className="truncate">{event.stages[i]?.tag}</span>
          </div>
          <div className="group border-wf-edge bg-wf-panel/90 duration-base ease-out-brand rounded-lg border p-2 transition-transform hover:-translate-y-1">
            {/* The media kind, where the reference puts "Video" or "Image".
                Which stage it is already reads on the line above the card, and
                the same word twice on one node is not a second fact. */}
            <span className="text-caption bg-wf-accent text-wf-ink mb-2 inline-block rounded-sm px-1.5">
              Photo
            </span>
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

/**
 * Everything a node is besides its picture, in pixels: the label line above
 * the card and the tag strip inside it. Stated once because the layout maths
 * and the collision guarantees both depend on it.
 */
const NODE_CHROME = 56;

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
