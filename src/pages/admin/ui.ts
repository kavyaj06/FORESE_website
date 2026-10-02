/**
 * The admin page's own small pieces.
 *
 * Deliberately not promoted into `@/components/ui`: that barrel is the public
 * site's design system, and a form field whose only caller is a private
 * editing screen does not belong in it. The repo's rule is that a component
 * moves up when a second page needs it — nothing else needs these.
 */
export { Field } from './Field';
export { Notice } from './Notice';

/**
 * A name turned into a URL-safe slug.
 *
 * It has to produce what the existing slugs look like — `mock-placement-drive-2026`
 * — because an album's address and its photograph folder are both built from
 * it, and the events already published were slugged by hand to that pattern.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
