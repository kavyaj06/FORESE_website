import { useEffect, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { HOME_PILLARS } from '../data';

interface PillarCirclesProps {
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
 * the screen holds two titles and two sentences at half opacity stacked in the
 * same place — legible as neither. Fading through empty costs a fifth of a
 * second and is the difference between a change and a smear.
 */
const ENTER_DELAY = 0.22;

/**
 * The five pillars, one at a time, changed by scrolling.
 *
 * This replaced a row of five rings joined by a hairline. That version was a
 * timeline, and these five are not a sequence: nothing here happens before or
 * after anything else, so a line drawn through them asserted an order the
 * content does not have. It also meant five circles competing at 102px each,
 * where the point of the section is one idea at a time.
 *
 * One circle, big enough to actually look at, and the scroll moves through
 * them. The outgoing pillar lifts away and the incoming one rises into its
 * place, so the swap has a direction that matches the direction you scrolled
 * — scroll back up and it runs the other way.
 *
 * **All five stay mounted and cross-fade; they are not keyed and remounted.**
 * A remount has no exit, so the outgoing pillar would vanish on the frame the
 * next one begins — a blink rather than a change. `AnimatePresence` would give
 * a real exit and is banned in this repo, because its exit callback has
 * already white-screened a production build. Keeping all five mounted and
 * animating opacity is the version that needs neither.
 *
 * The index counter is orientation, not decoration: with only one pillar
 * visible there is otherwise no way to know that four more exist, and a reader
 * who stops scrolling halfway has no idea they are halfway.
 *
 * The visual stack is `aria-hidden` in full and the five are given again as an
 * ordinary list for assistive technology. Hiding four of five behind a scroll
 * position is correct for the eye and wrong for a screen reader, and an
 * `opacity: 0` element is still read aloud — so the alternative was not
 * "nothing", it was all five read in a random order with no indication that
 * only one was on screen.
 */
export function PillarCircles({ progress, reduced }: PillarCirclesProps) {
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
          <p className={reduced ? 'text-caption text-text-muted mt-1' : undefined}>{pillar.body}</p>
        </li>
      ))}
    </ul>
  );

  if (reduced) return list;

  return (
    <div className="mt-xl">
      {list}

      {/* The stack reserves its own height, so the section does not resize as
          the pillars change under a reader who is mid-scroll. */}
      <div
        aria-hidden="true"
        className="relative mx-auto flex h-[clamp(11rem,20vw,15rem)] w-[clamp(11rem,20vw,15rem)] items-center justify-center"
      >
        {HOME_PILLARS.map((pillar, index) => {
          const isActive = index === active;
          const Icon = pillar.icon;

          return (
            <motion.div
              key={pillar.id}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 0.9,
                // Leaves upward if it has been passed, waits below if its turn
                // has not come — so the movement always agrees with the scroll.
                y: isActive ? 0 : index < active ? '-14%' : '14%',
              }}
              transition={{ ...SWAP, delay: isActive ? ENTER_DELAY : 0 }}
              className="border-border-strong absolute inset-0 flex flex-col items-center justify-center rounded-full border text-center"
            >
              <Icon size={30} strokeWidth={1.4} />
              <span className="text-h3 mt-3 block max-w-[70%] text-balance">{pillar.title}</span>
            </motion.div>
          );
        })}
      </div>

      <p
        aria-hidden="true"
        className="text-eyebrow text-text-subtle mt-lg text-center tabular-nums"
      >
        {String(active + 1).padStart(2, '0')} / {String(HOME_PILLARS.length).padStart(2, '0')}
      </p>

      {/* Height reserved for the longest sentence, so a change never moves the
          page under the reader. */}
      <div className="mt-sm relative min-h-[4.5rem]">
        {HOME_PILLARS.map((pillar, index) => (
          <motion.p
            key={pillar.id}
            aria-hidden="true"
            initial={false}
            animate={{ opacity: index === active ? 1 : 0 }}
            transition={{ ...SWAP, delay: index === active ? ENTER_DELAY : 0 }}
            className="text-body text-text-muted absolute inset-x-0 mx-auto max-w-[46ch] text-center"
          >
            {pillar.body}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
