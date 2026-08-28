import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import type { GalleryPhoto } from '../data';

interface HoverPreviewProps {
  photo: GalleryPhoto | null;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}

/**
 * The photograph that trails the cursor across the archive list.
 *
 * This is the whole reason the index can be a list of text rather than a wall
 * of cards: the pictures are still there, they just arrive on demand. It keeps
 * sixty events browsable in a few screens while the gallery still reads as a
 * gallery.
 *
 * The lag is the point. The preview is spring-bound to the pointer rather than
 * pinned to it, and the tilt is derived from horizontal velocity — so it
 * banks into the movement and settles, instead of moving like a cursor.
 *
 * Rendered only where a real pointer exists; see EventArchive.
 */
export function HoverPreview({ photo, pointerX, pointerY }: HoverPreviewProps) {
  const x = useSpring(pointerX, { stiffness: 260, damping: 26, mass: 0.6 });
  const y = useSpring(pointerY, { stiffness: 260, damping: 26, mass: 0.6 });

  // Difference between the pointer and where the preview has caught up to.
  const lag = useTransform(
    [pointerX, x],
    ([target, current]) => (target as number) - (current as number),
  );
  const rotate = useTransform(lag, [-140, 140], [-9, 9], { clamp: true });

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          aria-hidden="true"
          style={{ x, y, rotate }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="desktop:block pointer-events-none fixed top-0 left-0 z-40 -mt-28 -ml-22 hidden"
        >
          <img
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            className="h-56 w-44 rounded-lg object-cover shadow-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
