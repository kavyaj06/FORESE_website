import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

interface ActHeaderProps {
  /** Zero-based position in `TIPS_TOPICS`. Printed as 01, 02, 03. */
  index: number;
  eyebrow: string;
  title: string;
  lead: string;
  /** A second column of prose, when the act opens with two paragraphs. */
  children?: ReactNode;
  /** A photograph beside the text. Takes the second column if both are given. */
  media?: ReactNode;
}

/**
 * The opening of one of the three acts.
 *
 * The rule and the number are what make a long guide navigable: the reader
 * can tell at a glance whether they are at the top of a topic or partway down
 * one, which a heading on its own does not say.
 *
 * The number comes from the page's topic list rather than being written here,
 * so the rail at the top of the page and the heading can never disagree about
 * which act is which.
 */
export function ActHeader({ index, eyebrow, title, lead, children, media }: ActHeaderProps) {
  const aside = media ?? children;

  return (
    <Container>
      <Reveal staggerChildren className="gap-xl flex flex-col">
        <RevealItem className="border-text pt-md gap-md flex items-baseline border-t">
          <span className="text-eyebrow text-text tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-eyebrow text-text-subtle uppercase">{eyebrow}</span>
        </RevealItem>

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
