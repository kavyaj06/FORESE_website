import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadRemoteContent } from './data/remote';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

/**
 * The content is fetched before `App` is imported, and the two run in
 * parallel.
 *
 * Both halves of that matter. *Before*, because half this site reads its
 * content at module scope — `EventWorkflow` builds its workflows on import,
 * `routes.tsx` resolves album titles from the event list — and those constants
 * evaluate the moment `App` pulls them in. Loading first means they evaluate
 * against content that has already arrived, and not one consumer has to know
 * where it came from.
 *
 * *In parallel*, because the app's own JavaScript is the larger download of
 * the two: waiting for one and then the other would add a round trip to the
 * first paint for nothing.
 *
 * `loadRemoteContent` never rejects. With no project configured, no network or
 * a slow answer it leaves the store empty and the site renders the content it
 * was built with — see `data/remote.ts`.
 */
const [, { default: App }] = await Promise.all([loadRemoteContent(), import('./App')]);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
