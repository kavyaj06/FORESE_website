import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <Container className="py-section">
      <div className="gap-lg flex flex-col items-start">
        <p className="text-eyebrow text-text-subtle uppercase">Error 404</p>
        <h1 className="text-h1">This page doesn&rsquo;t exist</h1>
        <p className="text-body-lg text-text-muted max-w-content-narrow">
          The link may be out of date, or the page may have moved.
        </p>
        <Button to="/">Back to home</Button>
      </div>
    </Container>
  );
}
