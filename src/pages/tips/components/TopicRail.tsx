import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { TIPS_TOPICS } from '../data';
import { cn } from '@/lib/cn';

/**
 * The three guides, and which one you are reading.
 *
 * Real links rather than tabs, because each guide is a real page: the address
 * bar says which one is open, the back button works, and a student can be
 * sent straight to the resume advice instead of to the top of all three.
 *
 * Sticky under the navbar. A guide is still a page or two of reading, and the
 * rail is how a reader moves to the next one without going back to the top.
 *
 * The underline is one element that slides between the links rather than one
 * per link fading in and out — the same `layoutId` move the navbar makes, so
 * the two bars behave alike.
 *
 * **The rail's bottom border fills in as you read.** The guides run from
 * 3,100 to 7,300 pixels depending on the guide and the viewport, and until
 * now the only thing on the page that moved with the reader was the browser's
 * own scrollbar — which on a phone is not there at all. So a reader in the
 * middle of the group discussion playbook had no way to tell whether two
 * sections were left or six. The progress line answers that at the one place
 * already pinned to the top of the screen, costing no extra height and no
 * extra sticky chrome: the grey hairline under the rail turns black from the
 * left as the page goes by.
 *
 * Driven by `useScrollProgress` rather than framer-motion's `useScroll`.
 * Both are exact on a page that has settled; the difference is that
 * `useScroll` keeps reporting the old position when the document grows under
 * a reader who has not moved, which is what this page does every time its
 * deferred photograph arrives. See the hook for the measurement. It writes a
 * `MotionValue`, so the line is a transform and nothing re-renders as the
 * page moves.
 *
 * It is deliberately **not** disabled under reduced motion. Nothing here
 * animates on its own: the line is a readout of where the reader has already
 * put the page, exactly as a scrollbar is, and a scrollbar is not something
 * that preference turns off.
 */
export function TopicRail() {
  const progress = useScrollProgress();

  return (
    <div className="bg-bg/85 border-border sticky top-16 z-40 border-b backdrop-blur-md">
      <Container>
        <nav aria-label="Placement prep guides">
          <ul className="gap-lg flex scrollbar-none overflow-x-auto">
            {TIPS_TOPICS.map((topic, index) => (
              <li key={topic.id} className="relative shrink-0">
                <NavLink to={`/tips/${topic.id}`} className="block">
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'text-label gap-sm duration-fast flex items-center py-3.5 transition-colors',
                          isActive ? 'text-text' : 'text-text-muted hover:text-text',
                        )}
                      >
                        {/* Hidden on a phone, where the three labels and three
                            numbers together are wider than the screen and the
                            rail starts clipping its last guide. The number is
                            a pointer to the heading below, not information of
                            its own. */}
                        <span className="text-eyebrow text-text-subtle tablet:inline hidden tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {topic.label}
                      </span>

                      {isActive && (
                        <motion.span
                          layoutId="tips-topic-underline"
                          aria-hidden="true"
                          className="bg-accent absolute bottom-0 left-0 h-px w-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      {/* Sits in the border's own pixel row at `-bottom-px`, one row below the
          active link's underline, so the two marks never land on top of each
          other: the short one says which guide, the long one says how far. */}
      <motion.span
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="bg-accent absolute -bottom-px left-0 h-px w-full origin-left"
      />
    </div>
  );
}
