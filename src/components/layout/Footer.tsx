import { NavLink } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { footerRoutes } from '@/app/routes';
import { CONTACT, LOCATION, LOCATION_URL, SITE, SOCIAL_LINKS } from '@/data/site';
import { ContactLink } from './ContactLink';
import { SocialLinkIcon } from './SocialLinkIcon';
import { DotField } from '@/components/motion/DotField';
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
 * The columns, their content and the social row are the club's own and are
 * unchanged. What the Melius reference supplied is the *shell*: a black dotted
 * page, the wordmark oversized and centred with the panel overlapping its
 * lower half, and the columns inside a rounded card inset from the page edges
 * rather than running full-bleed to them.
 *
 * The wordmark is static and behind the panel now, where it used to be a
 * cursor-revealed one bleeding off the bottom edge. That also retired the
 * `<radialGradient> attribute cx: NaN%` error which had been firing on every
 * page of the site — `HoverWordmark` was its source, and the footer was its
 * only caller.
 */

const COLUMN_HEADING = 'text-white text-lg font-semibold mb-6';

/**
 * Gmail's and Google Maps' own reds, for the contact icons on hover.
 *
 * Same reasoning as the social icons' brand colours, and the same reason they
 * are not tokens: they are not the club's to choose. Both marks happen to be
 * the same red, which is Google's, not a copy-paste.
 */
const GMAIL_RED = '#EA4335';
const MAPS_RED = '#EA4335';
const COLUMN_LINK =
  'text-text-muted hover:text-accent-blue duration-fast ease-out-brand transition-colors';

function Pending({ what }: { what: string }) {
  return <p className="text-small text-text-subtle italic">{what} to be added</p>;
}

export function Footer() {
  const quickLinks = footerRoutes('quickLinks');

  return (
    <footer data-theme="inverse" className="bg-bg relative isolate mt-auto overflow-hidden">
      <DotField />

      {/* The wordmark, behind the panel and overlapped by it, with a soft warm
          wash behind the mark. */}
      <div aria-hidden="true" className="pt-3xl relative flex justify-center">
        <div className="bg-wf-glow absolute inset-x-1/4 top-1/4 h-1/2" />
        <ForeseMark className="text-border desktop:h-44 relative h-24 w-auto" />
      </div>

      <div className="px-gutter max-w-content desktop:-mt-14 relative mx-auto -mt-8 pb-10">
        <div className="bg-surface/80 desktop:p-14 rounded-xl p-8 backdrop-blur-sm">
          <div className="tablet:grid-cols-2 tablet:gap-8 desktop:grid-cols-4 desktop:gap-16 grid grid-cols-1 gap-12 pb-6">
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
                    <li>
                      <ContactLink href={`mailto:${CONTACT.email}`} icon={Mail} brand={GMAIL_RED}>
                        {CONTACT.email}
                      </ContactLink>
                    </li>
                  )}
                  {CONTACT.phone && (
                    <li>
                      <ContactLink
                        href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                        icon={Phone}
                        brand={MAPS_RED}
                      >
                        {CONTACT.phone}
                      </ContactLink>
                    </li>
                  )}
                </ul>
              ) : (
                <Pending what="Contact details" />
              )}
            </div>

            {/* Location */}
            <div>
              <h2 className={COLUMN_HEADING}>Visit us</h2>
              {LOCATION.length > 0 ? (
                <address className="not-italic">
                  {/* The whole address is the link, not a separate "view on
                    map" line beneath it — an address on a site like this is
                    only ever there to be found, so making the text itself the
                    target saves a row and a redundant label. */}
                  <ContactLink
                    href={LOCATION_URL}
                    icon={MapPin}
                    brand={MAPS_RED}
                    external
                    className="text-small"
                  >
                    {LOCATION.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </ContactLink>
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
                    <SocialLinkIcon social={social} />
                  </li>
                ))}
              </ul>
            )}

            <p className="text-text-muted tablet:text-left text-center">
              {/* The wordmark is set in caps in the artwork, so the copyright
                line matches it rather than the sentence-case `SITE.name` used
                for document titles. */}
              © {new Date().getFullYear()} {SITE.name.toUpperCase()}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
