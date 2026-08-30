'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type HoverWordmarkProps = {
  text: string;
  className?: string;
};

export function HoverWordmark({
  text,
  className,
}: HoverWordmarkProps) {
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
      className={`select-none overflow-visible ${className ?? ''}`}
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
            COLORFUL HOVER GRADIENT
        ------------------------------------------------- */}
        <linearGradient
          id="foreseTextGradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="1000"
          y2="300"
        >
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#80eeb4" />
          <stop offset="75%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* -------------------------------------------------
            CURSOR RADIAL REVEAL
        ------------------------------------------------- */}
        <motion.radialGradient
          id="foreseRevealGradient"
          gradientUnits="userSpaceOnUse"
          r="115"
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
          <rect
            x="0"
            y="0"
            width="1000"
            height="300"
            fill="url(#foreseRevealGradient)"
          />
        </mask>
      </defs>

      {/* =================================================
          LAYER 1
          Permanent subtle blue outline
      ================================================= */}
      <text
        x="500"
        y="205"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="transparent"
        stroke="#3ca2fa"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
        opacity="0.8"
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
        stroke="#3ca2fa"
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