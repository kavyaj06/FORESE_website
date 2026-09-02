/**
 * The shape of one card in the preparation board.
 *
 * In its own file because two components render it — the desktop composition
 * and the phone's scrolling stack — and having one import the other's types
 * would tie the two together for no reason beyond where the interface happened
 * to be written first.
 */

export interface StackThumb {
  tag: string;
  /** Shown on the preview's back when it is flipped. */
  flipText: string;
  image?: string;
}

export interface StackSlide {
  id: string;
  /** Tab label, and the card's own title. */
  category: string;
  image?: string;
  description: string;
  thumbnails: [StackThumb, StackThumb, StackThumb, StackThumb];
}

/**
 * The card's shell, exactly as specified: a hairline, a 2px lift, and a 12px
 * corner.
 *
 * The radius is set here rather than with `rounded-xl` because this project
 * overrides Tailwind's radius scale — `rounded-xl` resolves to 24px, twice what
 * the brief asks for, and the difference is the whole distance between a
 * printed card and a soft UI panel.
 */
export const CHROME = {
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  borderRadius: 12,
} as const;
