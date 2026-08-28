/**
 * Barrel export for UI primitives.
 *
 * Lets pages write `import { Button, Card } from '@/components/ui'` instead of
 * a stack of individual paths. Only tier-1 primitives belong here — layout and
 * section components are imported directly, so the dependency direction stays
 * visible at the call site.
 */

export { Badge } from './Badge';
export { Button } from './Button';
export { Card } from './Card';
export { Modal } from './Modal';
export { Skeleton } from './Skeleton';
export { SocialIcon, type SocialIconName } from './SocialIcon';
