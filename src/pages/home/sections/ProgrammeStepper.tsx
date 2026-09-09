import { useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { findEvent, formatEventWhen } from '@/data/events';
import { PREP_TOPICS } from '@/pages/mock-placements/data';
import { HOME_PROGRAMME, HOME_PROGRAMME_INTRO } from '../data';
import { ProgrammeTabs } from '../components/ProgrammeTabs';

const SWAP = { duration: 0.6, ease: [0.23, 1, 0.32, 1] } as const;

/**
 * Where the floating card sits for each entry, in pixels from where the
 * layout puts it.
 *
 * It drifts rather than holding one spot, which is the reference's own
 * behaviour — its card carries a live `translate` that changes as you move
 * through the section. The card is the one thing on screen that never leaves,
 * so a card nailed to one position for five screens stops reading as part of
 * the composition and starts reading as furniture bolted to the viewport.
 *
 * Small numbers on purpose. Enough to see it settle somewhere new; not enough
 * to make the reader hunt for the strip they were about to click.
 */
const DRIFT = [
  { x: 0, y: -40 },
  { x: 28, y: 24 },
  { x: 8, y: -16 },
  { x: 36, y: 40 },
  { x: 12, y: -28 },
] as const;

interface Entry {
  id: string;
  eyebrow: string;
  name: string;
  blurb: string;
  image?: string;
  when?: string;
  /** Short form for the strip, where the full event names would not fit. */
  short: string;
}

/**
 * The five entries, resolved once at module scope.
 *
 * Built here rather than in the component because none of it depends on
 * render: the events and the topics are module constants, and rebuilding the
 * array every render would hand the stage a new object identity each time.
 *
 * Names are shortened for the strip only. "LEAP (The Learners Employability
 * Awareness Programme)" is the event's real name and belongs on the panel; in
 * a strip of five it would be most of the card.
 */
const ENTRIES: Entry[] = HOME_PROGRAMME.flatMap((item): Entry[] => {
  if (item.kind === 'event') {
    const event = findEvent(item.id);
    // An id that no longer names an event drops out rather than rendering an
    // empty panel. This list is written by hand and the events are not.
    if (!event) return [];
    return [
      {
        id: item.id,
        eyebrow: 'Event',
        name: event.name,
        blurb: event.blurb ?? '',
        image: event.cover,
        when: formatEventWhen(event),
        // Everything before the parenthesis — FORED and LEAP both carry their
        // expansion in one, and the acronym is what the club says out loud.
        short: event.name.split(' (')[0],
      },
    ];
  }

  const topic = PREP_TOPICS.find((entry) => entry.id === item.id);
  if (!topic) return [];
  return [
    {
      id: item.id,
      eyebrow: 'Mock placement round',
      name: topic.label,
      blurb: topic.body,
      image: item.image,
      short: topic.label,
    },
  ];
});

/**
 * The club's programme: photographs full-bleed behind, a floating card that
 * drifts, and the words scrolling past between them.
 *
 * Three layers, which is the structure the reference uses and the reason this
 * was rebuilt from the boxed two-column version it replaced:
 *
 * 1. **A sticky full-bleed background.** All five photographs stacked and
 *    cross-faded on opacity alone, under a gradient scrim so the words on top
 *    stay legible whatever the picture is doing.
 * 2. **A sticky floating card**, carrying the five names and the live entry's
 *    line, which drifts to a new position for each entry.
 * 3. **The words in normal flow**, one screen-ish block per entry, scrolling
 *    up past the two sticky layers.
 *
 * **The page never stops.** This is the part worth keeping: the section is not
 * pinned, so the wheel always moves the document. The layers stick and the
 * content scrolls through them, which gets the same one-at-a-time reading as a
 * pinned runway without three screens where the page appears frozen. It is
 * also what the reference does, and it replaced a version here that did pin.
 *
 * **Scroll is the only thing that changes the entry.** The strip scrolls
 * rather than assigning, so the strip and the background cannot disagree — the
 * rule `MobileStack` documents.
 *
 * **The index is computed from measured geometry, not from progress alone.**
 * Which block is on screen depends on the block height and the viewport, so
 * both are measured and the subscription does the arithmetic. A bare
 * `round(p * n)` would drift out of step with the blocks the moment the
 * viewport was any height but the one it was tuned at.
 *
 * **Never `useTransform` on a scroll value.** It compiles to a native scroll
 * timeline whose keyframe sub-ranges do not clamp outside themselves — that is
 * what left three slides' text showing through one card on the phone board.
 *
 * **No `AnimatePresence`.** Banned here; its exit callback never fires in a
 * production build and has white-screened whole pages. Everything stays
 * mounted and cross-fades, the way `Pillars` does.
 *
 * Below the desktop breakpoint, and under reduced motion, the DOM differs
 * rather than the styling: no sticky layers, the five as a plain list. A
 * floating card drifting over full-bleed photographs needs width that a phone
 * does not have, and a section whose whole idea is layers is better replaced
 * than shrunk. The `ConvergeSection` precedent.
 */
export function ProgrammeStepper() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const trackRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);

  const layered = isDesktop && !prefersReducedMotion;

  /**
   * Each block's centre, in pixels from the top of the section, plus the
   * section height and the viewport.
   *
   * **The blocks are measured, never divided.** Dividing the section height by
   * five looks equivalent and is not: the heading sits in the same column
   * above the five, so the first "fifth" straddles the heading and every
   * boundary after it is offset by however tall that heading happens to be.
   * Measured, it was 256px out, and the strip changed a third of a screen
   * before the words it names — visible as the tab moving while the previous
   * entry was still the one being read.
   *
   * Measured here rather than in the subscription because `offsetTop` forces
   * layout, and doing that on every scroll event is how a smooth section
   * becomes a janky one.
   */
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const metrics = useRef({ centres: [] as number[], height: 0, viewport: 0 });

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const node = trackRef.current;
    if (!node || !layered) return;

    const measure = () => {
      // Rects, not `offsetTop`. `offsetTop` is measured from the nearest
      // positioned ancestor, and this section is `relative` — so the blocks
      // were already section-relative and subtracting the section's own
      // offset put every centre thousands of pixels negative. The strip then
      // matched the last entry at every scroll position.
      const base = node.getBoundingClientRect().top + window.scrollY;
      metrics.current = {
        centres: blockRefs.current.map((block) => {
          if (!block) return 0;
          const rect = block.getBoundingClientRect();
          return rect.top + window.scrollY - base + rect.height / 2;
        }),
        height: node.offsetHeight,
        viewport: window.innerHeight,
      };
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [layered]);

  useEffect(() => {
    if (!layered) return;
    return scrollYProgress.on('change', (p) => {
      const { centres, height, viewport } = metrics.current;
      if (!height || centres.length === 0) return;

      // Where the middle of the screen sits inside the section, and then the
      // block whose own middle is nearest it.
      const eye = p * (height - viewport) + viewport / 2;
      let next = 0;
      let best = Infinity;
      centres.forEach((centre, i) => {
        const distance = Math.abs(centre - eye);
        if (distance < best) {
          best = distance;
          next = i;
        }
      });
      setIndex((current) => (current === next ? current : next));
    });
  }, [layered, scrollYProgress]);

  /** Scroll so that entry `i` is the one the screen is centred on. */
  const goTo = (i: number) => {
    // The flat branch first: it renders no blocks to scroll between, and there
    // the strip is the only way to change entry at all.
    if (!layered) {
      setIndex(i);
      return;
    }
    const block = blockRefs.current[i];
    if (!block) return;
    const rect = block.getBoundingClientRect();
    window.scrollTo({
      top: rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2,
      behavior: 'smooth',
    });
  };

  const heading = (
    <SectionHeading
      eyebrow={HOME_PROGRAMME_INTRO.eyebrow}
      title={HOME_PROGRAMME_INTRO.title}
      description={HOME_PROGRAMME_INTRO.description}
    />
  );

  if (!layered) {
    return (
      <section className="py-section">
        <Container>
          <Reveal>{heading}</Reveal>

          <ul className="mt-2xl gap-xl tablet:grid-cols-2 grid">
            {ENTRIES.map((entry, i) => (
              <Reveal key={entry.id} delay={i * 0.06} motionStyle="scale">
                <li>
                  <div className="bg-line-grid aspect-[4/3] overflow-hidden rounded-lg">
                    {entry.image && (
                      <img
                        src={entry.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-eyebrow text-text-subtle mt-md uppercase">{entry.eyebrow}</p>
                  <h3 className="text-h3 mt-xs">{entry.name}</h3>
                  {entry.when && <p className="text-small text-text-muted mt-xs">{entry.when}</p>}
                  <p className="text-body text-text-muted mt-sm">{entry.blurb}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    );
  }

  return (
    <section ref={trackRef} className="relative isolate">
      {/* Layer 1 — the photographs. `absolute inset-0` over the whole section
          with a `sticky` child, so the picture holds the screen while the
          words scroll over it. Literal black in the scrim: it is darkening a
          photograph, and has to stay dark whatever the theme is doing. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="sticky top-0 h-screen overflow-hidden">
          {ENTRIES.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={false}
              animate={{ opacity: i === index ? 1 : 0 }}
              transition={SWAP}
              className="absolute inset-0"
            >
              <img src={entry.image} alt="" className="h-full w-full object-cover" />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />
        </div>
      </div>

      {/* Layer 2 — the floating card. Its own sticky layer rather than a child
          of the words, so it can sit still while they move past it. */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="sticky top-0 flex h-screen items-center">
          <Container className="w-full">
            <motion.div
              initial={false}
              animate={DRIFT[index] ?? DRIFT[0]}
              transition={{ type: 'spring', stiffness: 90, damping: 20 }}
              className="border-border bg-surface-raised gap-md pointer-events-auto flex w-[22rem] flex-col rounded-xl border p-4 shadow-lg"
            >
              <ProgrammeTabs
                labels={ENTRIES.map((entry) => entry.short)}
                index={index}
                onSelect={goTo}
                ariaLabel="Which part of the programme to show"
              />

              {/* Height reserved so the card does not resize under a reader
                  mid-scroll as a longer line arrives. */}
              <div className="relative min-h-[5.5rem]">
                {ENTRIES.map((entry, i) => (
                  <motion.p
                    key={entry.id}
                    aria-hidden={i !== index}
                    initial={false}
                    animate={{ opacity: i === index ? 1 : 0 }}
                    transition={SWAP}
                    className="text-small text-text-muted absolute inset-x-0 top-0 px-1"
                  >
                    {entry.blurb}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          </Container>
        </div>
      </div>

      {/* Layer 3 — the words, in normal flow. These are what give the section
          its height, and scrolling them is what moves everything else. */}
      <div className="relative z-10">
        <Container>
          {/* Written out rather than `SectionHeading`, which paints its own
              eyebrow `text-accent` and its description `text-text-muted` —
              both near-invisible on a darkened photograph. Restyling the
              shared component to cope with a dark ground would change every
              other section on the site to solve one section's problem. */}
          <div className="pt-section gap-sm flex max-w-[46ch] flex-col text-white">
            <p className="text-eyebrow uppercase opacity-70">{HOME_PROGRAMME_INTRO.eyebrow}</p>
            <h2 className="text-h2">{HOME_PROGRAMME_INTRO.title}</h2>
            <p className="text-body-lg opacity-80">{HOME_PROGRAMME_INTRO.description}</p>
          </div>
        </Container>

        {ENTRIES.map((entry, i) => (
          <div
            key={entry.id}
            ref={(node) => {
              blockRefs.current[i] = node;
            }}
            className="flex min-h-[90vh] items-center"
          >
            <Container className="w-full">
              <div className="ml-auto w-[46%] text-white">
                <p className="text-eyebrow uppercase opacity-70">{entry.eyebrow}</p>
                <h3 className="text-h2 mt-sm text-balance">{entry.name}</h3>
                {entry.when && <p className="text-small mt-sm opacity-70">{entry.when}</p>}
              </div>
            </Container>
          </div>
        ))}
      </div>
    </section>
  );
}
