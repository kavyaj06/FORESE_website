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
import { StepRail } from '../components/StepRail';

/** Screen-heights of scroll each entry takes to arrive. */
const STEP_VH = 0.5;

const SWAP = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * The incoming entry waits for the outgoing one to clear.
 *
 * Without it the two cross-fade through each other and for most of the swap
 * the stage holds two photographs and two headings at half opacity in the same
 * place, legible as neither. The same fifth of a second `Pillars` buys, for
 * the same reason.
 */
const ENTER_DELAY = 0.18;

interface Entry {
  id: string;
  eyebrow: string;
  name: string;
  blurb: string;
  image?: string;
  when?: string;
  /** Short form for the rail, where the full event names would not fit. */
  short: string;
}

/**
 * The five entries, resolved once at module scope.
 *
 * Built here rather than in the component because none of it depends on
 * render: the events and the topics are module constants, and rebuilding the
 * array every render would hand the stage a new object identity each time and
 * defeat the memo-free equality checks the cross-fade relies on.
 *
 * Names are shortened for the rail only. "LEAP (The Learners Employability
 * Awareness Programme)" is the event's real name and belongs on the panel; in
 * a rail five rows deep it would wrap to three lines and push the rail past
 * the photograph.
 */
const ENTRIES: Entry[] = HOME_PROGRAMME.flatMap((item): Entry[] => {
  if (item.kind === 'event') {
    const event = findEvent(item.id);
    // An id that no longer names an event drops out rather than rendering an
    // empty panel. The list is written by hand and the events are not; this is
    // what happens if one is renamed.
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
        // expansion in one, and it is the acronym the club uses out loud.
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
 * The club's programme, one entry at a time, changed by scrolling.
 *
 * The section pins and the scroll steps through five entries: the photograph
 * on one side, what the thing is on the other, and a rail down the middle
 * saying where in the five you are. Modelled on the pinned step-through on
 * melius.com, which is the reference this was asked for.
 *
 * It sits above `UpcomingEvents` rather than replacing it, and the two are not
 * the same list. This is what the club runs — a standing answer, true whatever
 * the date. Upcoming is what has not happened yet, derived from the real clock
 * at render, and it empties and refills on its own as the year turns.
 *
 * **Scroll is the only thing that changes the entry.** The rail scrolls rather
 * than assigning, so the rail and the stage cannot disagree — the rule
 * `MobileStack` documents, after a tab bar that set an index directly snapped
 * back the moment the reader moved a pixel.
 *
 * **The index comes from a subscription, not `useTransform`.** A `useTransform`
 * reading a scroll value compiles to a native scroll timeline, whose keyframe
 * sub-ranges do not clamp outside themselves; that is what left three slides'
 * text showing through one card on the phone board. A plain subscription
 * applies what it is given at every position.
 *
 * **No `AnimatePresence`.** Banned here — its exit callback never fires in a
 * production build and has white-screened whole pages. All five photographs
 * and all five panels stay mounted and cross-fade, the way `Pillars` does.
 *
 * Below the desktop breakpoint the DOM differs rather than the styling. Two
 * columns and a rail have nowhere to go on a phone, and a pinned section that
 * holds a phone's scroll for three screens to show it five paragraphs is worse
 * than the list it is standing in for. The `ConvergeSection` precedent, which
 * gates its own columns on exactly this query.
 */
export function ProgrammeStepper() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const steps = Math.max(1, ENTRIES.length - 1);
  const pinned = isDesktop && !prefersReducedMotion;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    if (!pinned) return;
    return scrollYProgress.on('change', (p) => {
      const next = Math.min(ENTRIES.length - 1, Math.max(0, Math.round(p * steps)));
      setIndex((current) => (current === next ? current : next));
    });
  }, [pinned, scrollYProgress, steps]);

  /** Scroll so that entry `i` is the one on the stage. */
  const goTo = (i: number) => {
    // The unpinned branch first: it renders no runway, so looking for one and
    // giving up would leave the rail inert — and there it is the only way to
    // change entry at all.
    if (!pinned) {
      setIndex(i);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const travel = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: track.offsetTop + travel * (i / steps), behavior: 'smooth' });
  };

  const heading = (
    <SectionHeading
      eyebrow={HOME_PROGRAMME_INTRO.eyebrow}
      title={HOME_PROGRAMME_INTRO.title}
      description={HOME_PROGRAMME_INTRO.description}
    />
  );

  // Everything below the desktop breakpoint, and everything under reduced
  // motion: the five as an ordinary list, in flow, nothing pinned and nothing
  // hidden behind a scroll position.
  if (!pinned) {
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
    <section ref={trackRef} style={{ height: `${100 + steps * STEP_VH * 100}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <Container>
          {heading}

          {/* All five again, for assistive technology. Four of the five are
              `aria-hidden` on the stage below, which is right for the eye and
              wrong for a screen reader — without this, a reader who cannot see
              the scroll position would be told the club runs one thing. The
              same answer `Pillars` gives to the same problem. */}
          <ul className="sr-only">
            {ENTRIES.map((entry) => (
              <li key={entry.id}>
                {entry.eyebrow}: {entry.name}. {entry.when ? `${entry.when}. ` : ''}
                {entry.blurb}
              </li>
            ))}
          </ul>

          <div className="gap-xl mt-2xl grid grid-cols-[1fr_auto_1.1fr] items-center">
            {/* The stage's own height is reserved by the aspect ratio, so the
                grid does not resize as entries swap under a reader mid-scroll. */}
            <div className="bg-line-grid relative aspect-[4/3] overflow-hidden rounded-lg">
              {ENTRIES.map((entry, i) => (
                <motion.img
                  key={entry.id}
                  src={entry.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  aria-hidden={i !== index}
                  initial={false}
                  animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 0.94 }}
                  transition={{ ...SWAP, delay: i === index ? ENTER_DELAY : 0 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ))}
            </div>

            <StepRail
              labels={ENTRIES.map((entry) => entry.short)}
              index={index}
              onSelect={goTo}
              ariaLabel="Which part of the programme to show"
            />

            <div className="relative">
              {/* Reserved so the rail and the photograph do not shift when a
                  longer blurb arrives. Measured against the tallest of the
                  five — LEAP's, at 214px with its date line. */}
              <div className="min-h-[15rem]">
                {ENTRIES.map((entry, i) => {
                  const isActive = i === index;

                  return (
                    <motion.div
                      key={entry.id}
                      aria-hidden={!isActive}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        // Leaves upward once passed, waits below until its turn
                        // — so the movement agrees with the direction scrolled.
                        y: isActive ? 0 : i < index ? -12 : 12,
                      }}
                      transition={{ ...SWAP, delay: isActive ? ENTER_DELAY : 0 }}
                      className="absolute inset-x-0 top-0"
                    >
                      <p className="text-eyebrow text-text-subtle uppercase">{entry.eyebrow}</p>
                      <h3 className="text-h2 mt-sm text-balance">{entry.name}</h3>
                      {entry.when && (
                        <p className="text-small text-text-muted mt-sm">{entry.when}</p>
                      )}
                      <p className="text-body-lg text-text-muted mt-md max-w-[46ch]">
                        {entry.blurb}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
