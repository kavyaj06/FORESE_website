import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface ContactLinkProps {
  href: string;
  icon: LucideIcon;
  /** The service's own colour, taken by the icon on hover. */
  brand: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A footer contact row — icon and text together — that pops on hover.
 *
 * The icon used to sit outside the link as decoration, so the address and the
 * email were the only targets and the mark beside them did nothing. It is
 * inside the anchor now: one link, one target, and the icon is part of what
 * you are pointing at rather than a picture next to it. One link rather than
 * two to the same place, which would read as two destinations to anything
 * announcing the page.
 *
 * The text no longer turns blue. A colour change on a line of body text says
 * "this is a link" — which the reader already knows, since they are hovering
 * it — and on a long address it repaints three lines at once for no
 * information. The row lifts and grows slightly instead: the same spring the
 * social icons use, so every hoverable thing in this footer answers the same
 * way.
 *
 * Colour is kept for the icon, where it means something. These are Gmail's and
 * Google Maps' own reds, not the site's palette — the same argument as the
 * social icons' brand colours, and the reason both live in component files
 * rather than in `theme.css`: they are not decisions the club gets to make.
 *
 * `origin-left` because the row grows from where it starts. Scaling from the
 * centre would slide the first character leftward, and text that shifts under
 * the cursor reads as a layout bug rather than as a response.
 *
 * Under reduced motion nothing scales or lifts and the icon still takes its
 * colour: the colour is the part that carries meaning, and none of it moves.
 */
export function ContactLink({
  href,
  icon: Icon,
  brand,
  external,
  className,
  children,
}: ContactLinkProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      initial={false}
      whileHover="active"
      whileFocus="active"
      variants={{ active: prefersReducedMotion ? {} : { scale: 1.04, y: -2 } }}
      transition={{ type: 'spring', stiffness: 480, damping: 17 }}
      className={cn('text-text-muted flex origin-left items-start space-x-3', className)}
    >
      <motion.span
        aria-hidden="true"
        className="text-accent-blue mt-0.5 shrink-0"
        variants={{ active: { color: brand } }}
        transition={{ duration: 0.18 }}
      >
        <Icon size={18} />
      </motion.span>
      <span>{children}</span>
    </motion.a>
  );
}
