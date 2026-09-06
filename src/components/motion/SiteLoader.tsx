import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE_OUT_BRAND } from './variants';
import { Logo } from '@/components/layout/Logo';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollLock } from '@/hooks/useScrollLock';

/** Never hold the page for longer than this, whatever is still loading. */
const MAX_MS = 3200;
/** Seconds. How long the logo takes to wipe in from the left. */
const REVEAL_S = 1.5;
/**
 * Below this the curtain is a flash, which looks like a glitch — and now also
 * long enough for the logo wipe to actually finish plus a short beat on the
 * finished mark. Without the floor covering the reveal, a warm cache lifts the
 * curtain mid-wipe and the animation is never seen.
 *
 * This is the real cost of a preloader: every visitor waits this long even when
 * nothing needs loading. Kept as tight as the animation allows.
 */
const MIN_MS = REVEAL_S * 1000 + 450;

interface SiteLoaderProps {
  onDone: () => void;
}

/**
 * The opening curtain.
 *
 * Tied to real loading — fonts and the window `load` event — rather than to a
 * fixed timer. A loader that always waits two seconds is not a loader, it is a
 * delay someone chose to inflict, and on a fast connection it is the slowest
 * part of the site.
 *
 * It is bounded at both ends. `MIN_MS` stops it flashing on a warm cache, and
 * is derived from `REVEAL_S` rather than set independently — the floor has to
 * cover the wipe, or a warm cache lifts the curtain mid-animation and the
 * reveal is never seen. Slowing the wipe therefore slows the floor with it,
 * and `MAX_MS` had to rise to stay above both.
 * where appearing and vanishing inside 100ms reads as a rendering bug.
 * `MAX_MS` guarantees it lifts even if an asset never resolves — a curtain
 * with no timeout is a blank page waiting for one slow request.
 *
 * Shown once per browser tab. Repeating it on every navigation would make the
 * site feel slower the more of it you looked at.
 */
export function SiteLoader({ onDone }: SiteLoaderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(true);
  const startedAt = useRef(Date.now());

  // Held in a ref so the effect below does not re-run — and does not restart
  // the whole curtain — if the parent passes a new function identity.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useScrollLock(open);

  useEffect(() => {
    let finished = false;

    // The creeping percentage that used to drive the readout is gone with it.
    // It existed to have something to display; nothing here needs to know how
    // far along loading is, only whether it is done. That also takes a
    // per-frame setState off the page during its slowest moment.
    const finish = () => {
      if (finished) return;
      finished = true;

      const elapsed = Date.now() - startedAt.current;
      window.setTimeout(
        () => {
          setOpen(false);
          // Released as the curtain *starts* to rise, not after it has gone.
          // Waiting for the exit to finish left the hero standing empty for the
          // whole 1.15s lift and only then filling in, which read as the page
          // arriving twice. Firing here means the headline is already rising as
          // the curtain uncovers it — the two motions are one movement.
          onDoneRef.current();
        },
        Math.max(0, MIN_MS - elapsed),
      );
    };

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
    ]);

    ready.then(finish);
    const failsafe = window.setTimeout(finish, MAX_MS);

    return () => {
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // Not a dialog and not focus-trapped: it takes no input and blocks
          // nothing the visitor is trying to do. `aria-hidden` keeps a screen
          // reader on the real page, which is already behind it.
          aria-hidden="true"
          data-theme="inverse"
          initial={false}
          exit={
            prefersReducedMotion
              ? { opacity: 0, transition: { duration: 0.2 } }
              : { y: '-100%', transition: { duration: 1.15, ease: EASE_OUT_BRAND } }
          }
          className="bg-bg fixed inset-0 z-[100] flex flex-col items-center justify-center"
        >
          <motion.div
            exit={
              prefersReducedMotion
                ? {}
                : { y: -40, opacity: 0, transition: { duration: 0.55, ease: EASE_OUT_BRAND } }
            }
            // One child now, so no gap and no column: the mark is centred by
            // the overlay itself.
            className="flex"
          >
            {/* The logo wipes in from the left rather than fading. Measured
                the reference frame by frame to check which it was: its left
                half brightened and settled while the right half stayed flat,
                then the right followed — a directional reveal, not a fade.
                `clip-path` gives exactly that and animates on the compositor.
                Reduced motion gets a plain fade instead of a moving edge. */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { clipPath: 'inset(0 100% 0 0)' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { clipPath: 'inset(0 0% 0 0)' }}
              transition={{
                duration: prefersReducedMotion ? 0.3 : REVEAL_S,
                ease: EASE_OUT_BRAND,
              }}
              // `flex`, not a bare block. The logo link is `inline-flex`, so
              // in a block parent it sits on a text baseline and the
              // line-height's half-leading adds 7px beneath it — which made
              // this box taller than the mark and pushed the mark 4px above
              // true centre. Flex takes it out of inline layout entirely.
              className="flex"
            >
              <Logo className="h-16" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
