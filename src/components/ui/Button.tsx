import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label. Decorative — give the button real text. */
  iconLeft?: ReactNode;
  /** Icon rendered after the label, e.g. an arrow on a call to action. */
  iconRight?: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Internal route — renders a react-router <Link>. */
    to?: never;
    /** External URL — renders an <a>. */
    href?: never;
  };

type InternalLinkProps = BaseProps & { to: string; href?: never };
type ExternalLinkProps = BaseProps & { href: string; to?: never };

type Props = ButtonProps | InternalLinkProps | ExternalLinkProps;

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary:
    'bg-surface-raised text-text border border-border hover:border-border-strong hover:bg-surface',
  ghost: 'text-text hover:bg-surface',
};

const SIZES: Record<ButtonSize, string> = {
  // min-h keeps every button at or above the 44px touch target on mobile.
  sm: 'min-h-9 gap-1.5 px-3 text-small',
  md: 'min-h-11 gap-2 px-5 text-label',
  lg: 'min-h-12 gap-2 px-6 text-body',
};

const BASE =
  'inline-flex items-center justify-center rounded-pill font-medium ' +
  'transition-[background-color,border-color,color,transform] duration-fast ease-out-brand ' +
  // A button that does not visibly respond to being pressed feels broken on
  // touch, where there is no hover state to confirm the hit.
  'active:scale-[0.97] ' +
  'disabled:pointer-events-none disabled:opacity-50';

/**
 * The one button in the system.
 *
 * Renders a `<button>`, a router `<Link>`, or an `<a>` depending on which of
 * `to` / `href` is passed — so a link that looks like a button is still a link,
 * and keyboard and middle-click behaviour stay correct.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  className,
  ...rest
}: Props) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  const content = (
    <>
      {iconLeft}
      {children}
      {iconRight}
    </>
  );

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest as InternalLinkProps;
    return (
      <Link to={to} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as ExternalLinkProps;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...anchorRest}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
