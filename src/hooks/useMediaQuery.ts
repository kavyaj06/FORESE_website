import { useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query from JS.
 *
 * Only for cases where the DOM itself must differ by viewport — for example
 * rendering a drawer instead of a menu bar. Anything that is purely visual
 * should be a Tailwind responsive class instead, so it works before hydration.
 *
 * @example const isDesktop = useMediaQuery('(min-width: 64rem)');
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  };

  const getSnapshot = () => window.matchMedia(query).matches;

  // Server snapshot: assume the query does not match, so mobile-first markup
  // renders first and never flashes the desktop layout.
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
