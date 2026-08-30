import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE_OUT_BRAND } from './variants';
import { Logo } from '@/components/layout/Logo';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollLock } from '@/hooks/useScrollLock';

/** Never hold the page for longer than this, whatever is still loading. */
const MAX_MS = 2200;
/** Below this the curtain is a flash, which looks like a glitch. */
const MIN_MS = 700;

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
 * It is bounded at both ends. `MIN_MS` stops it flashing on a warm cache,
 * where appearing and vanishing inside 100ms reads as a rendering bug.
 * `MAX_MS` guarantees it lifts even if an asset never resolves — a curtain
 * with no timeout is a blank page waiting for one slow request.
 *
 * Shown once per browser tab. Repeating it on every navigation would make the
 * site feel slower the more of it you looked at.
 */
export function SiteLoader({ onDone }: SiteLoaderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(true);
  const startedAt = useRef(Date.now());

  useScrollLock(open);

  useEffect(() => {
    let frame = 0;
    let finished = false;

    // Creep towards 90% while waiting. The last 10% belongs to the real
    // completion event, so the bar never sits full while the page is not ready.
    const creep = () => {
      setProgress((current) => (current < 90 ? current + (90 - current) * 0.04 : current));
      frame = requestAnimationFrame(creep);
    };
    frame = requestAnimationFrame(creep);

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      setProgress(100);

      const elapsed = Date.now() - startedAt.current;
      window.setTimeout(() => setOpen(false), Math.max(0, MIN_MS - elapsed));
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
      cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
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
              : { y: '-100%', transition: { duration: 0.85, ease: EASE_OUT_BRAND } }
          }
          className="bg-bg fixed inset-0 z-[100] flex flex-col items-center justify-center"
        >
          <motion.div
            exit={
              prefersReducedMotion
                ? {}
                : { y: -40, opacity: 0, transition: { duration: 0.45, ease: EASE_OUT_BRAND } }
            }
            className="gap-2xl flex flex-col items-center"
          >
            <Logo className="text-h1" />

            <div className="gap-sm flex w-56 flex-col">
              <div className="bg-border h-px w-full overflow-hidden">
                <motion.div
                  className="bg-accent h-full origin-left"
                  style={{ scaleX: progress / 100 }}
                />
              </div>
              <p className="text-caption text-text-muted tabular-nums">
                {String(Math.round(progress)).padStart(3, '0')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
