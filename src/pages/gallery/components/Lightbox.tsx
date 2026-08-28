import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Modal } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';
import type { GalleryPhoto } from '../data';

interface LightboxProps {
  /** The album being viewed, or null when the lightbox is closed. */
  photos: GalleryPhoto[] | null;
  /** Index within `photos`. */
  index: number;
  eventName: string;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

/**
 * Full-view photograph overlay.
 *
 * Built on the shared `Modal` in its `bare` variant, so Escape, the focus
 * trap, focus restoration and the scroll lock are the same implementation the
 * rest of the site uses. Only what is specific to a gallery lives here:
 * paging, the counter, and the caption.
 *
 * Paging wraps at both ends. A gallery is a loop, not a list with walls — an
 * arrow key that silently does nothing reads as a broken key.
 */
export function Lightbox({ photos, index, eventName, onClose, onIndexChange }: LightboxProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const open = photos !== null && photos.length > 0;
  const total = photos?.length ?? 0;

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  // Arrow keys page the album. Escape is already Modal's job, so it is
  // deliberately not handled again here.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, go]);

  if (!open || !photos) return null;

  const photo = photos[index];

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="bare"
      title={`${eventName} — photograph ${index + 1} of ${total}`}
      className="max-w-content items-center gap-4"
    >
      <div className="relative flex w-full items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={photo.id}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full items-center justify-center"
          >
            {photo.src ? (
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
              />
            ) : (
              <span
                className="bg-surface text-text-subtle flex max-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-lg"
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              >
                <ImageIcon size={28} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-small">Photo to be added</span>
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <>
            <PageButton side="left" onClick={() => go(-1)} label="Previous photograph" />
            <PageButton side="right" onClick={() => go(1)} label="Next photograph" />
          </>
        )}
      </div>

      {/* Caption bar. `aria-live` so paging with the keyboard is announced —
          otherwise the image changes silently for a screen reader user. */}
      <div
        aria-live="polite"
        className="text-text-inverse gap-md flex w-full items-baseline justify-between"
      >
        <p className="text-small opacity-90">{photo.alt}</p>
        <p className="text-caption shrink-0 opacity-70">
          {index + 1} / {total}
        </p>
      </div>
    </Modal>
  );
}

function PageButton({
  side,
  onClick,
  label,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  label: string;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'bg-surface-inverse/60 text-text-inverse hover:bg-surface-inverse duration-fast rounded-pill absolute flex size-11 items-center justify-center backdrop-blur-sm transition-colors',
        side === 'left' ? 'left-2' : 'right-2',
      )}
    >
      <Icon size={22} aria-hidden="true" />
    </button>
  );
}
