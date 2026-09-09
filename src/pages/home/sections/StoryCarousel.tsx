import { useEffect, useMemo, useRef } from 'react';
import { motion, motionValue, useScroll, useSpring } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { circulatingPhotos } from '@/pages/gallery/data';
import { HOME_STORY } from '../data';

/** Screen-heights of scroll the track takes to travel once. */
const RUNWAY_VH = 260;

/**
 * How far the track reaches either side of centre, as a multiple of the
 * viewport width.
 *
 * Wider than the screen on purpose: a card's slot wraps from one end of the
 * track to the other, and the wrap has to happen where nobody can see it.
 *
 * Tuned by measurement, not by eye. At 1.35 the turnaround sat 1200px past the
 * screen edge, which put the whole near end of the depth curve out of sight —
 * cards on screen ran 0.48 to 0.75 and the full-size 1.15 ones were never
 * visible, so the row read as uniformly small rather than as a tunnel. At 0.8
 * a card is 0.90 by the time it reaches the edge of the screen and reaches
 * full size just past it, and the wrap still happens ~400px beyond that, well
 * outside the frame.
 */
const REACH = 0.8;

/**
 * The depth curve, read off the reference and then simplified.
 *
 * Cards at the centre of the track are the *small* ones — they are furthest
 * away, at the back of a tunnel — and the cards at the edges are nearest the
 * viewer and largest. That is the opposite of a carousel, where the middle is
 * the hero, and it is the whole reason the arrangement reads as depth rather
 * than as a row.
 */
const SCALE_NEAR = 1.15;
const SCALE_FAR = 0.46;
/** Degrees a card turns to face the centre line. */
const TURN = 34;
/** How far the middle of the track sags, in pixels. */
const SAG = 54;

export function StoryCarousel() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 64rem)');
  const isTablet = useMediaQuery('(min-width: 41rem)');

  const running = isDesktop && !prefersReducedMotion;
  // Tablet carries fewer cards over the same reach, so the row thins out
  // rather than crowding: eleven at 1440 is a procession, eleven at 800 is a
  // pile. Not a scaled-down eleven — a different number.
  const count = isDesktop ? 11 : isTablet ? 7 : 5;

  const photos = useMemo(() => circulatingPhotos(), []);
  const cards = useMemo(
    () => Array.from({ length: count }, (_, i) => photos[i % photos.length]),
    [count, photos],
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  /**
   * One set of motion values per slot, made once and written by hand.
   *
   * Not `useTransform`. A transform reading a scroll value compiles to a
   * native scroll timeline, and this one is a wrap — the same input maps to
   * two very different outputs either side of the seam, which is not a
   * keyframe range at all. It is also the shape that broke the phone board,
   * where a sub-range stopped clamping outside itself. Written in a
   * subscription these are plain numbers, applied as computed, defined
   * everywhere.
   *
   * `motionValue()` rather than `useMotionValue()` because they are created in
   * a loop, and hooks may not be. Held in a memo so the identities survive a
   * re-render and the elements keep the values they are bound to.
   */
  const slots = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: motionValue(0),
        y: motionValue(0),
        scale: motionValue(1),
        rotate: motionValue(0),
        opacity: motionValue(0),
      })),
    [count],
  );

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  /**
   * Smoothed, but not sprung.
   *
   * The brief asks for fluid movement without bounce, and those pull in
   * opposite directions: a spring loose enough to smooth a trackpad's jitter
   * is loose enough to overshoot when the wheel stops. High stiffness against
   * heavy damping is a follower rather than a spring — it lags the scroll by a
   * frame or two and never passes it. The same pair `ConvergeSection` settled
   * on for its own scrub.
   */
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 34,
    restDelta: 0.0005,
  });

  useEffect(() => {
    if (!running) return;

    const apply = (p: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const width = stage.clientWidth;
      const span = width * REACH;

      slots.forEach((slot, i) => {
        // Where this card sits along the track: its own even spacing, plus
        // however far the scroll has pushed the whole track along. The
        // fractional part is the wrap, and it is what makes the run endless
        // without ever remounting a card.
        const raw = i / slots.length + p;
        const u = raw - Math.floor(raw);

        // -1 at the left turnaround, 0 dead centre, +1 at the right.
        const t = u * 2 - 1;
        // 0 in the middle of the track, 1 at either end.
        const edge = Math.abs(t);

        slot.x.set(t * span);
        // Eased rather than linear, so the sag reads as a curve the cards are
        // travelling along and not as a V they turn at the bottom of.
        slot.y.set((1 - edge * edge) * SAG);
        slot.scale.set(SCALE_FAR + (SCALE_NEAR - SCALE_FAR) * edge);
        // Turned to face the centre line: negative on the left, positive on
        // the right, and flat as it passes through the middle.
        slot.rotate.set(-t * TURN);
        // Only for the last stretch before the turnaround, so a card fades out
        // and back in beyond the edge of the screen rather than at it.
        slot.opacity.set(edge > 0.88 ? Math.max(0, (1 - edge) / 0.12) : 1);
      });
    };

    apply(progress.get());
    return progress.on('change', apply);
  }, [running, progress, slots]);

  const heading = (
    <SectionHeading
      eyebrow={HOME_STORY.eyebrow}
      title={HOME_STORY.title}
      description={HOME_STORY.description}
      align="center"
    />
  );

  /**
   * Everything below the desktop breakpoint, and everything under reduced
   * motion.
   *
   * A different arrangement, not a scaled-down one. The horizontal run needs
   * width either side of the screen to hide its wrap in, and a phone has none
   * — the cards would wrap in plain sight, and the track would either overflow
   * sideways or be squeezed until the depth stopped reading. So the story goes
   * down the page instead of across it, which is the direction a phone scrolls
   * anyway, and each card arrives on its own as it comes into view.
   */
  if (!running) {
    return (
      <section className="py-section">
        <Container>
          <Reveal>{heading}</Reveal>

          <ul className="mt-2xl gap-lg tablet:grid-cols-3 grid grid-cols-2">
            {cards.map((photo, i) => (
              <Reveal key={`${photo.id}-${i}`} delay={(i % 3) * 0.08} motionStyle="scale">
                <li className="bg-line-grid aspect-[3/4] overflow-hidden rounded-lg">
                  <img
                    src={photo.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </li>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    );
  }

  return (
    <section ref={trackRef} style={{ height: `${RUNWAY_VH}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <Container>{heading}</Container>

        {/* The stage is full-bleed and clipped by the sticky panel above, not
            by a container: the track has to run off both edges of the screen,
            and a container would cut it at the gutter. `perspective` lives
            here so every card shares one vanishing point — set per card they
            would each turn around their own centre and the row would read as
            flat cards at angles rather than as one receding line. */}
        <div
          ref={stageRef}
          aria-hidden="true"
          className="mt-2xl relative h-[52vh] w-full [perspective:1400px]"
        >
          {cards.map((photo, i) => (
            <motion.div
              key={`${photo.id}-${i}`}
              style={{
                x: slots[i].x,
                y: slots[i].y,
                scale: slots[i].scale,
                rotateY: slots[i].rotate,
                opacity: slots[i].opacity,
              }}
              // Centred first by layout, then moved by transform. Positioning
              // with `left` would make every frame a layout pass; this way the
              // whole run is transform and opacity, which is what keeps it on
              // the compositor.
              className="absolute top-1/2 left-1/2 h-[38vh] w-[17vw] -translate-x-1/2 -translate-y-1/2 will-change-transform"
            >
              <div className="bg-line-grid h-full w-full overflow-hidden rounded-xl shadow-lg">
                <img
                  src={photo.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={photo.width}
                  height={photo.height}
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
