import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * The constellation starfield inside a page hero.
 *
 * Mounted inside each hero container — never on the body or a fixed layer —
 * so it is `position: absolute; inset: 0` and clipped by the hero's own
 * `overflow-hidden`. It ends exactly at the hero's bottom border because it
 * cannot paint outside its parent.
 *
 * Three layers, deliberately unlike a particle network:
 *
 *   1. A field of isolated stars — the sky.
 *   2. A handful of predefined constellation figures — fixed shapes of 4–8
 *      stars joined by thin lines, placed at random spots. They hold their
 *      formation; only the whole figure drifts, slowly.
 *   3. Occasional shooting stars with short fading trails.
 *
 * On top of that sits the pointer layer: stars lean gently toward the cursor,
 * brighten and swell as it approaches, constellation lines sharpen near it,
 * and a click sends a small ripple through the field. Every offset is
 * computed per frame from the star's anchor position — nothing accumulates —
 * so the whole sky settles back to exactly where it started when the pointer
 * leaves.
 *
 * Monochrome by design: white and light-grey stars on the hero's black,
 * lines at 12–22% white. No colour, no glow.
 */

const STAR_WHITE = '255, 255, 255';
const STAR_GREY = '191, 191, 191';

/** Field density: roughly one star per this many square pixels, clamped so a
    large monitor gets a proper sky and a phone still gets hundreds of stars
    across the whole field rather than a sparse handful. */
const PIXELS_PER_STAR = 5200;
const MIN_STARS = 120;
const MAX_STARS = 420;

/** Constellation figures per hero, scaled by area. */
const MIN_CONSTELLATIONS = 2;
const MAX_CONSTELLATIONS = 5;
const PIXELS_PER_CONSTELLATION = 260000;

/** Lines stay inside this alpha band — present, never loud. */
const LINE_ALPHA_MIN = 0.12;
const LINE_ALPHA_MAX = 0.22;

/* ------------------------------------------------------------------ *
 * Pointer interaction constants
 * ------------------------------------------------------------------ */

/** How far the cursor's influence reaches, in px. */
const POINTER_RADIUS = 150;
/** Maximum displacement a star is pulled toward the cursor, in px. */
const POINTER_PULL = 16;
/** Extra brightness a star gains at the cursor's centre, as a fraction. */
const POINTER_BRIGHTEN = 0.55;
/** How much bigger a star gets at the cursor's centre, as a fraction. */
const POINTER_SWELL = 0.5;
/** How much brighter a constellation line gets near the cursor. */
const LINE_BOOST = 1.4;
/** Pointer smoothing per frame — lower is dreamier, higher is tighter. */
const POINTER_LERP = 0.14;
/** Influence fade when the pointer leaves, per frame. */
const INFLUENCE_DECAY = 0.94;

/** Click ripple: how far it travels, how hard it pushes, how long it lives. */
const RIPPLE_SPEED = 620; // px per second
const RIPPLE_PUSH = 22; // px of outward displacement at the ring's peak
const RIPPLE_LIFE = 0.9; // seconds
const RIPPLE_WIDTH = 90; // px — how soft the ring's edge is
const MAX_RIPPLES = 3;

interface Star {
  /** Resting position — the anchor every frame returns to. */
  x: number;
  y: number;
  /** Slow sinusoidal wander, so the sky breathes without travelling. */
  ax: number;
  ay: number;
  wx: number;
  wy: number;
  px: number;
  py: number;
  radius: number;
  /** 0–1 mix between white and grey ink. */
  grey: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Constellation {
  /** Member stars, already placed and rotated into hero space. */
  stars: Star[];
  /** Index pairs into `stars` to join. */
  edges: [number, number][];
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds of life remaining / total, for the fade. */
  life: number;
  maxLife: number;
}

/** The cursor, in canvas coordinates, plus a smoothed copy for damping. */
interface PointerState {
  x: number;
  y: number;
  sx: number;
  sy: number;
  /** Whether the pointer is currently over the hero. */
  inside: boolean;
  /** 0–1: ramps up on enter, decays on leave so nothing snaps. */
  influence: number;
}

interface Ripple {
  x: number;
  y: number;
  /** Seconds since the click, in the animation clock. */
  age: number;
}

/**
 * The figures, as normalized point sets (0–1 across the figure's own box)
 * plus the index pairs to join. Hand-drawn recognisable shapes — a kite, an
 * arrow, a chevron row, a cross, a boat — each 5–7 stars, so a hero shows
 * two to five distinct constellations rather than one repeated stamp.
 */
const PATTERNS: { points: [number, number][]; edges: [number, number][] }[] = [
  {
    // Kite: diamond with a tail.
    points: [
      [0.5, 0.08],
      [0.85, 0.42],
      [0.5, 0.78],
      [0.15, 0.42],
      [0.5, 0.95],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
    ],
  },
  {
    // Arrow: shaft, head and fletching.
    points: [
      [0.08, 0.5],
      [0.42, 0.5],
      [0.68, 0.28],
      [0.68, 0.72],
      [0.9, 0.5],
      [0.42, 0.28],
      [0.42, 0.72],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
      [1, 5],
      [1, 6],
    ],
  },
  {
    // Chevron row: the classic "W"-ish skyline.
    points: [
      [0.08, 0.32],
      [0.28, 0.72],
      [0.5, 0.32],
      [0.72, 0.72],
      [0.92, 0.32],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    // Cross: centre star with four arms.
    points: [
      [0.5, 0.06],
      [0.5, 0.94],
      [0.06, 0.5],
      [0.94, 0.5],
      [0.5, 0.5],
    ],
    edges: [
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
    ],
  },
  {
    // Boat: hull with a mast.
    points: [
      [0.12, 0.58],
      [0.34, 0.76],
      [0.66, 0.76],
      [0.88, 0.58],
      [0.5, 0.3],
      [0.5, 0.76],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [4, 2],
    ],
  },
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeStar(x: number, y: number, wander: number): Star {
  return {
    x,
    y,
    ax: rand(0.4, wander),
    ay: rand(0.4, wander),
    wx: rand(0.05, 0.16),
    wy: rand(0.05, 0.16),
    px: rand(0, Math.PI * 2),
    py: rand(0, Math.PI * 2),
    radius: rand(0.6, 1.5),
    grey: Math.random() < 0.3 ? 1 : 0,
    baseAlpha: rand(0.45, 0.9),
    twinkleSpeed: rand(0.4, 1.4),
    twinklePhase: rand(0, Math.PI * 2),
  };
}

/**
 * Where a star actually is this frame.
 *
 * Three additive offsets, all computed from the anchor — nothing is ever
 * written back, so the formation cannot drift permanently:
 *
 *   wander  — the star's own slow sinusoidal drift (the sky breathing).
 *   pointer — a gentle pull toward the smoothed cursor inside POINTER_RADIUS,
 *             plus a brightness/size boost returned alongside the position.
 *   ripple  — an expanding ring of outward push after a click.
 */
function starAt(
  star: Star,
  time: number,
  pointer: PointerState,
  ripples: Ripple[],
): { x: number; y: number; boost: number } {
  let x = star.x + star.ax * Math.sin(time * star.wx + star.px);
  let y = star.y + star.ay * Math.cos(time * star.wy + star.py);
  let boost = 0;

  if (pointer.influence > 0.001) {
    const dx = pointer.sx - x;
    const dy = pointer.sy - y;
    const dist = Math.hypot(dx, dy);
    if (dist < POINTER_RADIUS && dist > 0.001) {
      // Quadratic falloff: strongest at the cursor, gone at the radius edge.
      const f = 1 - dist / POINTER_RADIUS;
      const pull = f * f * POINTER_PULL * pointer.influence;
      x += (dx / dist) * pull;
      y += (dy / dist) * pull;
      boost = f * f * pointer.influence;
    }
  }

  for (const ripple of ripples) {
    const ring = ripple.age * RIPPLE_SPEED;
    const dx = x - ripple.x;
    const dy = y - ripple.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.001) continue;
    // A Gaussian band around the expanding ring: stars far inside or outside
    // it barely feel it, stars caught by the wave push outward and settle.
    const band = Math.exp(-(((dist - ring) / RIPPLE_WIDTH) ** 2));
    const strength = RIPPLE_PUSH * band * (1 - ripple.age / RIPPLE_LIFE);
    if (strength > 0.05) {
      x += (dx / dist) * strength;
      y += (dy / dist) * strength;
    }
  }

  return { x, y, boost };
}

function fieldStars(width: number, height: number): Star[] {
  const count = Math.min(
    MAX_STARS,
    Math.max(MIN_STARS, Math.round((width * height) / PIXELS_PER_STAR)),
  );
  return Array.from({ length: count }, () =>
    makeStar(rand(0, width), rand(0, height), 2.2),
  );
}

/**
 * Place the figures. Each gets a random pattern, a random scale and a random
 * rotation, kept inside the hero with a margin so no figure is sliced by the
 * edge. Constellation members share the figure's wander parameters, so the
 * shape holds together while the whole thing drifts — and the pointer still
 * distorts it locally, which is the point.
 */
function constellations(width: number, height: number): Constellation[] {
  const count = Math.min(
    MAX_CONSTELLATIONS,
    Math.max(MIN_CONSTELLATIONS, Math.round((width * height) / PIXELS_PER_CONSTELLATION)),
  );

  const figures: Constellation[] = [];
  for (let i = 0; i < count; i += 1) {
    const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    const scale = rand(110, Math.min(240, width * 0.28));
    const rotation = rand(0, Math.PI * 2);
    const margin = scale * 0.75;
    const cx = rand(margin, Math.max(margin + 1, width - margin));
    const cy = rand(margin, Math.max(margin + 1, height - margin));
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // Figure-space centre is (0.5, 0.5); rotate each point around it, scale,
    // then translate to the chosen spot.
    const stars = pattern.points.map(([px, py]) => {
      const dx = px - 0.5;
      const dy = py - 0.5;
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      return makeStar(cx + rx * scale, cy + ry * scale, 1.4);
    });

    // Every member gets the same wander parameters — copy the first star's —
    // so the figure translates as one piece.
    const leader = stars[0];
    for (const star of stars) {
      star.ax = leader.ax;
      star.ay = leader.ay;
      star.wx = leader.wx;
      star.wy = leader.wy;
      star.px = leader.px;
      star.py = leader.py;
    }

    figures.push({ stars, edges: pattern.edges });
  }
  return figures;
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  time: number,
  pointer: PointerState,
  ripples: Ripple[],
) {
  for (const star of stars) {
    const { x, y, boost } = starAt(star, time, pointer, ripples);
    const twinkle = 0.55 + 0.45 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
    const alpha = Math.min(1, star.baseAlpha * twinkle * (1 + boost * POINTER_BRIGHTEN));
    const radius = star.radius * (1 + boost * POINTER_SWELL);
    const ink = star.grey ? STAR_GREY : STAR_WHITE;
    ctx.fillStyle = `rgba(${ink}, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Distance from a point to a segment — used to brighten the line the
    cursor is actually near, not just lines whose midpoint is near. */
function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSq = abx * abx + aby * aby;
  const t =
    lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSq));
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
}

function drawConstellations(
  ctx: CanvasRenderingContext2D,
  figures: Constellation[],
  time: number,
  pointer: PointerState,
  ripples: Ripple[],
) {
  for (const figure of figures) {
    for (const [a, b] of figure.edges) {
      const sa = starAt(figure.stars[a], time, pointer, ripples);
      const sb = starAt(figure.stars[b], time, pointer, ripples);

      // Base alpha varies deterministically per edge; the cursor adds a
      // proximity boost measured against the segment itself.
      const base =
        LINE_ALPHA_MIN + (((a * 7 + b * 13) % 10) / 10) * (LINE_ALPHA_MAX - LINE_ALPHA_MIN);
      let alpha = base;
      if (pointer.influence > 0.001) {
        const d = distToSegment(pointer.sx, pointer.sy, sa.x, sa.y, sb.x, sb.y);
        const proximity = Math.max(0, 1 - d / (POINTER_RADIUS * 1.4));
        alpha = Math.min(0.6, base * (1 + proximity * proximity * LINE_BOOST * pointer.influence));
      }

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }
  }
}

function spawnMeteor(width: number, height: number): Meteor {
  // Streaks travel down and to one side, the way real ones do.
  const direction = Math.random() < 0.5 ? 1 : -1;
  const speed = rand(420, 700);
  const angle = rand(0.5, 0.9); // radians below horizontal
  return {
    x: rand(width * 0.15, width * 0.85),
    y: rand(height * 0.05, height * 0.4),
    vx: direction * Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: rand(0.6, 1.0),
  };
}

function drawMeteor(ctx: CanvasRenderingContext2D, meteor: Meteor) {
  const t = meteor.life / meteor.maxLife;
  const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;

  const hx = meteor.x;
  const hy = meteor.y;
  const tx = meteor.x - meteor.vx * 0.12;
  const ty = meteor.y - meteor.vy * 0.12;

  const gradient = ctx.createLinearGradient(hx, hy, tx, ty);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${(0.7 * fade).toFixed(3)})`);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 255, 255, ${(0.9 * fade).toFixed(3)})`;
  ctx.beginPath();
  ctx.arc(hx, hy, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

export function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pointer: PointerState = { x: 0, y: 0, sx: 0, sy: 0, inside: false, influence: 0 };
    const ripples: Ripple[] = [];

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let figures: Constellation[] = [];
    let meteors: Meteor[] = [];
    let nextMeteorAt = 0;
    let frame = 0;
    let last = 0;
    let running = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = fieldStars(width, height);
      figures = constellations(width, height);
      meteors = [];
      ripples.length = 0;
      if (prefersReducedMotion) {
        drawConstellations(ctx, figures, 0, pointer, ripples);
        drawStars(ctx, stars, 0, pointer, ripples);
        for (const figure of figures) drawStars(ctx, figure.stars, 0, pointer, ripples);
      }
    };

    /* ---------------------------------------------------------------- *
     * Pointer tracking.
     *
     * The canvas is `pointer-events-none`, so events land on the hero
     * itself — listeners go on the parent, exactly like `DotField`. The
     * position is stored in canvas coordinates via the parent's bounding
     * rect, which equals the canvas's because the canvas is inset-0.
     * ---------------------------------------------------------------- */
    const host = canvas.parentElement;

    const toLocal = (event: PointerEvent) => {
      const rect = host?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onMove = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      pointer.x = x;
      pointer.y = y;
      if (!pointer.inside) {
        // First contact: start the smoothed position at the cursor so the
        // field does not swing in from a corner.
        pointer.sx = x;
        pointer.sy = y;
      }
      pointer.inside = true;
    };

    const onLeave = () => {
      pointer.inside = false;
    };

    const onDown = (event: PointerEvent) => {
      // Primary button / touch only — a right-click is not a ripple request.
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const { x, y } = toLocal(event);
      ripples.push({ x, y, age: 0 });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
    };

    if (host) {
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
      host.addEventListener('pointerdown', onDown);
    }

    const tick = (now: number) => {
      if (!running) return;
      const time = now / 1000;
      const dt = last === 0 ? 0.016 : Math.min((now - last) / 1000, 0.1);
      last = now;

      // Damped pointer: the smoothed position chases the real one, and the
      // influence ramps in on enter and decays on leave, so the sky leans
      // toward the cursor and relaxes back rather than snapping.
      pointer.sx += (pointer.x - pointer.sx) * POINTER_LERP;
      pointer.sy += (pointer.y - pointer.sy) * POINTER_LERP;
      pointer.influence = pointer.inside
        ? Math.min(1, pointer.influence + 0.06)
        : pointer.influence * INFLUENCE_DECAY;

      ctx.clearRect(0, 0, width, height);

      // Age and expire ripples before drawing so this frame is consistent.
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        ripples[i].age += dt;
        if (ripples[i].age >= RIPPLE_LIFE) ripples.splice(i, 1);
      }

      // Constellation lines first, then every star on top.
      drawConstellations(ctx, figures, time, pointer, ripples);
      drawStars(ctx, stars, time, pointer, ripples);
      for (const figure of figures) drawStars(ctx, figure.stars, time, pointer, ripples);

      // Shooting stars: spawn on a loose schedule, expire on their own clock.
      if (time * 1000 >= nextMeteorAt && meteors.length < 2) {
        meteors.push(spawnMeteor(width, height));
        nextMeteorAt = time * 1000 + rand(3500, 9000);
      }
      meteors = meteors.filter((m) => {
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.life >= m.maxLife || m.x < -120 || m.x > width + 120 || m.y > height + 120) {
          return false;
        }
        drawMeteor(ctx, m);
        return true;
      });

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || prefersReducedMotion) return;
      running = true;
      last = 0;
      nextMeteorAt = 1200; // first streak arrives promptly, then on schedule
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (host) {
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerleave', onLeave);
        host.removeEventListener('pointerdown', onDown);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // Absolute, not fixed: the canvas can never leave its hero. `inset-0`
      // fills the hero exactly and the hero's `overflow-hidden` clips it.
      // z-index -1 puts it above the hero's own background but below every
      // content element — the heroes are all `isolate`, so the negative index
      // cannot escape behind the page. `pointer-events-none` keeps the hero's
      // links and buttons fully clickable; the pointer listeners live on the
      // hero itself.
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: -1 }}
    />
  );
}
