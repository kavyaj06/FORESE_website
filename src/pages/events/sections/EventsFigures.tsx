import { Container } from '@/components/layout/Container';
import { CountUp } from '@/components/motion/CountUp';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { EVENTS } from '@/data/events';
import { GALLERY_ALBUMS } from '@/pages/gallery/data';
import { CLUB_MEMBERS } from '@/data/team';
import { EVENTS_FIGURES } from '../data';

/**
 * What the club has actually run, as three figures on the inverse band.
 *
 * The events page is a hero and a list, and a list of three rows does not say
 * that three events took a hundred and sixty-five people to put on. This is
 * the page's one moment, and it is a different device from the other inner
 * pages on purpose: the team gets a strip of faces, the gallery a strip of
 * photographs, Placement Prep its scroll-lit prose, and this gets numbers.
 *
 * **Every figure is counted, never written.** A number typed into a data file
 * is a number that goes stale the week after it is typed: the club adds an
 * event in the editor and the page still says three. These come off the same
 * lists the rest of the site renders, so the band cannot disagree with the
 * list directly underneath it.
 *
 * It sits between the hero and the list rather than at the foot of the page,
 * because it is the summary of what follows and a summary after the thing it
 * summarises is a footnote.
 *
 * **On white, not on the inverse band the home page uses for its figures.**
 * The hero directly above is black, and an inverse band under it is one
 * seven-hundred-pixel black block with a seam in it — which is what this
 * page is being fixed for. White here also keeps the three surfaces of this
 * page distinct: black, white, grey.
 */
export function EventsFigures() {
  const photographs = GALLERY_ALBUMS.reduce((total, album) => total + album.photos.length, 0);

  const figures = [
    { value: String(EVENTS.length), label: EVENTS_FIGURES.events },
    { value: String(photographs), label: EVENTS_FIGURES.photographs },
    { value: String(CLUB_MEMBERS.length), label: EVENTS_FIGURES.people },
  ];

  return (
    <section className="py-section">
      <Container>
        {/* Three across at every width, as on the home page's band: stacked
            one per screen they arrive as three unrelated numbers. The type
            steps down instead. */}
        <Reveal staggerChildren className="gap-md tablet:gap-xl grid grid-cols-3">
          {figures.map((figure) => (
            <RevealItem
              key={figure.label}
              className="gap-xs flex flex-col items-center text-center"
            >
              <CountUp
                value={figure.value}
                className="text-h2 tablet:text-h1 desktop:text-display leading-none"
              />
              <p className="text-caption tablet:text-body desktop:text-body-lg text-balance">
                {figure.label}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
