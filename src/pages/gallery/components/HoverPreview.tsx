import { AnimatePresence, motion, useMotionTemplate, useSpring, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import type { GalleryPhoto } from '../data';

interface HoverPreviewProps {
  photo: GalleryPhoto | null;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}

/**
 * The photograph that trails the cursor across the archive list.
 *
 * This is what lets the index be a list of text rather than a wall of cards:
 * the pictures are still there, they just arrive on demand.
 *
 * Three things keep it from reading as a rectangle stuck to the cursor:
 *
 *  - It stays mounted for as long as any row is hovered, and only the image
 *    inside it cross-fades. Moving between two rows fires the first row's
 *    mouseleave before the second row's mouseenter, so a preview that keyed
 *    its whole existence on "is a row hovered" would unmount and remount
 *    between every row — a flicker, not a transition.
 *  - Its edges are feathered rather than cut, and it carries no shadow, so it
 *    sits in the page instead of on top of it.
 *  - It is spring-bound to the pointer rather than pinned, and tilts from its
 *    own lag, so it banks into the movement and settles. It also sits beside
 *    the cursor, not under it, so it never covers the name being read.
 */
export function HoverPreview({ photo, pointerX, pointerY }: HoverPreviewProps) {
  // Softer than a cursor: it should feel towed, not attached.
  const x = useSpring(pointerX, { stiffness: 150, damping: 24, mass: 0.9 });
  const y = useSpring(pointerY, { stiffness: 150, damping: 24, mass: 0.9 });

  // How far behind the pointer the preview currently is.
  const lag = useTransform(
    [pointerX, x],
    ([target, current]) => (target as number) - (current as number),
  );
  const rotate = useTransform(lag, [-200, 200], [-5, 5], { clamp: true });

  // Composed into one string rather than handed to framer as separate `x`/`y`
  // style values. Driving them separately left the y translation out of the
  // rendered transform entirely: `x` was read by the `lag` transform above and
  // so stayed live, while `y` — read only by `style` — never ran. A template
  // reads both explicitly.
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`;

  return (
    <AnimatePresence>
      {photo && (
        /* Two elements on purpose. The outer one is position only — its
           transform belongs entirely to the pointer springs. The inner one
           owns the entrance. Combining them meant `animate` and the
           style-driven transform fought over the same property, and the
           y translation was silently dropped from the rendered transform. */
        <motion.div
          aria-hidden="true"
          style={{ transform }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: EASE_OUT_BRAND }}
          className="desktop:block pointer-events-none fixed top-0 left-0 z-40 -mt-24 ml-8 hidden"
        >
          <motion.div
            initial={{ scale: 0.92, filter: 'blur(10px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.42, ease: EASE_OUT_BRAND }}
            className="mask-feather relative h-48 w-36 overflow-hidden"
          >
            <AnimatePresence initial={false}>
              <motion.img
                key={photo.id}
                src={photo.src}
                alt=""
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.34, ease: EASE_OUT_BRAND }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
