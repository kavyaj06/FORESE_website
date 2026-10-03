import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadRemoteContent } from './data/remote';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

/**
 * The content is fetched *and awaited* before `App` is imported.
 *
 * Half this site reads its content at module scope — `EventWorkflow` builds
 * its workflows on import, `routes.tsx` resolves album titles from the event
 * list — and those constants evaluate the moment `App` pulls them in. So the
 * store has to be full before that import begins, and not one consumer has to
 * know where the content came from.
 *
 * These two were a `Promise.all` and that was wrong: `import()` starts
 * evaluating its module graph as soon as it is called, so the app's modules
 * raced the fetch and usually won. It looked correct for as long as the
 * published content matched the content in the source — the first event added
 * through the editor was the first one that could tell the difference, and it
 * never appeared.
 *
 * The cost is one round trip ahead of the app's own download, which is what
 * `TIMEOUT_MS` in `data/remote.ts` caps. `loadRemoteContent` never rejects:
 * with no project configured, no network or a slow answer it leaves the store
 * empty and the site renders the content it was built with.
 */
await loadRemoteContent();
const { default: App } = await import('./App');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
