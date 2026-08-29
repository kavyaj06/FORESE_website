import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { formatEventDate } from '@/data/events';
import { ANNOUNCEMENTS } from '../data';

/**
 * The outline's "Announcements" panel.
 *
 * A list with rules rather than a grid of cards. Announcements are short,
 * dated and read in order — boxing each one would give three sentences the
 * visual weight of three articles.
 */
export function Announcements() {
  if (ANNOUNCEMENTS.length === 0) return null;

  return (
    <section className="border-border bg-surface py-section border-t">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Announcements" title="From the team" />
        </Reveal>

        <ul className="mt-2xl">
          {ANNOUNCEMENTS.map((item, index) => (
            <Reveal key={item.id} as="li" delay={index * 0.06}>
              <article className="border-border gap-xs desktop:grid-cols-[12rem_1fr] desktop:gap-lg grid border-t py-6 last:border-b">
                <p className="text-small text-text-subtle">{formatEventDate(item.date)}</p>
                <div className="gap-xs flex flex-col">
                  <h3 className="text-h3">{item.title}</h3>
                  <p className="text-body text-text-muted max-w-[62ch]">{item.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
