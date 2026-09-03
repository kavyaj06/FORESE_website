import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A single word set in serif italic inside a sans headline.
 *
 * The face change carried the emphasis on its own while the site had no
 * colour in it. It now has one, so the accent word takes the accent too —
 * serif italic *and* brand, which is the one word in a headline that gets to
 * be both. It stays one or two words, so it reads as stress rather than as a
 * second typeface competing with the first.
 *
 * A filled block, not coloured letters. Coloured text is the timid version of
 * this and it reads as a link; the brand references all do the same thing —
 * a marker laid behind one word — and that is what makes a headline feel
 * designed rather than merely tinted.
 *
 * `bg-accent` with `text-accent-fg`, so it inverts itself: crimson under white
 * on a light section, flame under black on a dark one. Neither is written
 * down here, and both clear AA.
 *
 * Inside `TextReveal` the block belongs on the outer tag, which is not the
 * element that clips the rising word — so the marker lands first and the word
 * rises into it. Colour is never the only signal: the face change already
 * carried this emphasis and still does.
 *
 * Purely visual — it carries no semantic weight, so it is a `span` and not an
 * `<em>`. If a word ever needs real emphasis for a screen reader, that is a
 * different element.
 */
/**
 * The face change itself, separated so it can be handed to `TextReveal`.
 *
 * A headline that reveals word by word has to reveal its accent word too. This
 * component renders a plain, always-visible span, which is right inside a
 * block that reveals as a unit — and wrong inside a `TextReveal`, where every
 * other word is held down and this one would sit there alone. Callers in that
 * position pass this class to `TextReveal` instead of nesting this component.
 */
export const ACCENT_WORD_CLASS =
  'bg-accent text-accent-fg rounded-[0.18em] px-[0.16em] pb-[0.04em] font-serif italic';

export function AccentWord({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(ACCENT_WORD_CLASS, className)}>{children}</span>;
}
