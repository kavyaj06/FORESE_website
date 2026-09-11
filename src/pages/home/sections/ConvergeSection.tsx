import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { AccentWord } from '@/components/motion/AccentWord';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { circulatingPhotos, type GalleryPhoto } from '@/pages/gallery/data';
import { HOME_CONVERGE } from '../data';
import { CLOSED_HEIGHT, CLOSED_WIDTH } from '../components/EventWorkflow';
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

export function ConvergeSection({
  startSlotRef,
  stageRef,
}: {
  /** Where the travelling bar begins — see `EventJourney`. */
  startSlotRef?: React.RefObject<HTMLDivElement | null>;
  /**
   * This section's own panel, which the bar reads to know when it has
   * settled: the bar is not shown until this stops moving, or it rides up the
   * screen with the section as it arrives.
   */
  stageRef?: React.RefObject<HTMLElement | null>;
} = {}) {
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

  // The columns, the headline and the two of them together are done by the
  // half-way point rather than at the very end. The section has a second job
  // now — it is where the prompt bar stands and waits — and a bar that sets
  // off while the photographs are still arriving is two moves competing for
  // one scroll. Finishing early leaves the rest of the pin for the bar.
  const leftX = useTransform(progress, [0, 0.5, 1], ['-58%', '0%', '0%']);
  const rightX = useTransform(progress, [0, 0.5, 1], ['58%', '0%', '0%']);
  // The columns arrive, hold, and then recede once the workflow opens over
  // them. They are the section's backdrop now rather than its subject — the
  // brief's own word — and a board at full contrast over photographs at full
  // contrast is two foregrounds. Keyframes across the whole 0–1 range, not a
  // sub-range: that is the `useTransform` shape that is safe here.
  // Keyframe inputs must increase. Written as [0, 0.3, 0.36, SCENE_AT] this
  // was [0, 0.3, 0.36, 0.34] — a range that goes backwards, which framer
  // cannot interpolate, so the columns simply never faded.
  // The columns arrive and hold. They are this section's imagery; the event
  // photography belongs to the section below, where the canvas is. Keyframes
  // across the whole 0–1 range, not a sub-range: that is the `useTransform`
  // shape that is safe here.
  const columnsOpacity = useTransform(progress, [0, 0.3, 1], [0, 1, 1]);
  const headingScale = useTransform(progress, [0, 0.5, 1], [0.86, 1, 1]);
  const headingOpacity = useTransform(progress, [0, 0.25, 0.5, 1], [0.35, 0.9, 1, 1]);

  const photos = circulatingPhotos();

  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => photos[i % photos.length]);

  if (!prefersReducedMotion && !isDesktop) {
    return <ConvergeMobile photos={photos} startSlotRef={startSlotRef} stageRef={stageRef} />;
  }

  if (prefersReducedMotion) {
    return (
      <section className="border-border bg-surface py-section border-y">
        <Container>
          <Heading />
        </Container>
      </section>
    );
  }

  return (
    <div ref={sectionRef} className="relative h-[260vh]">
      <section
        ref={(node) => {
          panelRef.current = node;
          if (stageRef) stageRef.current = node;
        }}
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
        <Container className="desktop:max-w-[60vw] relative z-10">
          <motion.div style={{ scale: headingScale, opacity: headingOpacity }}>
            <Heading />
          </motion.div>
        </Container>

        {/* Where the bar starts. Empty markup with the closed bar's own
            dimensions: the bar itself is `position: fixed` and lives in the
            wrapper above both sections, because it has to leave this one. All
            this has to do is be laid out where the bar should begin, which is
            what makes the flight land correctly at any width without a single
            hard-coded coordinate. */}
        <div
          ref={startSlotRef}
          aria-hidden="true"
          style={{ width: CLOSED_WIDTH, height: CLOSED_HEIGHT }}
          className="mt-2xl relative"
        />
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
function ConvergeMobile({
  photos,
  startSlotRef,
  stageRef,
}: {
  photos: GalleryPhoto[];
  startSlotRef?: React.RefObject<HTMLDivElement | null>;
  stageRef?: React.RefObject<HTMLElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        if (stageRef) stageRef.current = node;
      }}
      className="border-border bg-surface py-section overflow-hidden border-y"
    >
      <Container>
        <Heading />
      </Container>

      <ConvergeRail photos={photos} drift={railX} />

      {/* Where the bar starts, here as well: the travel runs at every width
          now, so the marker it leaves from has to exist at every width. */}
      <Container>
        <div
          ref={startSlotRef}
          aria-hidden="true"
          style={{ height: CLOSED_HEIGHT }}
          className="mt-xl relative w-full"
        />
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
