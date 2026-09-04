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
  /**
   * Pins this album to the large card at the top of the index, ahead of more
   * recent events.
   *
   * The one exception to date order, and it exists because Mock Placements is
   * the club's flagship: it should lead the gallery whether it ran last month
   * or last February. Everything else stays strictly newest-first underneath.
   *
   * A flag rather than an id matched in the component, so which album leads is
   * a fact stated once in the data instead of a name a layout has to know. If
   * two are ever pinned they keep their date order relative to each other.
   */
  pinned?: boolean;
  photos: GalleryPhoto[];
}

export const GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    eventId: 'leap-2026',
    photos: [
      {
        id: 'leap-2026-1',
        src: '/gallery/leap-2026/01.jpg',
        width: 1400,
        height: 787,
        alt: 'A student on his feet with a microphone, putting a question to the room during a session in the seminar hall.',
      },
      {
        id: 'leap-2026-2',
        src: '/gallery/leap-2026/02.jpg',
        width: 1400,
        height: 787,
        alt: 'A student speaking into a microphone from the floor of a full hall.',
      },
      {
        id: 'leap-2026-3',
        src: '/gallery/leap-2026/03.jpg',
        width: 1400,
        height: 1050,
        alt: 'Students turning to listen as one of them speaks, a member of staff standing at the side of the room.',
      },
      {
        id: 'leap-2026-4',
        src: '/gallery/leap-2026/04.jpg',
        width: 1400,
        height: 787,
        alt: 'A speaker addressing a full hall from the front of the room.',
      },
      {
        id: 'leap-2026-5',
        src: '/gallery/leap-2026/05.jpg',
        width: 1400,
        height: 787,
        alt: 'A session on what employers expect, the slide behind listing pro-activeness, time management, assertiveness and agility.',
      },
      {
        id: 'leap-2026-6',
        src: '/gallery/leap-2026/06.jpg',
        width: 1050,
        height: 1400,
        alt: 'A speaker taking the room through a talk, students seated in rows facing the screen.',
      },
    ],
  },
  {
    eventId: 'mock-placement-drive-2026',
    pinned: true,
    photos: [
      {
        id: 'mock-placement-drive-2026-1',
        src: '/gallery/mock-placement-drive-2026/01.jpg',
        width: 1400,
        height: 779,
        alt: "A panellist going through a student's paperwork across a classroom desk.",
      },
      {
        id: 'mock-placement-drive-2026-2',
        src: '/gallery/mock-placement-drive-2026/02.jpg',
        width: 1400,
        height: 779,
        alt: 'A panellist talking a student through her answers, notes spread between them.',
      },
      {
        id: 'mock-placement-drive-2026-3',
        src: '/gallery/mock-placement-drive-2026/03.jpg',
        width: 1400,
        height: 770,
        alt: 'A student sitting an interview across a desk, the panellist reading from a sheet.',
      },
      {
        id: 'mock-placement-drive-2026-4',
        src: '/gallery/mock-placement-drive-2026/04.jpg',
        width: 1400,
        height: 783,
        alt: 'A panellist working from a laptop while a student answers.',
      },
      {
        id: 'mock-placement-drive-2026-5',
        src: '/gallery/mock-placement-drive-2026/05.jpg',
        width: 1400,
        height: 782,
        alt: 'A one-to-one interview under way in a bare classroom.',
      },
      {
        id: 'mock-placement-drive-2026-6',
        src: '/gallery/mock-placement-drive-2026/06.jpg',
        width: 1400,
        height: 924,
        alt: 'Volunteers running the day from a table outside, radios and lists to hand.',
      },
      {
        id: 'mock-placement-drive-2026-7',
        src: '/gallery/mock-placement-drive-2026/07.jpg',
        width: 1400,
        height: 927,
        alt: 'A student carrying documents across campus with a member of the team.',
      },
      {
        id: 'mock-placement-drive-2026-8',
        src: '/gallery/mock-placement-drive-2026/08.jpg',
        width: 1400,
        height: 925,
        alt: 'Staff and volunteers talking between rounds on the campus path.',
      },
      {
        id: 'mock-placement-drive-2026-9',
        src: '/gallery/mock-placement-drive-2026/09.jpg',
        width: 1400,
        height: 927,
        alt: 'An interview in the seminar room, a second panellist observing from the far end.',
      },
      {
        id: 'mock-placement-drive-2026-10',
        src: '/gallery/mock-placement-drive-2026/10.jpg',
        width: 1400,
        height: 929,
        alt: 'A panellist taking a student through her feedback at the end of a round.',
      },
      {
        id: 'mock-placement-drive-2026-11',
        src: '/gallery/mock-placement-drive-2026/11.jpg',
        width: 1400,
        height: 921,
        alt: 'A panellist and a student mid-conversation across a desk.',
      },
      {
        id: 'mock-placement-drive-2026-12',
        src: '/gallery/mock-placement-drive-2026/12.jpg',
        width: 1400,
        height: 922,
        alt: 'A panellist making notes while a student answers.',
      },
    ],
  },
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
  pinned: boolean;
}

/**
 * Every event that actually has photographs: pinned albums first, then newest
 * first.
 *
 * An event with an empty album is dropped rather than shown as an empty card:
 * a gallery entry that leads nowhere is worse than no entry.
 *
 * The sort is stable and `EVENTS_BY_RECENCY` is already in date order, so
 * moving the pinned albums to the front leaves every other album exactly where
 * the dates put it — no second ordering rule to keep in step with the first.
 */
export function galleryIndexEntries(): GalleryIndexEntry[] {
  return EVENTS_BY_RECENCY.map((event) => {
    const album = albumFor(event.id);
    const photos = album?.photos ?? [];
    return { event, cover: photos[0], photoCount: photos.length, pinned: album?.pinned ?? false };
  })
    .filter((entry) => entry.photoCount > 0)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

/** The album for an event id, if it has one. */
export function albumFor(eventId: string): GalleryAlbum | undefined {
  return GALLERY_ALBUMS.find((album) => album.eventId === eventId);
}

/** The photograph that represents an event in the index. */
export function coverPhoto(eventId: string): GalleryPhoto | undefined {
  return albumFor(eventId)?.photos[0];
}
