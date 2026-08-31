import { useEffect, useState } from 'react';
import type { GalleryPhoto } from '@/pages/gallery/data';
import { cn } from '@/lib/cn';

interface ConvergePhotoProps {
  photo: GalleryPhoto;
  /** Staggers this slot behind its neighbours so the six do not flip as one. */
  delayMs: number;
}

/**
 * One photograph in a converge column, crossfading whenever it is handed a new
 * one.
 *
 * Two images are always mounted, and the swap is a matter of which one is
 * opaque. The obvious alternative — one image whose `src` changes — flashes the
 * background between the old picture being dropped and the new one being
 * decoded, and the alternative to *that* is `AnimatePresence`, which this repo
 * has already had white-screen a production build when its exit callback never
 * fired. Two layers need neither: nothing is ever unmounted, so there is no
 * exit to wait on and no frame with nothing in it.
 *
 * 700ms is long for a transition and deliberately so. These are photographs
 * dissolving into each other in the corner of the eye while someone reads the
 * middle of the screen; at the 350ms the interface uses elsewhere it registers
 * as a flicker demanding attention rather than as the background changing.
 */
export function ConvergePhoto({ photo, delayMs }: ConvergePhotoProps) {
  const [top, setTop] = useState(photo);
  const [bottom, setBottom] = useState(photo);
  const [topVisible, setTopVisible] = useState(true);

  useEffect(() => {
    // Load the incoming picture into whichever layer is currently hidden, then
    // swap which one is opaque. Writing to the visible layer would replace the
    // picture instantly and there would be nothing to fade.
    setTopVisible((visible) => {
      if (visible) setBottom(photo);
      else setTop(photo);
      return !visible;
    });
  }, [photo]);

  const layer = 'absolute inset-0 size-full rounded-lg object-cover transition-opacity';

  return (
    <div className="relative h-[22vh] w-full overflow-hidden rounded-lg">
      <img
        src={top.src}
        alt=""
        loading="lazy"
        decoding="async"
        style={{ transitionDelay: `${delayMs}ms` }}
        className={cn(layer, 'duration-[700ms]', topVisible ? 'opacity-100' : 'opacity-0')}
      />
      <img
        src={bottom.src}
        alt=""
        loading="lazy"
        decoding="async"
        style={{ transitionDelay: `${delayMs}ms` }}
        className={cn(layer, 'duration-[700ms]', topVisible ? 'opacity-0' : 'opacity-100')}
      />
    </div>
  );
}
