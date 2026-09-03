'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type HoverWordmarkProps = {
  text: string;
  className?: string;
};

export function HoverWordmark({ text, className }: HoverWordmarkProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const [cursor, setCursor] = useState({
    x: 0,
    y: 0,
  });

  const [hovered, setHovered] = useState(false);

  const [maskPosition, setMaskPosition] = useState({
    cx: '50%',
    cy: '50%',
  });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    const cx = ((cursor.x - rect.left) / rect.width) * 100;
    const cy = ((cursor.y - rect.top) / rect.height) * 100;

    setMaskPosition({
      cx: `${Math.max(0, Math.min(100, cx))}%`,
      cy: `${Math.max(0, Math.min(100, cy))}%`,
    });
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1000 300"
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible uppercase select-none ${className ?? ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(event) => {
        setCursor({
          x: event.clientX,
          y: event.clientY,
        });
      }}
      aria-hidden="true"
    >
      <defs>
        {/* -------------------------------------------------
            BRAND RAMP, revealed under the cursor.
            The stops are the tokens, not literals: this file used to carry a
            five-colour rainbow — yellow, red, mint, cyan, violet — which was
            the reference's palette and never ours. Reading the variables means
            the wordmark re-tints itself when the brand does.
        ------------------------------------------------- */}
        <linearGradient
          id="foreseTextGradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="1000"
          y2="300"
        >
          <stop offset="0%" stopColor="var(--color-brand-crimson)" />
          <stop offset="30%" stopColor="var(--color-brand-red)" />
          <stop offset="58%" stopColor="var(--color-brand-flame)" />
          <stop offset="78%" stopColor="var(--color-brand-amber)" />
          <stop offset="100%" stopColor="var(--color-brand-mist)" />
        </linearGradient>

        {/* -------------------------------------------------
            CURSOR RADIAL REVEAL
        ------------------------------------------------- */}
        <motion.radialGradient
          id="foreseRevealGradient"
          gradientUnits="userSpaceOnUse"
          r="260"
          initial={{
            cx: '50%',
            cy: '50%',
          }}
          animate={maskPosition}
          transition={{
            duration: 0.18,
            ease: 'easeOut',
          }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="55%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="foreseTextMask">
          <rect x="0" y="0" width="1000" height="300" fill="url(#foreseRevealGradient)" />
        </mask>
      </defs>

      {/* =================================================
          LAYER 1
          Permanent outline, in the footer's own accent
      ================================================= */}
      <text
        x="500"
        y="205"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="transparent"
        stroke="var(--color-accent)"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
        // 0.45, not the 0.8 this was: the accent is a hot flame rather than
        // the soft blue it replaced, and at 0.8 a wordmark this size stopped
        // being a watermark and started being the loudest thing on the page.
        opacity="0.45"
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '185px',
          fontWeight: 700,
          letterSpacing: '2px',
        }}
      >
        {text}
      </text>

      {/* =================================================
          LAYER 2
          BLUE STROKE DRAWING ANIMATION
      ================================================= */}
      <motion.text
        x="500"
        y="205"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="transparent"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        pathLength={1000}
        initial={{
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
        }}
        animate={{
          strokeDasharray: 1000,
          strokeDashoffset: 0,
        }}
        transition={{
          duration: 4,
          ease: 'easeInOut',
        }}
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '185px',
          fontWeight: 700,
          letterSpacing: '2px',
        }}
      >
        {text}
      </motion.text>

      {/* =================================================
          LAYER 3
          COLORFUL CURSOR REVEAL
      ================================================= */}
      <text
        x="500"
        y="205"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="transparent"
        stroke="url(#foreseTextGradient)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        mask="url(#foreseTextMask)"
        opacity={hovered ? 1 : 0}
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: '185px',
          fontWeight: 700,
          letterSpacing: '2px',
          transition: 'opacity 180ms ease',
        }}
      >
        {text}
      </text>
    </svg>
  );
}
