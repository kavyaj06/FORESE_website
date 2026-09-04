import { useEffect, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { HOME_PILLARS } from '../data';

interface PillarsProps {
  /** The parent section's scroll progress, 0–1 across its pinned travel. */
  progress: MotionValue<number>;
  reduced: boolean;
}

/**
 * Where in the section's travel the pillars do their work.
 *
 * They start after the photograph columns have arrived, so the two motions
 * read in sequence rather than competing, and they finish before the end so
 * the last pillar is held on screen for a beat rather than being swapped out
 * on the final pixel of the scroll.
 */
const START = 0.42;
const END = 0.92;

const SWAP = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * The incoming pillar waits for the outgoing one to clear.
 *
 * Without it the two cross-fade through each other, and for most of the swap
 * the screen holds two numbers and two titles at half opacity stacked in the
 * same place — legible as neither. Fading through empty costs a fifth of a
 * second and is the difference between a change and a smear.
 */
const ENTER_DELAY = 0.22;

/**
 * The five pillars as type, one at a time, changed by scrolling.
 *
 * There is no circle, no line and no row — this used to be five rings joined
 * by a hairline, which was a timeline, and these five are not a sequence:
 * nothing here happens before or after anything else. The ring that replaced
 * the row was still a container drawn around a phrase that did not need one,
 * and it capped how large the words could be, because the longest title had to
 * fit inside a circle.
 *
 * With the ring gone the words are the whole thing: a number, a title, and the
 * three or four words that say what it means in practice. Nothing is drawn
 * around them.
 *
 * **All five stay mounted and cross-fade; they are not keyed and remounted.**
 * A remount has no exit, so the outgoing pillar would vanish on the frame the
 * next one begins — a blink rather than a change. `AnimatePresence` would give
 * a real exit and is banned in this repo, because its exit callback has
 * already white-screened a production build.
 *
 * The outgoing pillar lifts away and the incoming one rises into its place, so
 * the swap has a direction that matches the direction you scrolled.
 *
 * The visual stack is `aria-hidden` in full and the five are given again as an
 * ordinary list for assistive technology — with their sentences, which the
 * screen no longer shows. Hiding four of five behind a scroll position is
 * correct for the eye and wrong for a screen reader, and an `opacity: 0`
 * element is still read aloud, so the alternative was not silence: it was five
 * pillars read in a row with nothing to say only one was on screen.
 */
export function Pillars({ progress, reduced }: PillarsProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const last = HOME_PILLARS.length - 1;
    return progress.on('change', (value) => {
      // Position within the pillars' own window, then one slot per pillar.
      const within = (value - START) / (END - START);
      const next = Math.min(last, Math.max(0, Math.floor(within * HOME_PILLARS.length)));
      setActive((current) => (current === next ? current : next));
    });
  }, [progress, reduced]);

  const list = (
    <ul className={reduced ? 'gap-lg mt-2xl flex flex-wrap justify-center' : 'sr-only'}>
      {HOME_PILLARS.map((pillar) => (
        <li key={pillar.id} className={reduced ? 'max-w-[16rem] text-center' : undefined}>
          <p className={reduced ? 'text-label' : undefined}>{pillar.title}</p>
          <p className={reduced ? 'text-caption text-text-muted mt-1' : undefined}>
            {pillar.terms.join(' · ')}
          </p>
          <p className={reduced ? 'text-caption text-text-muted mt-1' : undefined}>{pillar.body}</p>
        </li>
      ))}
    </ul>
  );

  if (reduced) return list;

  return (
    <div className="mt-2xl">
      {list}

      {/* The stack reserves its own height, so the section does not resize as
          the pillars change under a reader who is mid-scroll. 10rem against a
          measured tallest of 139px — "Real opportunities", the only title that
          wraps — which leaves 21px rather than the 69px an untested guess of
          13rem was holding open below the terms. */}
      <div aria-hidden="true" className="relative min-h-[10rem]">
        {HOME_PILLARS.map((pillar, index) => {
          const isActive = index === active;

          return (
            <motion.div
              key={pillar.id}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                // Leaves upward if it has been passed, waits below if its turn
                // has not come — so the movement always agrees with the scroll.
                y: isActive ? 0 : index < active ? -18 : 18,
              }}
              transition={{ ...SWAP, delay: isActive ? ENTER_DELAY : 0 }}
              className="gap-md absolute inset-x-0 top-0 flex flex-col items-center text-center"
            >
              <span className="text-h3 text-text-subtle tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3 className="text-h2 max-w-[16ch] text-balance uppercase">{pillar.title}</h3>

              {/* Joined here rather than stored joined: the separator is
                  typography, not content. */}
              <p className="text-body-lg text-text-muted">{pillar.terms.join(' · ')}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
