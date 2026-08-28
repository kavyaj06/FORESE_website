import { PageHero } from '@/components/sections/PageHero';
import { EventwiseGallery } from './sections/EventwiseGallery';
import { GALLERY_INTRO } from './data';

/**
 * Gallery.
 *
 * The photographs are the only colour anywhere on this site — every other
 * surface is black and white. That is the reason nothing here is tinted,
 * filtered or desaturated: the pictures are meant to be the thing that has
 * colour in it.
 */
export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow={GALLERY_INTRO.eyebrow}
        title={GALLERY_INTRO.title}
        description={GALLERY_INTRO.description}
        size="compact"
      />
      <EventwiseGallery />
    </>
  );
}
