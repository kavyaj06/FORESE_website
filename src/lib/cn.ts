import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
