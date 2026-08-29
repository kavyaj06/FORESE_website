import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { NAV_ACTION, PRIMARY_NAV } from '@/app/routes';
import { Container } from './Container';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/cn';

/**
 * Site header.
 *
 * Matches the outline's layout: wordmark left, plain links centre, the
 * highlighted Coders action right. All three come from the route table, so
 * this never needs editing when a page is added.
 *
 * The links are absolutely positioned and centred on the *header*, not laid
 * out in the space left over between the wordmark and the action. With
 * `justify-between` they drift as either side changes width — renaming
 * "Coders" or supplying a wider logo would visibly shift the whole nav. This
 * is the one structural idea taken from the 21st.dev reference; everything
 * else here is our own components and tokens.
 *
 * Two pieces of motion:
 *
 *  - The active underline is a single element that slides between links
 *    (`layoutId`) rather than one underline per link fading in and out. One
 *    object moving reads better than two things blinking.
 *  - The header gains its border and shadow only once the page has scrolled,
 *    so it sits flush with the hero at rest.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (value) => {
    const next = value > 8;
    setScrolled((previous) => (previous === next ? previous : next));
  });

  // Close the drawer whenever the route changes, including on back/forward.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'bg-bg/85 duration-base ease-out-brand sticky top-0 z-50 border-b backdrop-blur-md transition-[box-shadow,border-color]',
        scrolled ? 'border-border shadow-sm' : 'border-transparent',
      )}
    >
      <Container>
        <div className="relative flex h-16 items-center">
          <Logo />

          {/* Centred on the header itself — see the note above. */}
          <nav
            aria-label="Primary"
            className="desktop:flex absolute left-1/2 hidden -translate-x-1/2 items-center"
          >
            <ul className="gap-xl flex items-center">
              {PRIMARY_NAV.map((route) => {
                const isActive = pathname === route.path;
                return (
                  <li key={route.path} className="relative">
                    <NavLink
                      to={route.path}
                      className={cn(
                        'text-label duration-fast block py-1 transition-colors',
                        isActive ? 'text-text' : 'text-text-muted hover:text-text',
                      )}
                    >
                      {route.label}
                    </NavLink>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-underline"
                        aria-hidden="true"
                        className="bg-accent absolute -bottom-0.5 left-0 h-px w-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="gap-md ml-auto flex shrink-0 items-center">
            {/* The outline sets Coders apart on the right. A rule separates it
                from the nav proper, so it reads as a destination of a
                different kind rather than one more link. */}
            {NAV_ACTION && (
              <>
                <span aria-hidden="true" className="bg-border desktop:block hidden h-5 w-px" />
                <NavLink
                  to={NAV_ACTION.path}
                  className="text-label desktop:inline-flex duration-fast group hidden items-center gap-1 font-semibold transition-opacity hover:opacity-70"
                >
                  {NAV_ACTION.label}
                  <ArrowUpRight
                    size={15}
                    strokeWidth={2.25}
                    aria-hidden="true"
                    className="duration-fast ease-out-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </NavLink>
              </>
            )}

            {/* Mobile toggle — 44px touch target */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((isOpen) => !isOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="text-text desktop:hidden -mr-2 flex size-11 items-center justify-center rounded-md"
            >
              {menuOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Container>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusRef={toggleRef} />
    </header>
  );
}
