import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { AccentWord } from '@/components/motion/AccentWord';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { GALLERY_ALBUMS, type GalleryPhoto } from '@/pages/gallery/data';
import { HOME_CONVERGE } from '../data';
import { PillarCircles } from '../components/PillarCircles';
import { ConvergePhoto } from '../components/ConvergePhoto';
import { useIdleAdvance } from '../components/useIdleAdvance';

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
  const columnsOpacity = useTransform(progress, [0, 0.35], [0, 1]);
  const headingScale = useTransform(progress, [0, 1], [0.86, 1]);
  const headingOpacity = useTransform(progress, [0, 0.4, 1], [0.35, 0.85, 1]);

  const photos = GALLERY_ALBUMS.flatMap((album) => album.photos);

  /**
   * Every photograph in the gallery is in the pool, not just the six on screen.
   * Six slots showing six fixed pictures is a decoration; six slots drawing
   * from twenty-seven is the club's actual gallery going past.
   */
  const step = useIdleAdvance({ ref: panelRef, enabled: !prefersReducedMotion });
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => {
    // The whole set slides by six each step, so a slot never shows a picture
    // one of its neighbours is showing, and no slot repeats until the pool
    // has been through.
    return photos[(step * SLOT_COUNT + i) % photos.length];
  });

  if (!prefersReducedMotion && !isDesktop) {
    return <ConvergeMobile photos={photos} />;
  }

  if (prefersReducedMotion) {
    return (
      <section className="border-border bg-surface py-section border-y">
        <Container>
          <Heading />
          <PillarCircles progress={progress} reduced />
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

        {/* The circles get the same 54vw cap but not the page gutter, and that
            is the difference between five rings on one line and four with the
            fifth wrapped underneath. Inside a `Container` the gutter comes off
            both ends of an already tight budget: at 1024px the cap is 553px
            and the row needs 542px, which the gutter alone was enough to
            overflow. There is no gutter to lose here — the cap is measured
            against the photograph columns, so clearance is already built in.

            Also outside the heading's scaling wrapper on purpose: the heading
            grows into place as the section is scrubbed, and rings inheriting
            that scale would draw at a size that is still changing. */}
        <div className="max-w-content px-gutter desktop:max-w-[54vw] desktop:px-0 relative mx-auto w-full">
          <PillarCircles progress={progress} reduced={false} />
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
  const railRef = useRef<HTMLUListElement>(null);

  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  // Starts inset and ends pulled left, so the rail is never flush with either
  // edge — a strip that begins at x=0 looks like it failed to load.
  const railX = useTransform(sectionProgress, [0, 1], ['2%', '-26%']);

  const { scrollYProgress: ringProgress } = useScroll({
    target: ringsRef,
    offset: ['start 0.95', 'start 0.3'],
  });

  // Watched on the rail rather than the section. The section is taller than a
  // phone screen, so by the time its last third is in view the photographs are
  // long gone above the fold — the rail would be cycling where nobody could see
  // it. The element that has to be on screen is the one doing the changing.
  const step = useIdleAdvance({ ref: railRef, enabled: true });
  const railSlots = Array.from(
    { length: SLOT_COUNT },
    (_, i) => photos[(step * SLOT_COUNT + i) % photos.length],
  );

  return (
    <section
      ref={sectionRef}
      className="border-border bg-surface py-section overflow-hidden border-y"
    >
      <Container>
        <Heading />
      </Container>

      <motion.ul
        ref={railRef}
        aria-hidden="true"
        style={{ x: railX }}
        className="gap-sm mt-2xl flex w-max"
      >
        {railSlots.map((photo, index) => (
          <li key={index} className="w-[58vw] shrink-0">
            <ConvergePhoto
              photo={photo}
              delayMs={index * STAGGER_MS}
              className="aspect-[4/3] w-full"
            />
          </li>
        ))}
      </motion.ul>

      <Container>
        <div ref={ringsRef}>
          <PillarCircles progress={ringProgress} reduced={false} />
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
