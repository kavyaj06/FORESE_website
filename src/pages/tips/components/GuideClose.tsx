import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui';
import { Reveal, RevealItem } from '@/components/motion/Reveal';
import { GUIDE_CLOSE, nextTopic } from '../data';

interface GuideCloseProps {
  /** The guide this close sits at the bottom of. */
  topicId: string;
}

/**
 * How a guide ends.
 *
 * It did not, before this. All three guides stopped on their last card and
 * handed the reader the footer: between 3,100 and 4,700 pixels of preparation
 * advice on a placement club's site with nothing at all to do at the bottom
 * of it, and no link of any kind anywhere in the three Acts. The mock
 * placements this entire page is preparation *for* were one route away and
 * never mentioned.
 *
 * So the close does the two things a reader at the bottom of a guide can
 * sensibly want: the thing the reading was for, and the next guide. Those are
 * different kinds of offer, which is why one is a button and the other is a
 * card. A row of two equal buttons would make the reader choose between them;
 * this makes the mock placements the action and the next guide the quieter
 * alternative beside it.
 *
 * On black. The note in `GroupDiscussionAct` about keeping the mistakes band
 * grey still holds for the middle of a guide, where a black section reads as
 * the end of the page and stops people short of the two guides the rail is
 * still offering. Here it *is* the end, and the inverse band is the system's
 * own way of saying so. It also gives every guide the same final beat, which
 * is what the rail at the top implies when it calls them three rooms in one
 * place.
 *
 * The next guide is derived, never stored, so the third guide wrapping round
 * to the first is a property of the list rather than a special case.
 *
 * Rendered by `TipsPage` rather than by each Act, and so sits *after* the
 * guide's `<section>` instead of inside it. That is what makes the `h2` here
 * honest: the close is a peer of the guide, not one more of its subsections,
 * and an `h2` set at `text-h2` next to the guide's own `h2` says exactly that.
 * It also means one mount point instead of the same three lines in three
 * files, which is why a fourth guide gets its ending for free.
 */
export function GuideClose({ topicId }: GuideCloseProps) {
  const next = nextTopic(topicId);

  return (
    <div data-theme="inverse" className="py-section">
      <Container>
        <Reveal
          staggerChildren
          className="gap-3xl desktop:grid-cols-2 desktop:items-end grid grid-cols-1"
        >
          <RevealItem className="gap-lg flex flex-col">
            <p className="text-eyebrow text-text-subtle uppercase">{GUIDE_CLOSE.eyebrow}</p>
            <h2 className="text-h2 max-w-[24ch] text-balance">{GUIDE_CLOSE.title}</h2>
            <p className="text-body-lg text-text-muted max-w-measure">{GUIDE_CLOSE.body}</p>
            <Button
              to="/mocks"
              size="lg"
              className="self-start"
              iconRight={<ArrowRight size={18} strokeWidth={2} aria-hidden="true" />}
            >
              {GUIDE_CLOSE.action}
            </Button>
          </RevealItem>

          <RevealItem>
            {/* A link, not a button: it goes to a page and the address bar
                should say so. The arrow moves rather than the card, for the
                same reason the tip cards do not lift. */}
            <Link
              to={`/tips/${next.id}`}
              className="group/next border-border hover:border-border-strong bg-surface duration-base ease-out-brand gap-sm p-lg flex flex-col rounded-lg border transition-colors"
            >
              <p className="text-eyebrow text-text-subtle uppercase">{GUIDE_CLOSE.nextEyebrow}</p>
              <span className="text-h3 gap-md flex items-start justify-between">
                {next.label}
                <ArrowRight
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="duration-base ease-out-brand mt-1 shrink-0 transition-transform group-hover/next:translate-x-1"
                />
              </span>
              <p className="text-small text-text-muted">{next.blurb}</p>
            </Link>
          </RevealItem>
        </Reveal>
      </Container>
    </div>
  );
}
