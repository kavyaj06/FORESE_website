import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

interface ActHeaderProps {
  title: string;
  lead: string;
  /** A second column of prose, when the act opens with two paragraphs. */
  children?: ReactNode;
  /** A photograph beside the text. Takes the second column if both are given. */
  media?: ReactNode;
}

/**
 * The opening of one of the three guides.
 *
 * It used to carry a rule with a number and a kicker over it, back when the
 * three guides were three acts of one scrolling page and a reader needed to
 * know which of them they had reached. They are separate pages now, each with
 * the rail above it saying which one is open, so the row was answering a
 * question nobody was still asking. The club asked for it gone.
 */
export function ActHeader({ title, lead, children, media }: ActHeaderProps) {
  const aside = media ?? children;

  return (
    <Container>
      <Reveal staggerChildren className="gap-xl flex flex-col">
        <div
          className={cn(
            'gap-xl desktop:gap-3xl grid grid-cols-1',
            aside && 'desktop:grid-cols-2 desktop:items-start',
          )}
        >
          <div className="gap-md flex flex-col">
            <RevealItem as="h2" className={cn('text-h2 text-balance', !aside && 'max-w-[20ch]')}>
              {title}
            </RevealItem>
            <RevealItem
              as="p"
              className={cn('text-body-lg text-text-muted', !aside && 'max-w-content-narrow')}
            >
              {lead}
            </RevealItem>
          </div>

          {aside && <RevealItem>{aside}</RevealItem>}
        </div>
      </Reveal>
    </Container>
  );
}
