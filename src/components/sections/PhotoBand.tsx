import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

export interface BandPhoto {
  src: string;
  alt: string;
  /** Intrinsic pixel size, so the figure holds its box before the image lands. */
  width: number;
  height: number;
}

interface PhotoBandProps {
  photo: BandPhoto;
  /** One line under the picture. Omitted, the figure is just a picture. */
  caption?: string;
  className?: string;
}

/**
 * The photograph that opens a Placement Prep guide.
 *
 * It used to run full bleed at 512px tall, and the argument for that is still
 * worth stating because it was not a bad one: these pages were reviewed as
 * bland, and a photograph inset into the content column is, in a sense, just
 * a larger card. The club has overruled it. At that size the picture was the
 * page rather than a part of it, and the guide underneath started below the
 * fold on most laptops.
 *
 * So it is a figure in the content column now, on the same left axis as the
 * heading above it and the prose below, with the column rules running past
 * either side of it. 320px at desktop rather than 512.
 *
 * **Heights rather than an aspect ratio**, still. A ratio ties the height to
 * the column's width, and the column is fluid between 1,200 and 1,440px; a
 * fixed height crops the photograph instead, and the crop is what keeps this
 * a band rather than a portrait.
 *
 * The caption moved out from on top of the picture to under it. Over a
 * gradient was right when the picture was full bleed and had no bottom edge
 * to sit below; now that it has one, a line of muted text under the frame is
 * what the rest of the site does with a caption.
 *
 * Alt text comes from the photograph, caption from the page. They are
 * different jobs: one describes what is in the frame for somebody who cannot
 * see it, the other says what the frame is doing here, and a caption repeated
 * as alt text is read twice by a screen reader.
 */
export function PhotoBand({ photo, caption, className }: PhotoBandProps) {
  return (
    <Container>
      <Reveal as="figure" motionStyle="scale" className={cn('flex flex-col', className)}>
        <div className="tablet:h-[17rem] desktop:h-[20rem] relative h-[14rem] w-full overflow-hidden rounded-lg">
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        </div>

        {caption && <figcaption className="text-small text-text-muted mt-sm">{caption}</figcaption>}
      </Reveal>
    </Container>
  );
}
