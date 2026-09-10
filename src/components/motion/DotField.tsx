import { useEffect, useRef } from 'react';

/**
 * The dotted field, with the dots near the cursor coming up brighter.
 *
 * Promoted out of the home page's workflow board because the mock placements
 * timeline now wants the same surface — the repo's rule for moving a component
 * up is a second page needing it, and this is that.
 *
 * **Two identical fields rather than one that changes colour.** A mask can
 * decide *where* a field shows but cannot recolour the dots inside one, so the
 * lit state is a second field of brighter dots revealed through a circular
 * mask that follows the pointer.
 *
 * **The pointer is listened for on the parent, not here.** The field sits
 * behind whatever it is decorating, so pointer events never reach it — they
 * land on the content above. Binding to the parent means a caller only has to
 * drop this in and mark the parent `relative`.
 *
 * **Nothing is held in React state.** This fires on every pointer move; the
 * position is written to two custom properties on the element itself, so a
 * cursor crossing the section re-renders nothing.
 */
export function DotField({ radius = 160 }: { radius?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const lit = litRef.current;
    const parent = root?.parentElement;
    if (!root || !lit || !parent) return;

    const onMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      lit.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      lit.style.setProperty('--my', `${event.clientY - rect.top}px`);
      lit.style.opacity = '1';
    };
    const onLeave = () => {
      lit.style.opacity = '0';
    };

    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);
    return () => {
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const mask = `radial-gradient(${radius}px at var(--mx, -999px) var(--my, -999px), #000, transparent 70%)`;

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="bg-wf-dots absolute inset-0" />
      <div
        ref={litRef}
        className="bg-wf-dots-lit absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      />
    </div>
  );
}
