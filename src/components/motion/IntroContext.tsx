import { createContext, useContext } from 'react';

/**
 * Whether the opening curtain has finished.
 *
 * Entrance animations that play on mount would otherwise run underneath the
 * loading overlay and be over before anyone sees them — the headline reveal on
 * the home page takes about a second, which is most of the time the curtain is
 * up. Components that animate on `animate` rather than on scroll read this and
 * hold until it is true.
 *
 * Defaults to `true` so anything rendered outside the provider — a test, a
 * future page mounted on its own — animates normally rather than never.
 */
export const IntroContext = createContext(true);

export function useIntroDone(): boolean {
  return useContext(IntroContext);
}
