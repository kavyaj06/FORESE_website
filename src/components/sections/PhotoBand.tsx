import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

export interface BandPhoto {
  src: string;
  alt: string;
  /** Intrinsic pixel size, so the band holds its box before the image lands. */
  width: number;
  height: number;
}

interface PhotoBandProps {
  photo: BandPhoto;
  /** One line over the foot of the picture. Omitted, the band is just a picture. */
  caption?: string;
  /**
   * `standard` — a break in a page of reading.
   * `tall`     — a page's one photograph, where it is doing more work.
   */
  size?: 'standard' | 'tall';
  className?: string;
}

/**
 * Heights rather than an aspect ratio.
 *
 * A ratio on a full-bleed element ties the band's height to the window's
 * width: at 1920 a 16:9 band is 1080px tall and fills the screen on its own,
 * which is not a break in the reading, it is a detour. A fixed height crops
 * the photograph instead, and the crop is what keeps the band a band.
 */
const SIZES = {
  standard: 'h-[17rem] tablet:h-[21rem] desktop:h-[25rem]',
  tall: 'h-[21rem] tablet:h-[27rem] desktop:h-[32rem]',
} as const;

/**
 * A photograph across the full width of the page.
 *
 * The site's inner pages were reviewed as "bland": five routes ran a black
 * hero and then one unbroken sheet of white to the footer, and two of the
 * three Placement Prep guides contained no picture at all. This is the device
 * that answers that — it is the one element on those pages that is neither
 * type nor a bordered box, and it is full-bleed because a photograph inset
 * into the content column is just a larger card.
 *
 * The caption sits on the picture rather than under it, over a gradient dark
 * enough to carry white text at any crop. Under it, the band would need a
 * strip of page beneath the image and would stop being full-bleed in the only
 * way that matters — the bottom edge.
 *
 * Alt text comes from the photograph, caption from the page. They are
 * different jobs: one describes what is in the frame for somebody who cannot
 * see it, the other says what the frame is doing here, and a caption repeated
 * as alt text is read twice by a screen reader.
 */
export function PhotoBand({ photo, caption, size = 'standard', className }: PhotoBandProps) {
  return (
    <Reveal
      as="figure"
      motionStyle="scale"
      className={cn('relative w-full overflow-hidden', SIZES[size], className)}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />

      {caption && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
          />
          <Container width="full" className="pb-lg absolute inset-x-0 bottom-0">
            <figcaption className="text-small text-white">{caption}</figcaption>
          </Container>
        </>
      )}
    </Reveal>
  );
}
