import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface Tilt3DProps {
  children: ReactNode;
  /** Maximum rotation in degrees at the corners. */
  max?: number;
  /** How far the viewer is from the plane. Lower is a stronger effect. */
  perspective?: number;
  /** Lifts the card towards the viewer on hover. */
  liftZ?: number;
  className?: string;
}

/**
 * Tilts its children in 3D towards the pointer.
 *
 * The card rotates around its own centre by a few degrees, so the corner
 * nearest the cursor comes forward. Small numbers matter here: past about
 * eight degrees a rectangle stops reading as a card lying under glass and
 * starts reading as a page bug.
 *
 * Pointer position is held in motion values and never in React state. A tilt
 * driven by `setState` re-renders on every mouse move — sixty times a second,
 * for every card under the cursor — which is exactly the workload that makes
 * a page feel worse for having been animated.
 *
 * Off entirely without a fine pointer: there is nothing to track on a
 * touchscreen, and off under `prefers-reduced-motion`.
 */
export function Tilt3D({
  children,
  max = 6,
  perspective = 1100,
  liftZ = 30,
  className,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasPointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const enabled = hasPointer && !prefersReducedMotion;

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const pz = useMotionValue(0);

  const spring = { stiffness: 220, damping: 26, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const z = useSpring(pz, spring);

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <div style={{ perspective }} className={cn('[transform-style:preserve-3d]', className)}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, z, transformStyle: 'preserve-3d' }}
        onPointerMove={(event) => {
          const rect = ref.current?.getBoundingClientRect();
          if (!rect) return;
          px.set((event.clientX - rect.left) / rect.width - 0.5);
          py.set((event.clientY - rect.top) / rect.height - 0.5);
        }}
        onPointerEnter={() => pz.set(liftZ)}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
          pz.set(0);
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
