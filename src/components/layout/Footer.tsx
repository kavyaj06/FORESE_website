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
 * unchanged. What the reference supplies is the *shell*, and this version
 * takes it from the reference's own markup rather than from a screenshot of
 * it — so the numbers are its numbers:
 *
 *   - the page is `px-[5vw] pb-[5vw]` with a deep top pad (`pt-25`, doubling
 *     at the tablet breakpoint) to leave the wordmark its room;
 *   - the card is `max-w-[80rem]`, `rounded-lg`, `px-5 py-7` growing to
 *     `p-9 py-8`, on `--color-wf-card`;
 *   - the lead column is 360px wide, the link columns sit 60px to its right
 *     with 76px between them, each heading uppercase with a 24px gap to its
 *     list and 16px between rows;
 *   - the wordmark is centred at the card's top edge and translated up 83% of
 *     its own height, in `--color-wf-dot`, so a fifth of it is behind the card;
 *   - the rule above the last row is `--color-wf-dot`, 32px above and 24px
 *     below on a phone, 36 and 20 on a desktop;
 *   - every link is `--color-wf-button` and goes white over 200ms.
 *
 * The wordmark is static and behind the panel now, where it used to be a
 * cursor-revealed one bleeding off the bottom edge. That also retired the
 * `<radialGradient> attribute cx: NaN%` error which had been firing on every
 * page of the site — `HoverWordmark` was its source, and the footer was its
 * only caller.
 */

/** Uppercase, white, 24px clear of its list — the reference's own heading. */
const COLUMN_HEADING = 'text-small text-white uppercase mb-6';

/**
 * Gmail's and Google Maps' own reds, for the contact icons on hover.
 *
 * Same reasoning as the social icons' brand colours, and the same reason they
 * are not tokens: they are not the club's to choose. Both marks happen to be
 * the same red, which is Google's, not a copy-paste.
 */
const GMAIL_RED = '#EA4335';
const MAPS_RED = '#EA4335';
/** Grey, white on hover, over 200ms — the reference's own link. */
const COLUMN_LINK = 'text-small text-wf-button hover:text-white transition-colors duration-200';

function Pending({ what }: { what: string }) {
  return <p className="text-small text-text-subtle italic">{what} to be added</p>;
}

export function Footer() {
  const quickLinks = footerRoutes('quickLinks');

  return (
    <footer data-theme="inverse" className="bg-bg relative isolate mt-auto overflow-hidden">
      <DotField />

      <div className="tablet:pt-50 desktop:pt-60 relative flex w-full flex-col items-center px-[5vw] pt-25 pb-[5vw]">
        <div className="relative flex w-full max-w-[80rem] flex-col items-center">
          {/* The wordmark above the card: the club's name set as type, not the
              logo lockup. The lockup carries the mark and the name together
              and is nearly square, so at the reference's scale — 80% of the
              card's width — it stood taller than the card itself. The name
              alone is the shape the reference actually has there: one long,
              low line of letters with the card overlapping its feet.

              Sized in `vw` against a ceiling so it holds the same share of the
              card at every width — measured at 80% of it from 390 to 1920,
              which is where the reference sets its own — and pulled up so the
              card covers the last fifth of it. The mark itself still opens the brand column inside
              the card, where it has room to be read. */}
          <div aria-hidden="true" className="absolute top-0 left-0 z-10 w-full">
            <div className="relative -translate-y-[108%]">
              <div className="bg-wf-glow absolute inset-x-1/4 top-1/5 h-3/5" />
              <p className="font-display text-wf-dot relative text-center text-[clamp(3.5rem,19vw,17rem)] leading-[0.78] font-bold tracking-tight select-none">
                {SITE.name.toUpperCase()}
              </p>
            </div>
          </div>

          <div // `rounded-md` is 10px here, against the reference's 8px: this repo's
            // radius scale has no 8, and 10 is its nearest step. `rounded-lg`
            // is 16px on this site and read visibly softer than the reference.
            className="bg-wf-card desktop:p-9 desktop:py-8 relative z-20 flex w-full flex-col rounded-md px-5 py-7"
          >
            <div className="desktop:flex-row flex flex-col">
              {/* Brand — the reference's lead column, 360px wide on a desktop. */}
              <div className="desktop:w-90 flex shrink-0 flex-col space-y-4">
                {/* `self-start` matters: in a stretched flex column the SVG fills
                the column's width and `preserveAspectRatio` then centres the
                artwork inside it, so the mark drifts to the middle of the
                column instead of sitting at its left edge. */}
                <ForeseMark className="h-10 w-auto self-start" />
                <p className="text-small text-text-muted leading-relaxed">{SITE.description}</p>
              </div>

              {/* The three link columns, at the reference's own offsets: 60px
                  clear of the lead column, 76px between one another. */}
              <div className="desktop:mt-5 desktop:mr-4 desktop:ml-15 desktop:flex-row desktop:gap-19 mt-14 flex flex-1 flex-col justify-center gap-9">
                {/* Quick links — from the route table, not a hand-kept list. */}
                <nav aria-label="Quick links">
                  <h2 className={COLUMN_HEADING}>Quick links</h2>
                  <ul className="space-y-4">
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
                          <ContactLink
                            href={`mailto:${CONTACT.email}`}
                            icon={Mail}
                            brand={GMAIL_RED}
                          >
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
            </div>

            {/* The rule and the last row, at the reference's spacing: 32px
                above and 24px below on a phone, 36 and 20 on a desktop. */}
            <div className="border-wf-dot desktop:mt-9 desktop:pt-5 mt-8 border-t pt-6">
              <div className="text-small desktop:flex-row desktop:items-center desktop:gap-6 flex flex-col justify-between gap-4">
                {SOCIAL_LINKS.length > 0 && (
                  <ul className="text-wf-button flex space-x-6">
                    {SOCIAL_LINKS.map((social) => (
                      <li key={social.label}>
                        <SocialLinkIcon social={social} />
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-wf-button">
                  {/* The wordmark is set in caps in the artwork, so the copyright
                  line matches it rather than the sentence-case `SITE.name` used
                  for document titles. */}
                  © {new Date().getFullYear()} {SITE.name.toUpperCase()}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
