import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Our type scale, as tailwind-merge needs to know it.
 *
 * These are `--text-*` tokens from theme.css, so `text-label` is a FONT SIZE.
 * tailwind-merge cannot know that: out of the box it sees an unfamiliar
 * `text-*` class and files it under text-colour. It then treats `text-label`
 * and `text-primary-fg` as the same property and drops the earlier one.
 *
 * That shipped as a real bug — every `<Button variant="primary">` lost its
 * `text-primary-fg`, because `SIZES` (with `text-label`) is merged after
 * `VARIANTS`. The buttons rendered white-on-white inside inverse sections and
 * black-on-black everywhere else: invisible labels, 1:1 contrast.
 *
 * Any new `--text-*` token added to theme.css must be added here too.
 */
const FONT_SIZE_TOKENS = [
  'display',
  'h1',
  'h2',
  'h3',
  'body-lg',
  'body',
  'small',
  'label',
  'eyebrow',
  'caption',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZE_TOKENS }],
    },
  },
});

/**
 * Merge Tailwind classes, resolving conflicts in favour of the last one.
 *
 * Without this, `cn('px-4', 'px-6')` would emit both and let CSS source order
 * decide the winner. With it, the later class wins predictably — which is what
 * makes components accept a `className` prop that can genuinely override their
 * defaults.
 *
 * @example
 * cn('rounded-lg px-4', isLarge && 'px-6', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
