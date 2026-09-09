import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { AccentWord } from '@/components/motion/AccentWord';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { circulatingPhotos, type GalleryPhoto } from '@/pages/gallery/data';
import { HOME_CONVERGE } from '../data';
import { EventWorkflow, WORKFLOW_EVENTS, eventPosition } from '../components/EventWorkflow';
import { ConvergePhoto } from '../components/ConvergePhoto';
import { ConvergeRail } from '../components/ConvergeRail';

/**
 * The scroll-scrubbed centrepiece.
 *
 * Two columns of photographs start off either edge and converge on the
 * headline as you scroll through the section — students on one side, the
 * people who interview them on the other, meeting in the middle. The motion
 * is the argument the section is making, which is the only reason a page
 * should ever pin itself.
 *
 * How it works: the outer section is deliberately taller than the screen and
 * the inner panel is `sticky`, so the panel holds still while the section
 * scrolls past behind it. Progress through that travel drives the transforms.
 * Nothing hijacks the scroll — the wheel still does exactly what the visitor
 * expects, and scrolling back plays it in reverse.
 *
 * Under `prefers-reduced-motion` the panel is not pinned at all: the section
 * collapses to one screen with the columns already in place.
 */
/** Photographs on screen at once: three per column. */
const SLOT_COUNT = 6;
/** Between one slot's crossfade and the next, so the six do not flip as one. */
const STAGGER_MS = 130;

export function ConvergeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Matches the `desktop` breakpoint, which is where the photograph columns
  // are allowed to render. Below it the pinned layout has nothing to show, so
  // the DOM itself has to differ rather than just the styling.
  const isDesktop = useMediaQuery('(min-width: 64rem)');

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  });

  const leftX = useTransform(progress, [0, 1], ['-58%', '0%']);
  const rightX = useTransform(progress, [0, 1], ['58%', '0%']);
  // The columns arrive, hold, and then recede once the workflow opens over
  // them. They are the section's backdrop now rather than its subject — the
  // brief's own word — and a board at full contrast over photographs at full
  // contrast is two foregrounds. Keyframes across the whole 0–1 range, not a
  // sub-range: that is the `useTransform` shape that is safe here.
  const columnsOpacity = useTransform(progress, [0, 0.35, 0.44, 0.6], [0, 1, 1, 0.32]);
  const headingScale = useTransform(progress, [0, 1], [0.86, 1]);
  const headingOpacity = useTransform(progress, [0, 0.4, 1], [0.35, 0.85, 1]);

  const photos = circulatingPhotos();

  /**
   * Which event the columns are showing.
   *
   * The columns used to cycle the whole gallery on an idle timer, which was
   * the right answer when the middle of the screen was five pillars that had
   * nothing to do with any particular event. It is the wrong answer now: the
   * canvas in the middle is on one event at a time, and a backdrop wandering
   * through unrelated photographs behind it would be two things saying
   * different things at once.
   *
   * Read from the same `eventPosition` the canvas reads, off the same scroll
   * value, so the two cannot disagree about which event is current.
   */
  const [activeEvent, setActiveEvent] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;
    return progress.on('change', (p) => {
      const next = Math.round(eventPosition(p));
      setActiveEvent((current) => (current === next ? current : next));
    });
  }, [progress, prefersReducedMotion]);

  // Six slots from the current event's own album. `ConvergePhoto` crossfades
  // whenever it is handed a new picture, so changing event dissolves the whole
  // backdrop without anything here having to animate it.
  const backdrop = WORKFLOW_EVENTS[activeEvent]?.backdrop ?? [];
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) =>
    backdrop.length
      ? { ...photos[i % photos.length], id: `slot-${i}`, src: backdrop[i % backdrop.length] }
      : photos[i % photos.length],
  );

  if (!prefersReducedMotion && !isDesktop) {
    return <ConvergeMobile photos={photos} />;
  }

  if (prefersReducedMotion) {
    return (
      <section className="border-border bg-surface py-section border-y">
        <Container>
          <Heading />
          <EventWorkflow progress={progress} reduced />
        </Container>
      </section>
    );
  }

  return (
    <div ref={sectionRef} className="relative h-[260vh]">
      <section
        ref={panelRef}
        className="border-border bg-surface sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden border-y"
      >
        <motion.div
          aria-hidden="true"
          style={{ x: leftX, opacity: columnsOpacity }}
          className="gap-md desktop:flex absolute left-0 hidden w-[21vw] flex-col"
        >
          {slots.slice(0, 3).map((photo, index) => (
            <ConvergePhoto
              key={index}
              photo={photo}
              delayMs={index * STAGGER_MS}
              className="h-[22vh] w-full"
            />
          ))}
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ x: rightX, opacity: columnsOpacity }}
          className="gap-md desktop:flex absolute right-0 hidden w-[21vw] flex-col"
        >
          {slots.slice(3).map((photo, index) => (
            <ConvergePhoto
              key={index + 3}
              photo={photo}
              delayMs={(index + 3) * STAGGER_MS}
              className="h-[22vh] w-full"
            />
          ))}
        </motion.div>

        {/* Capped to the space the photograph columns leave, and only where
            those columns exist. `max-w-content` has a 1200px floor, so on any
            window narrower than about 2070px it was wider than the gap between
            two 21vw columns, and the headline and circles ran underneath them.
            The photographs keep their full width; it is the content that
            yields, because the content is what can reflow.

            60vw here rather than the 54vw the circles get. The heading is
            centred and its longest line is well short of its box, so it can
            sit in a wider box without coming near the photographs — and it
            needs to, because at 1024px the 54vw box minus the page gutter
            left 488px for a line that sets at about 500px, which broke
            "beyond the classroom." across two lines and the headline across
            three. */}
        <Container className="desktop:max-w-[60vw] relative">
          <motion.div style={{ scale: headingScale, opacity: headingOpacity }}>
            <Heading />
          </motion.div>
        </Container>

        {/* The workflow gets nearly the full width, where the pillars it
            replaced were capped at 54vw to clear the photograph columns. That
            cap is no longer the right constraint: the columns dim and recede
            once the board opens, so the board is allowed to pass over them —
            which is what the reference does, and what "the side images become
            the environment" asks for. At 54vw the board measured 482px, which
            is a panel, not a canvas.

            Still outside the heading's scaling wrapper: the heading grows into
            place as the section is scrubbed, and a board inheriting that scale
            would draw at a size that is still changing. */}
        <div className="px-gutter desktop:max-w-[92vw] desktop:px-0 relative z-10 mx-auto w-full">
          <EventWorkflow progress={progress} reduced={false} />
        </div>
      </section>
    </div>
  );
}

/**
 * The same section, composed for a phone.
 *
 * The desktop version pins a panel and slides two columns of photographs in
 * from either edge. Neither survives the trip down: the columns are hidden
 * below `desktop` because there is no room beside the text for them, and with
 * them gone the pin was holding a still image for 1350px of scrolling — the
 * section was 2194px tall on a 390px screen and contained no photograph at
 * all. What reached the phone was the argument's text with the argument's
 * imagery stripped out, which is exactly what it looked like.
 *
 * So the phone gets its own composition rather than a squeezed copy. Nothing
 * is pinned; the section is as tall as its content. The photographs return as
 * a full-bleed rail that drifts sideways against the page's own scrolling —
 * horizontal movement driven by vertical scroll, which reads as depth and
 * needs no width beside the text to work. Deliberately not a swipeable
 * carousel: nothing here is worth asking a reader to operate.
 */
function ConvergeMobile({ photos }: { photos: GalleryPhoto[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  // In `vw`, not `%`. A percentage here is a percentage of the *track*, which
  // is several screens wide, so `-26%` moved the rail most of a screen and
  // dragged the centred photograph out of frame. The drift is meant to be a
  // parallax against the page, not a second carousel: a few vw either side of
  // wherever the track is resting.
  const railX = useTransform(sectionProgress, [0, 1], ['3vw', '-3vw']);

  const { scrollYProgress: ringProgress } = useScroll({
    target: ringsRef,
    offset: ['start 0.95', 'start 0.3'],
  });

  return (
    <section
      ref={sectionRef}
      className="border-border bg-surface py-section overflow-hidden border-y"
    >
      <Container>
        <Heading />
      </Container>

      <ConvergeRail photos={photos} drift={railX} />

      <Container>
        <div ref={ringsRef}>
          <EventWorkflow progress={ringProgress} reduced={false} compact />
        </div>
      </Container>
    </section>
  );
}

/**
 * Width is set in rem, not ch. A `ch` max-width on this wrapper resolves
 * against the wrapper's own 16px font size rather than the heading's, which
 * stacked the headline into six narrow lines.
 */
function Heading() {
  return (
    <div className="gap-md mx-auto flex max-w-[52rem] flex-col items-center text-center">
      <p className="text-eyebrow text-text-subtle uppercase">{HOME_CONVERGE.eyebrow}</p>
      {/* Two lines, broken where the sentence breaks — after the comma —
          rather than wherever the measure happens to run out. Left to wrap on
          its own it made three ragged lines at the narrower desktop widths,
          with "beyond" stranded at the end of the second. The break is
          declared here rather than left to `text-balance`, which optimises for
          even line lengths and has no idea where the clause ends. */}
      {/* One step down below `tablet`. The two-line break is the point of the
          markup below, and on a 390px screen `text-h1` bottoms out at 36px,
          where "beyond the classroom." sets at about 390px against a ~350px
          measure — so it broke to three lines anyway and the declared break
          bought nothing. */}
      <h2 className="text-h2 tablet:text-h1">
        <span className="block">{HOME_CONVERGE.titleBefore}</span>
        <span className="block">
          <AccentWord>{HOME_CONVERGE.accent}</AccentWord> {HOME_CONVERGE.titleAfter}
        </span>
      </h2>
      <p className="text-body text-text-muted max-w-[68ch]">{HOME_CONVERGE.description}</p>
    </div>
  );
}
