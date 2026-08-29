import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { AccentWord } from '@/components/motion/AccentWord';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { GALLERY_ALBUMS } from '@/pages/gallery/data';
import { HOME_CONVERGE } from '../data';

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
export function ConvergeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

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

  // Two disjoint sets, so the same photograph never appears on both sides.
  const photos = GALLERY_ALBUMS.flatMap((album) => album.photos);
  const leftPhotos = photos.slice(0, 3);
  const rightPhotos = photos.slice(3, 6);

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
      <section className="border-border bg-surface sticky top-0 flex h-screen items-center overflow-hidden border-y">
        <motion.div
          aria-hidden="true"
          style={{ x: leftX, opacity: columnsOpacity }}
          className="gap-md desktop:flex absolute left-0 hidden w-[21vw] flex-col"
        >
          {leftPhotos.map((photo) => (
            <img
              key={photo.id}
              src={photo.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-[22vh] w-full rounded-lg object-cover"
            />
          ))}
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ x: rightX, opacity: columnsOpacity }}
          className="gap-md desktop:flex absolute right-0 hidden w-[21vw] flex-col"
        >
          {rightPhotos.map((photo) => (
            <img
              key={photo.id}
              src={photo.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-[22vh] w-full rounded-lg object-cover"
            />
          ))}
        </motion.div>

        <Container className="relative">
          <motion.div style={{ scale: headingScale, opacity: headingOpacity }}>
            <Heading />
          </motion.div>
        </Container>
      </section>
    </div>
  );
}

/**
 * Width is set in rem, not ch. A `ch` max-width on this wrapper resolves
 * against the wrapper's own 16px font size rather than the heading's, which
 * stacked the headline into six narrow lines.
 */
function Heading() {
  return (
    <div className="gap-lg mx-auto flex max-w-[44rem] flex-col items-center text-center">
      <p className="text-eyebrow text-text-subtle uppercase">{HOME_CONVERGE.eyebrow}</p>
      <h2 className="text-h1">
        {HOME_CONVERGE.titleBefore} <AccentWord>{HOME_CONVERGE.accent}</AccentWord>{' '}
        {HOME_CONVERGE.titleAfter}
      </h2>
      <p className="text-body-lg text-text-muted max-w-[46ch]">{HOME_CONVERGE.description}</p>
    </div>
  );
}
