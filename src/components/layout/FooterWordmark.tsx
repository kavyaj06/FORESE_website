import { useEffect, useRef } from 'react';

/**
 * The club's name above the footer card, with a gradient the cursor reveals.
 *
 * Two copies of the same word, stacked exactly: a flat dark one that is always
 * there, and a gradient one masked to a soft circle that follows the pointer.
 * The same two-layer idea as the dotted fields elsewhere on the site, and for
 * the same reason — a mask can decide *where* a layer shows, but it cannot
 * recolour the layer underneath, so the lit state has to be its own layer.
 *
 * The mask's stops are the reference's own: solid to 34%, then 0.65 at 58%,
 * 0.2 at 76%, gone by 88%, which is what makes the edge read as a glow rather
 * than as a circle cut out of the letters.
 *
 * Nothing is held in React state. This fires on every pointer move, and the
 * position is written to two custom properties on the element itself, so
 * crossing the footer re-renders nothing.
 */
const TYPE =
  'font-display block text-center text-[clamp(2.75rem,13vw,11.5rem)] leading-[0.78] font-bold tracking-tight select-none';

export function FooterWordmark({ text, radius = 300 }: { text: string; radius?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const lit = litRef.current;
    if (!root || !lit) return;

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      lit.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      lit.style.setProperty('--my', `${event.clientY - rect.top}px`);
      lit.style.opacity = '1';
    };
    const onLeave = () => {
      lit.style.opacity = '0';
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const mask = `radial-gradient(${radius}px at var(--mx, -999px) var(--my, -999px), #000 0%, #000 34%, rgba(0,0,0,0.65) 58%, rgba(0,0,0,0.2) 76%, transparent 88%)`;

  return (
    <div ref={rootRef} className="relative">
      <p aria-hidden="true" className={`${TYPE} text-wf-dot`}>
        {text}
      </p>
      <p
        ref={litRef}
        aria-hidden="true"
        className={`${TYPE} text-wf-reveal absolute inset-0 opacity-0 transition-opacity duration-300`}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {text}
      </p>
    </div>
  );
}
