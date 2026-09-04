/**
 * Gallery — page content.
 *
 * Photographs are grouped under the shared event list in `@/data/events.ts`;
 * this file only says which pictures belong to which event.
 *
 * The generated placeholder abstracts are gone; every photograph below is a
 * real one. To add an event's album:
 *
 *   1. Put the files in `public/gallery/<event-slug>/NN.jpg`
 *   2. Add an entry here with each photograph's true `width`/`height`
 *   3. Write a real `alt` describing what the picture shows
 *
 * `width` and `height` are not optional. They reserve the tile's box, which is
 * what stops the whole grid reflowing as pictures load — the single biggest
 * cause of layout shift on a gallery page.
 *
 * Order is not set here. The index reads `EVENTS_BY_RECENCY`, so albums appear
 * newest-event-first and an album added out of order still lands in the right
 * place. Nothing needs rearranging by hand when an event is added.
 */

import { EVENTS_BY_RECENCY, type ForeseEvent } from '@/data/events';

/**
 * How many of the newest events get the large image-led treatment before the
 * rest fall back to the compact archive list.
 *
 * The index has to work at both ends: with four events a bare list is an
 * almost empty page, and with sixty a wall of cover cards is unnavigable.
 * Three featured plus an archive is good at four events and still good at
 * sixty.
 */
export const FEATURED_COUNT = 3;

export const GALLERY_INTRO = {
  eyebrow: 'Gallery',
  title: 'Every moment, captured.',
  description:
    'From first steps to final celebrations \u2014 explore the moments, memories, and milestones that shaped our journey.',
} as const;

export interface GalleryPhoto {
  id: string;
  /** Path under `public/`. Absent until the photograph is supplied. */
  src?: string;
  /** Intrinsic pixel size. Required — it reserves the tile's box. */
  width: number;
  height: number;
  /**
   * What the photograph shows. Read by screen readers and shown as the
   * lightbox caption, so write it as a description, not a file name.
   */
  alt: string;
}

export interface GalleryAlbum {
  /** References an id in `@/data/events.ts`. */
  eventId: string;
  photos: GalleryPhoto[];
}

export const GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    eventId: 'fored-2026',
    photos: [
      {
        id: 'fored-2026-1',
        src: '/gallery/fored-2026/01.jpg',
        width: 1400,
        height: 921,
        alt: 'A university representative talking with four students across a table laid with a University of Strathclyde cloth.',
      },
      {
        id: 'fored-2026-2',
        src: '/gallery/fored-2026/02.jpg',
        width: 1400,
        height: 933,
        alt: 'Students and staff gathered together under the Waiting Hall sign at the end of the fair.',
      },
      {
        id: 'fored-2026-3',
        src: '/gallery/fored-2026/03.jpg',
        width: 1400,
        height: 928,
        alt: 'Two visiting representatives in conversation with students outside the building.',
      },
      {
        id: 'fored-2026-4',
        src: '/gallery/fored-2026/04.jpg',
        width: 1400,
        height: 922,
        alt: 'A representative talking with two students across a meeting table.',
      },
      {
        id: 'fored-2026-5',
        src: '/gallery/fored-2026/05.jpg',
        width: 1400,
        height: 930,
        alt: 'Students waiting their turn, going over their slips with a member of staff.',
      },
      {
        id: 'fored-2026-6',
        src: '/gallery/fored-2026/06.jpg',
        width: 1400,
        height: 926,
        alt: "A representative at a laptop talking with a student, the day's schedule on the whiteboard behind.",
      },
    ],
  },
];

/**
 * One event as the index presents it. Computed once here rather than
 * assembled independently by the featured grid and the archive list, so the
 * two can never disagree about an event's cover or photo count.
 */
export interface GalleryIndexEntry {
  event: ForeseEvent;
  cover?: GalleryPhoto;
  photoCount: number;
}

/**
 * Every event that actually has photographs, newest first.
 *
 * An event with an empty album is dropped rather than shown as an empty card:
 * a gallery entry that leads nowhere is worse than no entry.
 */
export function galleryIndexEntries(): GalleryIndexEntry[] {
  return EVENTS_BY_RECENCY.map((event) => {
    const photos = albumFor(event.id)?.photos ?? [];
    return { event, cover: photos[0], photoCount: photos.length };
  }).filter((entry) => entry.photoCount > 0);
}

/** The album for an event id, if it has one. */
export function albumFor(eventId: string): GalleryAlbum | undefined {
  return GALLERY_ALBUMS.find((album) => album.eventId === eventId);
}

/** The photograph that represents an event in the index. */
export function coverPhoto(eventId: string): GalleryPhoto | undefined {
  return albumFor(eventId)?.photos[0];
}
