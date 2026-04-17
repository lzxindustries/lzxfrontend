import {RemixBrowser} from '@remix-run/react';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';

/**
 * Fix initial pathname to match browser if we're dealing with trailing slashes.
 * GitHub Issue: https://github.com/remix-run/remix/issues/7529
 */
const remixContext = window.__remixContext as {url?: string};
const initialPathname = remixContext.url ?? window.location.pathname;
const hydratedPathname = window.location.pathname;
if (
  initialPathname !== hydratedPathname &&
  initialPathname.replace(/\/+$/, '') === hydratedPathname.replace(/\/+$/, '')
) {
  remixContext.url = hydratedPathname;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
