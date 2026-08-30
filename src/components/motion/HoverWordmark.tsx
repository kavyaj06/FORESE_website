import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { EASE_OUT_BRAND } from './variants';
import { cn } from '@/lib/cn';

interface HoverWordmarkProps {
  text: string;
  className?: string;
}

/**
 * A giant outlined wordmark that fills in solid where the cursor passes over
 * it, with a one-time stroke draw-in when it scrolls into view.
 *
 * Adapted from a third-party footer component. Two things about the source
 * were wrong for here and are rebuilt rather than copied:
 *
 *  - The cursor-follow held pointer position in React state and re-rendered
 *    the component on every `mousemove` — sixty-plus renders a second while
 *    the pointer is anywhere near the footer. Position now lives in motion
 *    values; the radial gradient's `cx`/`cy` take those values directly as
 *    props (framer-motion animates SVG geometry attributes this way without
 *    touching React state), so a hover here costs nothing but a paint.
 *  - The reveal was a five-stop rainbow. This site has no second colour by
 *    design, so the reveal is a spotlight from a faint outline to the site's
 *    own solid text colour — the same "outline resolving to solid" move the
 *    gallery scrim and the member cards already use, not a new one.
 *
 * Decorative: the name is already announced by the real wordmark elsewhere on
 * the page, so this is `aria-hidden` rather than a second landmark.
 */
export function HoverWordmark({ text, className }: HoverWordmarkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drawRef = useRef<SVGTextElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasPointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const drawIn = useInView(drawRef, { once: true, amount: 0.6 });

  // Percentage strings, as the radialGradient's cx/cy expect. Held as motion
  // values so pointer movement never touches React state.
  const rawCx = useMotionValue('50%');
  const rawCy = useMotionValue('50%');
  const spring = { stiffness: 200, damping: 28, mass: 0.7 };
  const cx = useSpring(rawCx, spring);
  const cy = useSpring(rawCy, spring);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      viewBox="0 0 1000 220"
      xmlns="http://www.w3.org/2000/svg"
      onPointerMove={(event) => {
        if (!hasPointer) return;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        rawCx.set(`${((event.clientX - rect.left) / rect.width) * 100}%`);
        rawCy.set(`${((event.clientY - rect.top) / rect.height) * 100}%`);
      }}
      className={cn('select-none', className)}
    >
      <defs>
        <motion.radialGradient
          id="wordmark-reveal"
          gradientUnits="userSpaceOnUse"
          r="18%"
          cx={cx}
          cy={cy}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="wordmark-mask">
          <rect width="100%" height="100%" fill="url(#wordmark-reveal)" />
        </mask>
      </defs>

      {/* Draw-in outline: plays once as the wordmark enters the viewport.
          Under reduced motion it appears complete immediately rather than
          animating. */}
      <motion.text
        ref={drawRef}
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1"
        className="font-display stroke-border-strong fill-transparent text-[10rem] font-bold uppercase"
        initial={prefersReducedMotion ? false : { strokeDashoffset: 3000, strokeDasharray: 3000 }}
        animate={
          drawIn && !prefersReducedMotion
            ? { strokeDashoffset: 0, strokeDasharray: 3000 }
            : prefersReducedMotion
              ? undefined
              : {}
        }
        transition={{ duration: 2.6, ease: EASE_OUT_BRAND }}
      >
        {text}
      </motion.text>

      {/* The spotlight: solid text colour, visible only inside the reveal
          circle that follows the cursor. */}
      {hasPointer && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          mask="url(#wordmark-mask)"
          className="font-display fill-text text-[10rem] font-bold uppercase"
        >
          {text}
        </text>
      )}
    </svg>
  );
}
