import { PageHero } from '@/components/sections/PageHero';
import { GalleryIndex } from './sections/GalleryIndex';
import { GALLERY_ALBUMS, GALLERY_INTRO } from './data';

/**
 * Gallery index.
 *
 * The photographs are the only colour anywhere on this site — every other
 * surface is black and white. That is why nothing here is tinted or
 * desaturated, and why the index can afford to be typography: the pictures
 * still arrive, on hover, and they are the only thing on screen with colour
 * in it when they do.
 */
export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow={GALLERY_INTRO.eyebrow}
        title={GALLERY_INTRO.title}
        description={GALLERY_INTRO.description}
        size="compact"
        meta={[
          `${GALLERY_ALBUMS.length} events`,
          `${GALLERY_ALBUMS.reduce((total, album) => total + album.photos.length, 0)} photographs`,
        ]}
      />
      <GalleryIndex />
    </>
  );
}
