import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, type MotionValue } from 'framer-motion';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import type { GalleryPhoto } from '@/pages/gallery/data';
import { useIdleAdvance } from './useIdleAdvance';

interface ConvergeRailProps {
  photos: GalleryPhoto[];
  /** The scroll-driven sideways drift the rail already had. */
  drift: MotionValue<string>;
}

/**
 * How many photographs are mounted. Two are on screen at 58vw each, so this is
 * one behind, two visible and two in hand — enough that nothing is ever
 * conjured at the edge of the frame, few enough that a phone is not holding a
 * gallery it cannot see.
 */
const WINDOW = 5;
/** Seconds for one photograph's width of travel. */
const SLIDE_S = 0.85;

/**
 * The phone's photograph rail: it drifts sideways with the page's scrolling,
 * and while the reader is stopped on it, it steps one photograph to the left
 * every few seconds.
 *
 * **One step, not a new set.** The desktop columns swap all six photographs at
 * once, which suits three fixed slots stacked either side of a headline. A rail
 * is a different thing: it is read as a strip that continues past both edges,
 * so the honest motion is the strip moving — the centre photograph slides left
 * and the one waiting at the right takes its place. Swapping the contents of a
 * strip that visibly extends offscreen reads as a glitch, because the pictures
 * change without the strip having gone anywhere.
 *
 * **How the loop is seamless.** The track slides exactly one photograph's
 * width, and on arrival the window advances by one index and the track snaps
 * back to zero. The snap is invisible because the photograph that was second is
 * now first, sitting precisely where the slide ended. The alternative — letting
 * the translation grow forever — needs no snap but drifts the track further
 * from the origin on every step for as long as the tab is open.
 *
 * Cycling is gated by `useIdleAdvance` on the rail itself: the page must be
 * still and the rail must be on screen. The section is taller than a phone, so
 * watching the section would keep it stepping long after the photographs had
 * left the top of the screen.
 */
export function ConvergeRail({ photos, drift }: ConvergeRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);
  const controls = useAnimationControls();

  const [pitch, setPitch] = useState(0);
  const [base, setBase] = useState(0);

  const step = useIdleAdvance({ ref: railRef, enabled: true });

  // One photograph's width plus the gap, measured rather than computed: the
  // width is in `vw` and the gap is a token, so the only place the true pitch
  // exists is the layout itself.
  useLayoutEffect(() => {
    const measure = () => {
      const item = itemRef.current;
      const rail = railRef.current;
      if (!item || !rail) return;
      const gap = parseFloat(getComputedStyle(rail.firstElementChild as Element).columnGap) || 0;
      setPitch(item.getBoundingClientRect().width + gap);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (step === 0 || pitch === 0) return;
    let cancelled = false;

    (async () => {
      await controls.start({ x: -pitch, transition: { duration: SLIDE_S, ease: EASE_OUT_BRAND } });
      if (cancelled) return;
      // Order matters. Advancing the window first and snapping second would
      // paint one frame with the new window still translated a full photograph
      // to the left, which is a visible jolt.
      setBase((b) => b + 1);
      controls.set({ x: 0 });
    })();

    return () => {
      cancelled = true;
    };
  }, [step, pitch, controls]);

  const visible = Array.from({ length: WINDOW }, (_, i) => photos[(base + i) % photos.length]);

  return (
    <div ref={railRef} className="mt-2xl overflow-hidden">
      <motion.div style={{ x: drift }}>
        <motion.ul animate={controls} className="gap-sm flex w-max">
          {visible.map((photo, index) => (
            <li
              key={base + index}
              ref={index === 0 ? itemRef : undefined}
              className="w-[58vw] shrink-0"
            >
              <img
                src={photo.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
}
