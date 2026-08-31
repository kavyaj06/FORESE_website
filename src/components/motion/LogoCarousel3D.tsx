import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

export interface CarouselLogo {
  /** Company name. Drawn as text when no artwork is supplied, and always the accessible label. */
  name: string;
  /** Path under `public/`. Optional — see the note on the fallback below. */
  src?: string;
}

interface LogoCarousel3DProps {
  logos: CarouselLogo[];
  className?: string;
  /** Height of a logo at full scale, in CSS px. */
  maxHeight?: number;
  /** Horizontal space between logos, in CSS px. */
  gap?: number;
  /** Scale at the edge of the strip, and at its centre. The depth illusion. */
  minScale?: number;
  maxScale?: number;
  /**
   * Peak blur in px, and how far from the centre it takes to reach that peak,
   * as a fraction of half the strip's width.
   *
   * Blur is the expensive part: `ctx.filter` re-rasterises through the GPU
   * every frame, per logo. Kept low by default, and forced to 0 on coarse
   * pointers, where the frame budget is tightest and the effect is least
   * visible.
   */
  maxBlur?: number;
  blurDistance?: number;
  /** Pixels per second, and which way. */
  speed?: number;
  direction?: 1 | -1;
  pauseOnHover?: boolean;
  enableDrag?: boolean;
}

/** How quickly a drag's momentum bleeds off, per frame at 60fps. */
const FRICTION = 0.94;
/** Below this the residual velocity is not worth animating. */
const MIN_VELOCITY = 0.02;

interface Tile {
  logo: CarouselLogo;
  image: HTMLImageElement | null;
  width: number;
  offset: number;
}

/**
 * An infinite strip of logos with a depth-of-field effect: each one scales up
 * and sharpens as it crosses the centre, and shrinks and blurs towards the
 * edges, so the row reads as receding into the background rather than sliding
 * flatly past.
 *
 * **Why canvas rather than DOM.** The effect needs a different transform and a
 * different blur on every logo on every frame. Done with elements that is a
 * per-frame write to a dozen nodes' styles, each one a `filter` that forces
 * its own compositing layer — the layout and paint cost lands on the main
 * thread and the whole page stutters with it. One canvas is one element, and
 * the loop runs on `requestAnimationFrame` writing to a ref, never through
 * React state, so the component renders once and then never again while it
 * animates.
 *
 * It stops when it is not being looked at: an `IntersectionObserver` cancels
 * the frame loop when the strip scrolls out of view, so a page that is not
 * showing it pays nothing for it.
 *
 * **The text fallback is not a placeholder.** A logo without artwork draws its
 * company name in the page's own typeface and takes part in the same scale and
 * blur. That means the strip is correct and complete from the moment it has a
 * list of names, and adding artwork later is a per-company change rather than
 * a precondition. Real trademarks cannot be invented, so this is what the
 * component does while it waits for them.
 *
 * Under `prefers-reduced-motion` there is no canvas at all: the logos become a
 * plain wrapped list, which is also what a screen reader gets in every case,
 * since a canvas has no readable content of its own.
 */
export function LogoCarousel3D({
  logos,
  className,
  maxHeight = 44,
  gap = 72,
  minScale = 0.55,
  maxScale = 1,
  maxBlur = 2,
  blurDistance = 0.62,
  speed = 42,
  direction = -1,
  pauseOnHover = true,
  enableDrag = true,
}: LogoCarousel3DProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  // Everything the loop mutates lives in refs. A single `setState` per frame
  // here would re-render the tree sixty times a second and undo the entire
  // reason for using a canvas.
  const tilesRef = useRef<Tile[]>([]);
  const totalRef = useRef(0);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);

  // Load the artwork once. Failures fall through to the text tile rather than
  // leaving a hole — a missing file should cost a logo its picture, not its
  // place in the row.
  useEffect(() => {
    let cancelled = false;
    const withSrc = logos.filter((l) => l.src);

    if (withSrc.length === 0) {
      setReady(true);
      return;
    }

    let settled = 0;
    const images = new Map<string, HTMLImageElement>();
    const done = () => {
      settled += 1;
      if (settled === withSrc.length && !cancelled) {
        imagesRef.current = images;
        setReady(true);
      }
    };

    withSrc.forEach((logo) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        images.set(logo.src as string, img);
        done();
      };
      img.onerror = done;
      img.src = logo.src as string;
    });

    return () => {
      cancelled = true;
    };
  }, [logos]);

  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    if (prefersReducedMotion || !ready) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const styles = getComputedStyle(canvas);
    const colour = styles.color;
    const fontSize = Math.round(maxHeight * 0.52);
    const font = `600 ${fontSize}px ${styles.fontFamily}`;

    // A coarse pointer means a phone: no hover to pause on, and the tightest
    // frame budget. Blur is the first thing to go.
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const blurCap = coarse ? 0 : maxBlur;

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = Math.ceil(maxHeight * maxScale + 8);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;

      let x = 0;
      tilesRef.current = logos.map((logo) => {
        const image = (logo.src && imagesRef.current.get(logo.src)) || null;
        const w = image
          ? (image.naturalWidth / image.naturalHeight) * maxHeight
          : ctx.measureText(logo.name).width;
        const tile: Tile = { logo, image, width: w, offset: x };
        x += w + gap;
        return tile;
      });
      totalRef.current = x;
    };

    const draw = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      const total = totalRef.current;
      if (total > 0) {
        if (!pausedRef.current && !draggingRef.current) {
          offsetRef.current += direction * speed * dt;
        }
        if (!draggingRef.current && Math.abs(velocityRef.current) > MIN_VELOCITY) {
          offsetRef.current -= velocityRef.current;
          velocityRef.current *= FRICTION;
        }
        // Keep the offset bounded. Without this it grows without limit and the
        // arithmetic loses precision after a few minutes on screen.
        offsetRef.current = ((offsetRef.current % total) + total) % total;
      }

      ctx.clearRect(0, 0, width, height);

      const centre = width / 2;
      const midY = height / 2;

      tilesRef.current.forEach((tile) => {
        // Draw each tile in every position it could occupy, so a logo leaving
        // one edge is already entering the other — the seam is never visible
        // because there is no seam.
        for (let copy = -1; copy <= Math.ceil(width / totalRef.current); copy += 1) {
          const x = tile.offset - offsetRef.current + copy * totalRef.current;
          const tileCentre = x + tile.width / 2;
          if (tileCentre < -tile.width || tileCentre > width + tile.width) continue;

          const d = Math.min(Math.abs(tileCentre - centre) / centre, 1);
          const scale = maxScale + (minScale - maxScale) * d;
          const blur = blurCap > 0 ? blurCap * Math.min(d / blurDistance, 1) : 0;

          ctx.save();
          ctx.globalAlpha = 1 - d * 0.45;
          ctx.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
          ctx.translate(tileCentre, midY);
          ctx.scale(scale, scale);

          if (tile.image) {
            ctx.drawImage(tile.image, -tile.width / 2, -maxHeight / 2, tile.width, maxHeight);
          } else {
            ctx.fillStyle = colour;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tile.logo.name, 0, 0);
          }
          ctx.restore();
        }
      });

      frame = requestAnimationFrame(draw);
    };

    layout();

    const start = () => {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    observer.observe(wrap);

    const resize = new ResizeObserver(layout);
    resize.observe(wrap);

    const onEnter = () => pauseOnHover && !coarse && (pausedRef.current = true);
    const onLeave = () => (pausedRef.current = false);

    const onDown = (event: PointerEvent) => {
      if (!enableDrag) return;
      draggingRef.current = true;
      velocityRef.current = 0;
      lastXRef.current = event.clientX;
      canvas.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = event.clientX - lastXRef.current;
      lastXRef.current = event.clientX;
      offsetRef.current -= dx;
      velocityRef.current = dx;
    };
    const onUp = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      canvas.releasePointerCapture(event.pointerId);
    };

    wrap.addEventListener('pointerenter', onEnter);
    wrap.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      stop();
      observer.disconnect();
      resize.disconnect();
      wrap.removeEventListener('pointerenter', onEnter);
      wrap.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [
    logos,
    ready,
    prefersReducedMotion,
    maxHeight,
    gap,
    minScale,
    maxScale,
    maxBlur,
    blurDistance,
    speed,
    direction,
    pauseOnHover,
    enableDrag,
  ]);

  if (prefersReducedMotion) {
    return (
      <ul className={cn('gap-x-xl gap-y-sm flex flex-wrap justify-center', className)}>
        {logos.map((logo) => (
          <li key={logo.name} className="text-label text-text-muted">
            {logo.name}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div ref={wrapRef} className={cn('relative w-full', className)}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn('block w-full', enableDrag && 'cursor-grab active:cursor-grabbing')}
      />
      {/* The canvas has no content assistive technology can reach, so the same
          list is here as text, visually hidden. */}
      <ul className="sr-only">
        {logos.map((logo) => (
          <li key={logo.name}>{logo.name}</li>
        ))}
      </ul>
    </div>
  );
}
