import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { MOBILE_NAV } from '@/app/routes';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/lib/cn';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  /** The toggle button, so focus can be returned to it on close. */
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Full-screen navigation drawer for mobile and tablet.
 *
 * Sits below the header rather than covering it, so the close button stays
 * exactly where the open button was — the menu toggles in place instead of
 * the control moving under the user's thumb.
 */
export function MobileNav({ open, onClose, returnFocusRef }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);

  // Escape closes the drawer from anywhere.
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        returnFocusRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose, returnFocusRef]);

  // Move focus into the drawer so the next Tab lands on a nav link.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id="mobile-navigation"
      className="animate-fade-in border-border bg-bg desktop:hidden fixed inset-x-0 top-16 bottom-0 z-40 border-t"
    >
      <nav aria-label="Mobile" className="px-gutter py-lg">
        <ul className="flex flex-col">
          {MOBILE_NAV.map((route) => (
            <li key={route.path}>
              {/* The active route is marked by weight, contrast and a bullet
                  rather than by colour. The palette is monochrome, so a
                  colour-only active state would be no active state at all. */}
              <NavLink
                to={route.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'text-h3 border-border gap-md duration-fast flex min-h-14 items-center justify-between border-b transition-colors',
                    isActive ? 'text-text font-semibold' : 'text-text-muted hover:text-text',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {route.label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="bg-accent rounded-pill size-1.5 shrink-0"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
