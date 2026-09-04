import { motion } from 'framer-motion';
import { SocialIcon, type SocialIconName } from '@/components/ui/SocialIcon';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { SocialLink } from '@/data/site';

/**
 * Each platform's own brand colour, for the hover state only.
 *
 * These live here rather than in `theme.css` on purpose, and it is the one
 * place on the site where that is the right call. Every other colour in the
 * app is a design decision the club owns and may want to change, which is why
 * it belongs to a token. These are not: they are Instagram's and LinkedIn's,
 * fixed by someone else, and meaningful only as "the colour that platform
 * actually is". Tokenising them would invite a future edit to re-tint them to
 * match the site, which would defeat the entire point of showing them.
 *
 * Instagram has no single flat brand colour — its mark is a gradient — so this
 * is the mid-magenta from it, which is what reads as "Instagram" at 18px.
 */
const BRAND: Partial<Record<SocialIconName, string>> = {
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  github: '#FFFFFF',
  youtube: '#FF0000',
  mail: undefined,
};

/**
 * A footer social link whose icon takes on its platform's real colour and pops
 * slightly on hover.
 *
 * The pop is a spring rather than a duration, and it overshoots a little: at
 * 18px a linear scale to 1.2 is too small a change to register as a response,
 * where a spring that passes its target and settles reads as the icon
 * reacting to the cursor. The lift is the same gesture pointed upward.
 *
 * Colour is animated separately and faster than the scale. Colour is the part
 * that carries the recognition — the whole point is that you see *which*
 * platform — so it should not still be arriving after the movement has
 * finished.
 *
 * Focus is treated exactly like hover, so a keyboard user gets the same
 * feedback rather than only the focus ring. Under reduced motion neither the
 * scale nor the lift is applied, but the colour change still is — it is
 * information, not decoration, and nothing about it moves.
 */
export function SocialLinkIcon({ social }: { social: SocialLink }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const brand = BRAND[social.icon];

  const active = {
    color: brand,
    ...(prefersReducedMotion ? {} : { scale: 1.2, y: -2 }),
  };

  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className="text-text-muted block"
      initial={false}
      whileHover={active}
      whileFocus={active}
      transition={{
        color: { duration: 0.18 },
        default: { type: 'spring', stiffness: 480, damping: 17 },
      }}
    >
      <SocialIcon name={social.icon} />
    </motion.a>
  );
}
