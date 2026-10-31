import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
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
 */
export function TopicRail() {
  return (
    <div className="bg-bg/85 border-border sticky top-16 z-40 border-b backdrop-blur-md">
      <Container>
        <nav aria-label="Interview tips guides">
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
    </div>
  );
}
