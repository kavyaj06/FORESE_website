import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { MOVE } from './boardLayout';

interface ScrubbedTabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  /** Which tab is current. Rounded from the scroll position by the caller. */
  index: number;
  /** Scroll the reader to tab `i`. The strip never sets the index itself. */
  onSelect: (index: number) => void;
  ariaLabel: string;
}

/**
 * A tab strip whose labels slide past a pill that never moves.
 *
 * The usual arrangement is the opposite — the labels are fixed and the pill
 * travels to the selected one, which is what `SegmentedTabs` does everywhere
 * else on this site. That is right for a control the reader operates. It is
 * wrong here, because here the reader is not operating anything: they are
 * scrolling, and the strip is reporting where in the deck they have got to.
 *
 * Fixing the pill and moving the labels is what makes that legible. The pill
 * is the reading position, the strip is the material passing it, and the
 * information the reader wants — what comes next — is the label to the right
 * of the pill rather than a highlight jumping around a row. It reads like a
 * dial rather than a set of buttons, which is what it now is.
 *
 * **It moves between whole topics and never rests between two.** The strip
 * did track the scroll wheel continuously, on the theory that a readout should
 * report the scroll exactly. It should not: the reader stops wherever they
 * stop, and a strip driven by raw progress stops there too — pill straddling
 * the gap between two labels, half over one word and half over the next, while
 * the deck behind it had already committed to a card. The pill and the
 * highlight were computed from different numbers, so most resting positions
 * showed them disagreeing.
 *
 * So the strip animates to the whole index, the same number the deck uses.
 * Every position it can come to rest in has one label centred under the pill,
 * because those are the only positions it targets. The pill's width animates
 * with it and arrives as the shape of that label.
 *
 * **Positions are measured, never computed from character counts.** Labels are
 * proportional text and the widths are not knowable until the font has loaded;
 * a `ResizeObserver` on the row re-measures when it does, and on resize.
 *
 * **Written through motion values in a subscription, not `useTransform`.** A
 * `useTransform` reading a scroll value compiles to a native scroll timeline,
 * and this one would need keyframes at every tab centre — the same shape that
 * has already broken the phone board, where a sub-range silently stopped
 * clamping. See the note in `MobileStack`.
 *
 * Still a real tablist. Clicking or arrowing to a tab does not set anything
 * here; it asks the caller to scroll there, and the scroll moves the strip
 * like any other scroll. One writer, so the strip and the deck cannot
 * disagree.
 */
export function ScrubbedTabs<T extends string>({
  tabs,
  index,
  onSelect,
  ariaLabel,
}: ScrubbedTabsProps<T>) {
  const rowRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [metrics, setMetrics] = useState<{ centre: number; width: number }[]>([]);

  const x = useMotionValue(0);
  const pillWidth = useMotionValue(0);

  // Layout effect, not effect: the first paint would otherwise put every label
  // in its untranslated position and then snap, which reads as the strip
  // jumping to attention as the page settles.
  useLayoutEffect(() => {
    const measure = () =>
      setMetrics(
        buttonsRef.current.map((button) =>
          button
            ? { centre: button.offsetLeft + button.offsetWidth / 2, width: button.offsetWidth }
            : { centre: 0, width: 0 },
        ),
      );

    measure();
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [tabs]);

  useEffect(() => {
    if (metrics.length === 0) return;

    const target = metrics[Math.min(metrics.length - 1, Math.max(0, index))];
    // The board's own decelerate, so the strip and the card it names arrive
    // together rather than as two separate movements at two speeds.
    const controls = [animate(x, -target.centre, MOVE), animate(pillWidth, target.width, MOVE)];
    return () => controls.forEach((control) => control.stop());
  }, [metrics, index, x, pillWidth]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = tabs.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? Math.min(last, index + 1)
        : event.key === 'ArrowLeft'
          ? Math.max(0, index - 1)
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;

    if (next === -1) return;
    event.preventDefault();
    onSelect(next);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      // Clipped, and faded rather than cut at the edges: labels arrive from
      // and leave into nothing, which is what says the strip continues past
      // what is shown. A hard edge would read as a control that had been
      // cropped by accident.
      className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
    >
      <motion.span
        aria-hidden="true"
        style={{ width: pillWidth, x: '-50%' }}
        className="bg-accent rounded-pill absolute inset-y-0 left-1/2"
      />

      {/* `ml-[50%]` puts the row's origin on the strip's centre line, so the
          translation is simply minus the active label's own centre — no
          measurement of the container, which would need its own observer and
          could disagree with this one mid-resize. */}
      <motion.div ref={rowRef} style={{ x }} className="relative ml-[50%] flex w-max">
        {tabs.map((tab, i) => {
          const selected = i === index;

          return (
            <button
              key={tab.id}
              ref={(node) => {
                buttonsRef.current[i] = node;
              }}
              role="tab"
              type="button"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(i)}
              className={
                'text-label rounded-pill duration-fast shrink-0 px-6 py-2 whitespace-nowrap transition-colors ' +
                (selected ? 'text-accent-fg' : 'text-text-subtle hover:text-text')
              }
            >
              {tab.label}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
