import { useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { findEvent, formatEventWhen } from '@/data/events';
import { HOME_CANVAS } from '../data';

/** Screen-heights of scroll the canvas takes to draw itself. */
const RUNWAY_VH = 200;

/**
 * Where each node lands on the panel, as percentages of it.
 *
 * Hand-placed rather than laid out on a grid: three nodes stepping down and
 * across is the shape that says one thing leads to the next, and a grid would
 * put them in a row where the connectors have nothing to cross.
 *
 * `w` is the node's width, also a percentage, so the whole arrangement scales
 * with the panel and the clearances hold at every width.
 *
 * The three are placed so that **no two overlap in both axes at once**, which
 * is what lets them share vertical space on a panel too short to stack three
 * full-height nodes down it. One and three sit on the left and never meet
 * vertically; two sits on the right, clear of both in x. The first attempt
 * ignored that, and the third node sat across the second's label and hung out
 * of the bottom of the panel. Verified by measurement, not by eye.
 */
const NODES = [
  { x: 3, y: 2, w: 40 },
  { x: 56, y: 30, w: 40 },
  { x: 8, y: 57, w: 40 },
] as const;

/**
 * When each thing appears, as a fraction of the section's travel.
 *
 * The node arrives, then the line to the next one draws, then the next node —
 * so the panel builds in the order the events actually run rather than all at
 * once. The last node lands at 0.72, which leaves the final quarter of the
 * travel holding the finished canvas: a diagram that completes on the last
 * pixel of its section is a diagram nobody sees whole.
 */
const NODE_AT = [0.16, 0.42, 0.68] as const;
const LINE_AT = [0.3, 0.56] as const;

const RISE = { duration: 0.55, ease: [0.22, 1, 0.36, 1] } as const;

interface CanvasNode {
  id: string;
  tag: string;
  name: string;
  when: string;
  image?: string;
}

/**
 * The three events, resolved once. Ids in, everything else read from the
 * events file that three pages already share.
 */
const CANVAS_NODES: CanvasNode[] = HOME_CANVAS.nodes.flatMap((node) => {
  const event = findEvent(node.id);
  if (!event) return [];
  return [
    {
      id: node.id,
      tag: node.tag,
      // The acronym, not the full registered name. These sit in a node about
      // 42% of a panel wide; "LEAP (The Learners Employability Awareness
      // Programme)" would be four lines of label above a photograph.
      name: event.name.split(' (')[0],
      when: formatEventWhen(event),
      image: event.cover,
    },
  ];
});

/**
 * The year drawn as a canvas: one event leading into the next.
 *
 * A photograph holds the left of the screen while a dark panel on the right
 * builds itself as the section is scrolled — a node arrives, the line to the
 * next one draws, then the node it points at. Modelled on the node canvas in
 * the reference the club asked for.
 *
 * **The connectors are the claim this section makes, so they had to be true.**
 * Nodes wired together say output feeds input. Three parallel programmes drawn
 * that way would be a diagram of a pipeline the club does not run. These three
 * are ordered by what each is *for* rather than by date: LEAP says what
 * employers expect, FORED puts students in front of institutions, and Mock
 * Placements is the rehearsal the other two build towards. That is a real
 * progression, and the tags on the nodes name it.
 *
 * **Everything is driven by scroll position, nothing by a timer.** Each node
 * and each line has a point in the section's travel where it belongs, and
 * scrolling back up unbuilds the canvas in reverse. An on-enter animation
 * would play once, at whatever speed it liked, and be over before a reader who
 * scrolled slowly arrived.
 *
 * **The lines draw with `pathLength`, which framer animates without touching
 * layout** — it is `stroke-dasharray` under the hood, on a path whose length
 * the browser already knows. Nothing here animates a geometric attribute.
 *
 * **No `AnimatePresence`.** Banned in this repo; its exit callback never fires
 * in a production build. Everything is mounted from the start and animates on
 * opacity and transform.
 *
 * Below the desktop breakpoint the DOM differs rather than the styling: a
 * canvas is a two-dimensional arrangement and a phone has one dimension to
 * spare, so the same three events run down the page as cards with the
 * connection stated in words instead of drawn.
 */
export function WorkflowCanvas() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progress, setProgress] = useState(0);

  /**
   * Where each node actually is, in the panel's own pixels.
   *
   * Measured rather than computed from the percentages that place them. A
   * node's *width* is a percentage and its height is whatever its photograph
   * and two lines of label come to, so where its bottom edge sits is not
   * knowable from the layout constants — the first version guessed at it and
   * drew connectors that started inside the node they were leaving and ended
   * short of the one they pointed at.
   */
  const [boxes, setBoxes] = useState<{ x: number; y: number; w: number; h: number }[]>([]);

  const drawing = isDesktop && !prefersReducedMotion;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !drawing) return;

    const measure = () => {
      setBoxes(
        nodeRefs.current.map((node) => {
          if (!node) return { x: 0, y: 0, w: 0, h: 0 };
          // `offset*`, not a rect. A rect includes the node's own transform,
          // and every node carries an 18px `y` until its turn comes — measured
          // from rects at mount, all of them reported 18px low and the
          // connectors were drawn to where the nodes had not arrived yet. The
          // offsets are the resting position, which is what a line between two
          // nodes should point at. Safe here because the panel is the nodes'
          // offset parent: it is `relative` and they are `absolute` inside it.
          return {
            x: node.offsetLeft,
            y: node.offsetTop,
            w: node.offsetWidth,
            h: node.offsetHeight,
          };
        }),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [drawing]);

  useEffect(() => {
    if (!drawing) return;
    return scrollYProgress.on('change', (p) => {
      // Rounded to hundredths. The panel only changes at eight thresholds, and
      // re-rendering on every sub-pixel of scroll to cross one of them is work
      // with nothing to show for it.
      const next = Math.round(p * 100) / 100;
      setProgress((current) => (current === next ? current : next));
    });
  }, [drawing, scrollYProgress]);

  const heading = (
    <SectionHeading
      eyebrow={HOME_CANVAS.eyebrow}
      title={HOME_CANVAS.title}
      description={HOME_CANVAS.description}
    />
  );

  if (!drawing) {
    return (
      <section className="py-section">
        <Container>
          <Reveal>{heading}</Reveal>

          <ol className="mt-2xl gap-lg tablet:grid-cols-3 grid">
            {CANVAS_NODES.map((node, i) => (
              <Reveal key={node.id} delay={i * 0.08} motionStyle="scale">
                <li>
                  <div className="bg-line-grid aspect-[4/3] overflow-hidden rounded-lg">
                    {node.image && (
                      <img
                        src={node.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-eyebrow text-story mt-md uppercase">{node.tag}</p>
                  <h3 className="text-h3 mt-xs">{node.name}</h3>
                  <p className="text-small text-text-muted mt-xs">{node.when}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>
    );
  }

  return (
    <section ref={trackRef} style={{ height: `${RUNWAY_VH}vh` }}>
      <div className="bg-dot-grid sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <Container>
          {heading}

          <div className="gap-xl mt-2xl grid grid-cols-[0.9fr_1.1fr] items-stretch">
            {/* The left picture barely moves — it is the ground the canvas is
                built against, and a photograph doing its own animation beside
                a diagram assembling itself is two things competing. */}
            <motion.div
              initial={false}
              animate={{ scale: 1 + Math.min(progress, 1) * 0.03 }}
              transition={{ duration: 0.4, ease: 'linear' }}
              className="bg-line-grid relative h-[64vh] overflow-hidden rounded-xl"
            >
              {CANVAS_NODES[0]?.image && (
                <img
                  src={CANVAS_NODES[0].image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>

            {/* The dark panel. Literal near-black rather than a theme colour:
                it is the surface the orange has to read against, and it has to
                stay dark if the site ever gains a dark mode.

                No dot field on it. `bg-board-dots` paints `--color-board-dot`,
                which is black at 7% — invisible here. The page texture the
                brief asks for is on the section instead, where the ground is
                light and it can be seen. */}
            <div
              ref={panelRef}
              className="relative h-[64vh] overflow-hidden rounded-xl bg-[#111111]"
            >
              {/* Connectors under the nodes, so a line arriving at a node
                  disappears behind it rather than crossing its face. */}
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full" fill="none">
                {LINE_AT.map((at, i) => {
                  const from = boxes[i];
                  const to = boxes[i + 1];
                  if (!from || !to || from.w === 0 || to.w === 0) return null;

                  const x1 = from.x + from.w / 2;
                  const y1 = from.y + from.h;
                  const x2 = to.x + to.w / 2;
                  const y2 = to.y;
                  const bend = Math.max(24, (y2 - y1) * 0.6);
                  const drawn = progress >= at;

                  return (
                    <motion.path
                      key={i}
                      // A cubic with both handles pulled vertically, so the
                      // line leaves the node downward and arrives at the next
                      // from above — the shape a cable falls into, rather than
                      // a diagonal that reads as an arrow.
                      d={`M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`}
                      stroke="var(--color-story-line)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      initial={false}
                      animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    />
                  );
                })}
              </svg>

              {CANVAS_NODES.map((node, i) => {
                const slot = NODES[i];
                const shown = progress >= NODE_AT[i];

                return (
                  <motion.div
                    key={node.id}
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    initial={false}
                    animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 18 }}
                    transition={RISE}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%` }}
                    className="absolute"
                  >
                    <div className="rounded-lg border border-white/10 bg-black/70 p-2 backdrop-blur-sm">
                      <div className="mb-2 flex items-center justify-between gap-2 px-1">
                        <span className="text-caption bg-story rounded-sm px-2 py-0.5 text-white">
                          {node.tag}
                        </span>
                        <span className="text-caption text-white/45">{node.when}</span>
                      </div>

                      <div className="bg-line-grid aspect-[16/9] overflow-hidden rounded-sm">
                        {node.image && (
                          <img
                            src={node.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <p className="text-small mt-2 px-1 text-white">{node.name}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Container>
      </div>

      {/* The three events again, in the flow, for anyone the drawn canvas is
          hidden from. The panel above is `aria-hidden` in effect — it is a
          picture of a sequence — and a list is what a sequence sounds like. */}
      <ul className="sr-only">
        {CANVAS_NODES.map((node) => (
          <li key={node.id}>
            {node.tag}: {node.name}, {node.when}.
          </li>
        ))}
      </ul>
    </section>
  );
}
