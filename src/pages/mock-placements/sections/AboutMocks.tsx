import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { DecodeReveal } from '@/components/motion/DecodeReveal';
import { LogoCarousel3D } from '@/components/motion/LogoCarousel3D';
import { GALLERY_ALBUMS } from '@/pages/gallery/data';
import {
  MOCK_PLACEMENTS_ABOUT,
  MOCK_PLACEMENTS_COMPANIES_TITLE,
  MOCK_PLACEMENT_CAROUSEL_LOGOS,
  MOCK_PLACEMENTS_STREAM_WORDS,
} from '../data';

const COVER = GALLERY_ALBUMS[0]?.photos[0]?.src;

/**
 * What Mock Placements is, as a picture beside the argument for it.
 *
 * Two columns rather than a centred column, because the two halves are doing
 * different jobs: the left is evidence and the right is the claim. Stacked,
 * the reader meets the claim first and has already decided by the time the
 * evidence arrives.
 *
 * The photograph is uncovered by a stream of characters written across it and
 * then cleared away — see `DecodeReveal`. The words left standing lead with the
 * four rounds, so the effect is not decoration: by the time the picture is
 * clear the reader has been shown what the day consists of.
 *
 * Two figures, not the three the data holds. Side by side they are a pair the
 * eye compares; a third makes a row that is read as a list and skimmed. The
 * one left out is the count of modes, which the copy beside it already says.
 */
export function AboutMocks() {
  const { eyebrow, title, paragraphs, figures } = MOCK_PLACEMENTS_ABOUT;

  return (
    <section className="pt-2xl pb-2xl border-border border-b">
      <Container>
        <div className="gap-2xl desktop:grid-cols-2 desktop:gap-3xl grid grid-cols-1">
          <Reveal motionStyle="scale" className="desktop:h-full">
            {/* Square while the columns are stacked, and the full height of the
                text column once they are side by side, so the picture and the
                figures finish on the same line. A fixed square next to a column
                of prose ends 150px short of it at 1440 and 310px at 1024 —
                which is not a proportion that can be tuned, since it moves with
                the copy. */}
            <DecodeReveal
              src={COVER}
              words={MOCK_PLACEMENTS_STREAM_WORDS}
              className="desktop:aspect-auto desktop:h-full aspect-square w-full"
            />
          </Reveal>

          <Reveal staggerChildren className="gap-lg flex flex-col">
            <RevealItem>
              <span className="text-label border-border bg-surface-raised rounded-pill inline-flex border px-3 py-1.5">
                {eyebrow}
              </span>
            </RevealItem>

            <RevealItem as="h2" className="text-h2 text-balance">
              {title}
            </RevealItem>

            {paragraphs.map((paragraph) => (
              <RevealItem key={paragraph.slice(0, 24)} as="p" className="text-body text-text-muted">
                {paragraph}
              </RevealItem>
            ))}

            <RevealItem className="gap-md pt-xs desktop:mt-auto tablet:grid-cols-2 grid grid-cols-1">
              {figures
                .filter((figure) => figure.value !== '2')
                .map((figure) => (
                  <div
                    key={figure.label}
                    className="border-border bg-surface-raised p-lg rounded-lg border"
                  >
                    <p className="text-h2 text-text tabular-nums">
                      <CountUp value={figure.value} />
                    </p>
                    <p className="text-body mt-xs">{figure.label}</p>
                    <p className="text-small text-text-muted mt-1">{figure.note}</p>
                  </div>
                ))}
            </RevealItem>
          </Reveal>
        </div>
      </Container>

      {/* Full-bleed, and outside the container on purpose: the strip is meant
          to run off both edges so it reads as continuing past the page rather
          than as a list that happens to be centred. */}
      <div className="mt-2xl">
        <p className="text-eyebrow text-text-subtle px-gutter mb-lg text-center uppercase">
          {MOCK_PLACEMENTS_COMPANIES_TITLE}
        </p>
        <LogoCarousel3D logos={MOCK_PLACEMENT_CAROUSEL_LOGOS} className="text-text-muted" />
      </div>
    </section>
  );
}
