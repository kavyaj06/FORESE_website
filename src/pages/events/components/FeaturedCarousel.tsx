import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { EASE_OUT_BRAND } from '@/components/motion/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { eventStatus, formatEventWhen, type ForeseEvent } from '@/data/events';
import { cn } from '@/lib/cn';

interface FeaturedCarouselProps {
  events: ForeseEvent[];
}

const STATUS_LABEL = {
  ongoing: 'Happening now',
  upcoming: 'Upcoming event',
  completed: 'Completed',
} as const;

/**
 * The lead card: one event at a time, filling the width, with its status and
 * date set over the image.
 *
 * Manual only — it does not advance by itself. An auto-rotating carousel
 * moves the thing someone is reading out from under them, and it is the
 * single most complained-about pattern on the web. The arrows and the
 * keyboard are the whole control surface.
 *
 * Slides move in the direction you asked for: pressing next brings the new
 * slide in from the right, previous from the left. A carousel that always
 * animates the same way regardless of direction feels broken without anyone
 * being able to say why.
 */
export function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);

  const paginate = useCallback(
    (step: number) => {
      setState(([current]) => [(current + step + events.length) % events.length, step]);
    },
    [events.length],
  );

  // Arrow keys work whenever the carousel itself holds focus, not globally —
  // hijacking the arrow keys for the whole page would break normal scrolling.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      paginate(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      paginate(-1);
    }
  };

  useEffect(() => {
    if (index > events.length - 1) setState([0, 0]);
  }, [events.length, index]);

  if (events.length === 0) return null;
  const event = events[index];
  const status = eventStatus(event);
  const offset = prefersReducedMotion ? 0 : 90;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured events"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="focus-visible:outline-focus relative"
    >
      <div className="border-border bg-surface tablet:aspect-[21/9] relative aspect-[4/3] overflow-hidden rounded-lg border">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={event.id}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? offset : -offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -offset : offset }}
            transition={{ duration: 0.5, ease: EASE_OUT_BRAND }}
            className="absolute inset-0"
          >
            {event.cover && (
              <img
                src={event.cover}
                alt=""
                width={1280}
                height={720}
                className="h-full w-full object-cover"
              />
            )}

            {/* Scrim is literal black: it darkens a photograph, so it stays
                dark whatever the surrounding theme does. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
            />

            <div className="p-lg tablet:p-2xl gap-sm absolute inset-0 flex flex-col justify-between text-white">
              <span
                className={cn(
                  'text-eyebrow rounded-pill gap-xs w-fit border px-3 py-1.5 uppercase backdrop-blur-sm',
                  status === 'ongoing'
                    ? 'flex items-center border-white/30 bg-white/15'
                    : 'border-white/25 bg-black/30',
                )}
              >
                {status === 'ongoing' && (
                  <span aria-hidden="true" className="relative flex size-2">
                    <span className="rounded-pill absolute inline-flex h-full w-full bg-white opacity-60 motion-safe:animate-ping" />
                    <span className="rounded-pill relative inline-flex size-2 bg-white" />
                  </span>
                )}
                {STATUS_LABEL[status]}
              </span>

              <div className="gap-sm flex flex-col">
                <span className="text-eyebrow rounded-pill gap-xs flex w-fit items-center border border-white/25 bg-black/30 px-3 py-1.5 uppercase backdrop-blur-sm">
                  <CalendarDays size={14} strokeWidth={2} aria-hidden="true" />
                  {formatEventWhen(event)}
                </span>

                <h2 className="text-h1 max-w-[22ch]">{event.name}</h2>

                {event.venue && (
                  <p className="text-small gap-xs flex items-center opacity-85">
                    <MapPin size={15} strokeWidth={1.75} aria-hidden="true" />
                    {event.venue}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {events.length > 1 && (
        <div className="mt-lg gap-md flex items-center justify-between">
          {/* Progress, as a row of rules. Reads as position in a short list
              where a bare "2 / 4" does not. */}
          <ul className="gap-xs flex items-center" aria-hidden="true">
            {events.map((item, i) => (
              <li
                key={item.id}
                className={cn(
                  'duration-base ease-out-brand rounded-pill h-0.5 transition-[width,background-color]',
                  i === index ? 'bg-text w-8' : 'bg-border-strong w-4',
                )}
              />
            ))}
          </ul>

          <p aria-live="polite" className="text-caption text-text-muted sr-only">
            Slide {index + 1} of {events.length}: {event.name}
          </p>

          <div className="gap-xs flex items-center">
            <CarouselButton label="Previous event" onClick={() => paginate(-1)}>
              <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
            </CarouselButton>
            <CarouselButton label="Next event" onClick={() => paginate(1)}>
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </CarouselButton>
          </div>
        </div>
      )}
    </section>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="border-border text-text hover:border-border-strong hover:bg-surface duration-fast rounded-pill flex size-11 items-center justify-center border transition-colors active:scale-95"
    >
      {children}
    </button>
  );
}
