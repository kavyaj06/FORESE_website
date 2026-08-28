import { SITE } from '@/data/site';

/**
 * Set the document title and the meta/OG tags for the current page.
 *
 * Called once from RootLayout using the matched route's metadata, so every
 * page gets correct tags without each page component having to remember.
 *
 * Note this is client-side only and therefore invisible to crawlers that do
 * not execute JS. It is the right trade-off for a Vite SPA; if search
 * visibility later becomes critical, the fix is pre-rendering at build time,
 * not a different runtime approach.
 */
export function applyPageMeta(title: string, description: string): void {
  document.title = title === SITE.name ? SITE.name : `${title} — ${SITE.name}`;

  setMetaTag('name', 'description', description);
  setMetaTag('property', 'og:title', document.title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:site_name', SITE.name);
}

/** Create or update a single <meta> tag in <head>. */
function setMetaTag(keyAttr: 'name' | 'property', key: string, value: string): void {
  const selector = `meta[${keyAttr}="${key}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(keyAttr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', value);
}
