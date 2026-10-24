import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { TIPS_TOPICS } from '../data';
import { cn } from '@/lib/cn';

/**
 * Pixels of chrome above a section: the sticky navbar plus this rail.
 *
 * A section only counts as the one being read once its top has cleared both,
 * otherwise the rail lights the next topic while its heading is still hidden
 * behind the bar the rail itself is in.
 */
const CHROME_CLEARANCE = 140;

/**
 * How much of the bottom of the viewport is ignored.
 *
 * Without it, a section counts the moment its first pixel appears — so the
 * rail jumps to the next topic while the reader is still most of a screen
 * away from it.
 */
const LOOKAHEAD = '-55%';

/**
 * Where you are in the guide, and a way to jump.
 *
 * Sticky under the navbar rather than at the top of the page: this is three
 * long topics on one page, and a reader who lands partway down has no other
 * way to tell which of the three they are in.
 *
 * The active topic is observed, not derived from scroll position arithmetic —
 * an IntersectionObserver asks the browser which sections are on screen
 * instead of measuring three elements on every scroll frame.
 */
export function TopicRail() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = TIPS_TOPICS.map((topic) => document.getElementById(topic.id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;

    const onScreen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target.id);
          else onScreen.delete(entry.target.id);
        }
        // The last section on screen, in page order. At a boundary two are
        // visible at once — the previous act's closing band and the next act's
        // heading — and the one the reader has arrived at is the later of
        // them. (`findLast` is ES2023; this file compiles against ES2022.)
        const visible = TIPS_TOPICS.filter((topic) => onScreen.has(topic.id));
        setActive(visible.length > 0 ? visible[visible.length - 1].id : null);
      },
      { rootMargin: `-${CHROME_CLEARANCE}px 0px ${LOOKAHEAD} 0px` },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-bg/85 border-border sticky top-16 z-40 border-b backdrop-blur-md">
      <Container>
        <nav aria-label="Topics on this page">
          <ul className="gap-lg flex scrollbar-none overflow-x-auto">
            {TIPS_TOPICS.map((topic, index) => {
              const isActive = topic.id === active;

              return (
                <li key={topic.id} className="relative shrink-0">
                  <a
                    href={`#${topic.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'text-label gap-sm duration-fast flex items-center py-3.5 transition-colors',
                      isActive ? 'text-text' : 'text-text-muted hover:text-text',
                    )}
                  >
                    {/* Hidden on a phone, where the three labels and three
                        numbers together are wider than the screen and the rail
                        starts clipping its last topic. The number is a pointer
                        to the heading below, not information of its own. */}
                    <span className="text-eyebrow text-text-subtle tablet:inline hidden tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {topic.label}
                  </a>

                  {isActive && (
                    <motion.span
                      layoutId="tips-topic-underline"
                      aria-hidden="true"
                      className="bg-accent absolute bottom-0 left-0 h-px w-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
