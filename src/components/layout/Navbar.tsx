import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_ACTION, PRIMARY_NAV } from '@/app/routes';
import { SITE } from '@/data/site';
import { Container } from './Container';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/cn';

/**
 * Site header.
 *
 * Matches the outline's layout: wordmark left, plain links centre, the
 * highlighted Coders action right. All three come from the route table, so
 * this never needs editing when a page is added.
 *
 * Two pieces of motion:
 *
 *  - The active-link underline is a single element that slides between links
 *    (`layoutId`), rather than one underline per link fading in and out. That
 *    is what makes navigation feel like one object moving instead of two
 *    unrelated things blinking.
 *  - The header gains a border and shadow only once the page has scrolled, so
 *    it sits flush with the hero at rest and separates itself from content
 *    only when there is content beneath it.
 *
 * ⚠️ The wordmark is text until the real Forese logo asset arrives.
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
        'bg-bg/85 duration-base ease-out-brand sticky top-0 z-50 backdrop-blur-md transition-[box-shadow,border-color]',
        scrolled ? 'border-border shadow-sm' : 'border-transparent',
        'border-b',
      )}
    >
      <Container>
        <div className="gap-lg flex h-16 items-center justify-between">
          <NavLink
            to="/"
            className="text-h3 duration-fast tracking-tight transition-opacity hover:opacity-70"
            aria-label={`${SITE.name} — home`}
          >
            {SITE.name}
          </NavLink>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="desktop:block hidden">
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

          {/* Highlighted action — the outline shows Coders set apart on the right */}
          {NAV_ACTION && (
            <NavLink
              to={NAV_ACTION.path}
              className="text-label desktop:block duration-fast hidden font-semibold transition-opacity hover:opacity-70"
            >
              {NAV_ACTION.label}
            </NavLink>
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
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusRef={toggleRef} />
    </header>
  );
}
