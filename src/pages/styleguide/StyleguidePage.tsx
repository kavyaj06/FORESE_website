import { useState, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHero } from '@/components/sections/PageHero';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Badge, Button, Card, Modal, Skeleton } from '@/components/ui';
import { Reveal, RevealItem } from '@/components/motion/Reveal';

/**
 * Internal design system reference. Dev-only — excluded from production
 * builds by the `devOnly` flag in the route table.
 *
 * Its purpose is comparison: put this next to the reference designs and any
 * drift in colour, type, spacing or radius is visible immediately.
 *
 * Note every Tailwind class below is written out in full. Tailwind scans
 * source as plain text, so a composed string like `bg-${token}` would produce
 * no CSS at all.
 */

const COLORS: { swatch: string; label: string; token: string }[] = [
  { swatch: 'bg-bg', label: 'Background', token: '--color-bg' },
  { swatch: 'bg-surface', label: 'Surface', token: '--color-surface' },
  { swatch: 'bg-surface-raised', label: 'Surface raised', token: '--color-surface-raised' },
  { swatch: 'bg-surface-inverse', label: 'Surface inverse', token: '--color-surface-inverse' },
  { swatch: 'bg-border', label: 'Border', token: '--color-border' },
  { swatch: 'bg-border-strong', label: 'Border strong', token: '--color-border-strong' },
  { swatch: 'bg-text', label: 'Text', token: '--color-text' },
  { swatch: 'bg-text-muted', label: 'Text muted', token: '--color-text-muted' },
  { swatch: 'bg-text-subtle', label: 'Text subtle', token: '--color-text-subtle' },
  { swatch: 'bg-primary', label: 'Primary', token: '--color-primary' },
  { swatch: 'bg-accent', label: 'Accent', token: '--color-accent' },
  { swatch: 'bg-accent-subtle', label: 'Accent subtle', token: '--color-accent-subtle' },
  { swatch: 'bg-success', label: 'Success', token: '--color-success' },
  { swatch: 'bg-warning', label: 'Warning', token: '--color-warning' },
  { swatch: 'bg-danger', label: 'Danger', token: '--color-danger' },
];

const TYPE_SCALE: { className: string; label: string; sample: string }[] = [
  { className: 'text-display', label: 'text-display', sample: 'Display' },
  { className: 'text-h1', label: 'text-h1', sample: 'Heading level one' },
  { className: 'text-h2', label: 'text-h2', sample: 'Heading level two' },
  { className: 'text-h3', label: 'text-h3', sample: 'Heading level three' },
  {
    className: 'text-body-lg',
    label: 'text-body-lg',
    sample: 'Body large — used for section introductions.',
  },
  { className: 'text-body', label: 'text-body', sample: 'Body — the default paragraph size.' },
  {
    className: 'text-small',
    label: 'text-small',
    sample: 'Small — secondary and supporting copy.',
  },
  { className: 'text-label', label: 'text-label', sample: 'Label — buttons and navigation' },
  { className: 'text-eyebrow uppercase', label: 'text-eyebrow', sample: 'Eyebrow' },
  { className: 'text-caption', label: 'text-caption', sample: 'Caption — credits and footnotes' },
];

const SPACING: { bar: string; label: string }[] = [
  { bar: 'w-xs', label: 'xs · 8px' },
  { bar: 'w-sm', label: 'sm · 12px' },
  { bar: 'w-md', label: 'md · 16px' },
  { bar: 'w-lg', label: 'lg · 24px' },
  { bar: 'w-xl', label: 'xl · 32px' },
  { bar: 'w-2xl', label: '2xl · 48px' },
  { bar: 'w-3xl', label: '3xl · 72px' },
  { bar: 'w-section', label: 'section · fluid' },
];

const RADII: { box: string; label: string }[] = [
  { box: 'rounded-sm', label: 'sm' },
  { box: 'rounded-md', label: 'md' },
  { box: 'rounded-lg', label: 'lg' },
  { box: 'rounded-xl', label: 'xl' },
  { box: 'rounded-pill', label: 'pill' },
];

const SHADOWS: { box: string; label: string }[] = [
  { box: 'shadow-sm', label: 'sm' },
  { box: 'shadow-md', label: 'md' },
  { box: 'shadow-lg', label: 'lg' },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-border py-section border-t">
      <SectionHeading title={title} className="mb-xl" />
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Internal"
        title="Styleguide"
        description="Every design token and component in one place. Values are provisional until the anchor template is chosen."
      />

      <Container>
        <Section title="Colour">
          <ul className="gap-lg tablet:grid-cols-3 desktop:grid-cols-5 grid grid-cols-2">
            {COLORS.map(({ swatch, label, token }) => (
              <li key={token} className="gap-xs flex flex-col">
                <div
                  className={`border-border h-16 w-full rounded-md border ${swatch}`}
                  aria-hidden="true"
                />
                <span className="text-small">{label}</span>
                <code className="text-caption text-text-subtle">{token}</code>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Typography">
          <ul className="gap-lg flex flex-col">
            {TYPE_SCALE.map(({ className, label, sample }) => (
              <li key={label} className="border-border gap-xs pb-lg flex flex-col border-b">
                <code className="text-caption text-text-subtle">{label}</code>
                <p className={className}>{sample}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Spacing">
          <ul className="gap-sm flex flex-col">
            {SPACING.map(({ bar, label }) => (
              <li key={label} className="gap-md flex items-center">
                <code className="text-caption text-text-subtle w-32 shrink-0">{label}</code>
                <div className={`bg-accent h-4 rounded-sm ${bar}`} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Radius">
          <ul className="gap-lg flex flex-wrap">
            {RADII.map(({ box, label }) => (
              <li key={label} className="gap-xs flex flex-col items-center">
                <div
                  className={`bg-surface border-border-strong size-20 border ${box}`}
                  aria-hidden="true"
                />
                <code className="text-caption text-text-subtle">{label}</code>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Shadow">
          <ul className="gap-xl flex flex-wrap">
            {SHADOWS.map(({ box, label }) => (
              <li key={label} className="gap-sm flex flex-col items-center">
                <div className={`bg-surface-raised size-24 rounded-lg ${box}`} aria-hidden="true" />
                <code className="text-caption text-text-subtle">{label}</code>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Buttons">
          <div className="gap-xl flex flex-col">
            <div className="gap-md flex flex-wrap items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>

            <div className="gap-md flex flex-wrap items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button iconRight={<ArrowRight size={16} aria-hidden="true" />}>With icon</Button>
            </div>

            <div className="gap-md flex flex-wrap items-center">
              <Button to="/gallery" variant="secondary">
                Internal link
              </Button>
              <Button href="https://example.com" variant="secondary">
                External link
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Cards and badges">
          <div className="gap-lg tablet:grid-cols-3 grid">
            <Card>
              <h3 className="text-h3">Static card</h3>
              <p className="text-small text-text-muted mt-xs">No hover state — not clickable.</p>
            </Card>

            <Card interactive>
              <h3 className="text-h3">Interactive card</h3>
              <p className="text-small text-text-muted mt-xs">Lifts on hover.</p>
            </Card>

            <Card>
              <div className="gap-xs flex flex-wrap">
                <Badge>Neutral</Badge>
                <Badge tone="accent">Accent</Badge>
                <Badge tone="success">Open</Badge>
                <Badge tone="warning">Closing</Badge>
              </div>
            </Card>
          </div>
        </Section>

        <Section title="Loading states">
          <Card className="gap-sm flex flex-col">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </Card>
        </Section>

        <Section title="Modal">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example dialog">
            <p className="text-body text-text-muted">
              Escape closes this. Tab cycles inside it. Focus returns to the trigger on close, and
              the page behind cannot scroll.
            </p>
          </Modal>
        </Section>

        <Section title="Motion">
          <Reveal staggerChildren className="gap-lg tablet:grid-cols-3 grid">
            {['Reveals once', 'On scroll into view', 'Staggered by 60ms'].map((text) => (
              <RevealItem key={text}>
                <Card>
                  <p className="text-body">{text}</p>
                </Card>
              </RevealItem>
            ))}
          </Reveal>
        </Section>
      </Container>
    </>
  );
}
