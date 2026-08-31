import { NavLink } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { footerRoutes } from '@/app/routes';
import { CONTACT, LOCATION, SITE, SOCIAL_LINKS } from '@/data/site';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { HoverWordmark } from '@/components/motion/HoverWordmark';
import { ForeseMark } from './ForeseMark';

/**
 * Site footer, rebuilt on the Nur UI "hover footer" reference.
 *
 * Structure is the reference's, one-for-one: a floating rounded card inset
 * from the page edge, a four-column grid, a rule, a social + copyright row,
 * and the oversized wordmark bleeding off the bottom, with an ambient radial
 * wash behind everything.
 *
 * Two things are ours rather than the reference's, deliberately:
 *
 *  - The content. The reference ships another product's placeholder copy —
 *    its name, its address in Sylhet, "Employee Handbook", "Careers". All of
 *    it is replaced by the club's real data, and Quick links still derives
 *    from the route table, so a new page appears here on its own.
 *  - The card is genuinely dark. The reference sets a 10%-opacity background
 *    and relies on the page behind it already being dark; on this site the
 *    page is white, which would have left a washed-out grey card under white
 *    text. `data-theme="inverse"` makes it actually dark and flips every
 *    token-driven child with it.
 *
 * The wordmark keeps the reference's own `-mt-52 -mb-36` on a tall box: the
 * overlap is absorbed by blank space inside that box, and the card's
 * `overflow-hidden` crops whatever still runs past the rounded edge.
 */

const COLUMN_HEADING = 'text-white text-lg font-semibold mb-6';
const COLUMN_LINK =
  'text-text-muted hover:text-accent-blue duration-fast ease-out-brand transition-colors';

function Pending({ what }: { what: string }) {
  return <p className="text-small text-text-subtle italic">{what} to be added</p>;
}

export function Footer() {
  const quickLinks = footerRoutes('quickLinks');

  return (
    <footer
      data-theme="inverse"
      className="bg-bg relative isolate m-8 mt-auto h-fit overflow-hidden rounded-3xl"
    >
      {/* Behind everything: the reference's radial wash. */}
      <div aria-hidden="true" className="bg-footer-glow absolute inset-0 z-0" />

      <div className="max-w-content tablet:p-14 relative z-40 mx-auto p-8">
        <div className="tablet:grid-cols-2 tablet:gap-8 desktop:grid-cols-4 desktop:gap-16 grid grid-cols-1 gap-12 pb-12">
          {/* Brand */}
          <div className="flex flex-col space-y-4">
            {/* `self-start` matters: in a stretched flex column the SVG fills
                the column's width and `preserveAspectRatio` then centres the
                artwork inside it, so the mark drifts to the middle of the
                column instead of sitting at its left edge. */}
            <ForeseMark className="h-10 w-auto self-start" />
            <p className="text-small text-text-muted leading-relaxed">{SITE.description}</p>
          </div>

          {/* Quick links — from the route table, not a hand-kept list. */}
          <nav aria-label="Quick links">
            <h2 className={COLUMN_HEADING}>Quick links</h2>
            <ul className="space-y-3">
              {quickLinks.map((route) => (
                <li key={route.path}>
                  <NavLink to={route.path} className={COLUMN_LINK}>
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className={COLUMN_HEADING}>Contact Us</h2>
            {CONTACT.email || CONTACT.phone ? (
              <ul className="space-y-4">
                {CONTACT.email && (
                  <li className="flex items-center space-x-3">
                    <Mail size={18} className="text-accent-blue shrink-0" aria-hidden="true" />
                    <a href={`mailto:${CONTACT.email}`} className={COLUMN_LINK}>
                      {CONTACT.email}
                    </a>
                  </li>
                )}
                {CONTACT.phone && (
                  <li className="flex items-center space-x-3">
                    <Phone size={18} className="text-accent-blue shrink-0" aria-hidden="true" />
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className={COLUMN_LINK}>
                      {CONTACT.phone}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <Pending what="Contact details" />
            )}
          </div>

          {/* Location */}
          <div>
            <h2 className={COLUMN_HEADING}>Location</h2>
            {LOCATION.length > 0 ? (
              <address className="flex space-x-3 not-italic">
                <MapPin size={18} className="text-accent-blue mt-1 shrink-0" aria-hidden="true" />
                <span className="text-small text-text-muted">
                  {LOCATION.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </address>
            ) : (
              <Pending what="Address" />
            )}
          </div>
        </div>

        <hr className="border-border my-8 border-t" />

        <div className="text-small tablet:flex-row tablet:space-y-0 flex flex-col items-center justify-between space-y-4">
          {SOCIAL_LINKS.length > 0 && (
            <ul className="text-text-muted flex space-x-6">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="hover:text-accent-blue duration-fast ease-out-brand block transition-colors"
                  >
                    <SocialIcon name={social.icon} />
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className="text-text-muted tablet:text-left text-center">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>

      {/* The oversized wordmark, bleeding past the card's bottom edge. Desktop
          only — it needs width to read and a cursor to reveal it. */}
      <div className="desktop:flex -mt-52 -mb-28 hidden h-[30rem]">
        <HoverWordmark text={SITE.name} className="z-50" />
      </div>
    </footer>
  );
}
