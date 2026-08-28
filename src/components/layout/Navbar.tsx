import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
 * `NavLink` sets `aria-current="page"` on the active route for free.
 *
 * ⚠️ The wordmark is text until the real Forese logo asset arrives, and the
 * visual treatment is provisional pending the anchor template.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Close the drawer whenever the route changes, including on back/forward.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="border-border bg-bg/85 sticky top-0 z-50 border-b backdrop-blur-md">
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
              {PRIMARY_NAV.map((route) => (
                <li key={route.path}>
                  <NavLink
                    to={route.path}
                    className={({ isActive }) =>
                      cn(
                        'text-label duration-fast transition-colors',
                        isActive ? 'text-text' : 'text-text-muted hover:text-text',
                      )
                    }
                  >
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Highlighted action — the outline shows Coders set apart on the right */}
          {NAV_ACTION && (
            <NavLink
              to={NAV_ACTION.path}
              className="text-label duration-fast desktop:block hidden font-semibold transition-opacity hover:opacity-70"
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
