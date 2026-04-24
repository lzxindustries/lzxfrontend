import {describe, expect, it} from 'vitest';

import {loader as docsSplatLoader} from '~/routes/($lang).docs.$';
import {loader as glossaryLoader} from '~/routes/($lang).glossary._index';

/**
 * Verifies the canonical URL contract for onboarding and glossary:
 *
 * - `/getting-started/*` is the canonical onboarding family; the
 *   `/docs/getting-started/*` aliases must 301 into it.
 * - `/docs/guides/glossary` is the canonical glossary; `/glossary`
 *   stays only as a 301 alias for old bookmarks.
 *
 * Both invariants exist to avoid duplicate surfaces with divergent
 * layouts, analytics, and SEO signals. Loosening either redirect
 * should require an explicit decision and a follow-up plan update.
 */

async function readRedirect(
  loader: (...args: any[]) => Promise<unknown>,
  url: string,
  params: Record<string, string | undefined>,
): Promise<Response> {
  try {
    const result = (await loader({
      params,
      request: new Request(url),
      context: {} as never,
    } as never)) as Response;
    return result;
  } catch (thrown) {
    if (thrown instanceof Response) return thrown;
    throw thrown;
  }
}

describe('canonical URL redirects', () => {
  describe('/docs/getting-started/* → /getting-started/*', () => {
    const cases: Array<[string, string]> = [
      ['learn', '/getting-started/learn'],
      ['modular', '/getting-started/modular'],
      ['', '/getting-started'],
    ];

    for (const [rest, expected] of cases) {
      const from = rest
        ? `https://lzxindustries.net/docs/getting-started/${rest}`
        : 'https://lzxindustries.net/docs/getting-started';
      it(`redirects ${from} → ${expected}`, async () => {
        const params = {
          '*': rest ? `getting-started/${rest}` : 'getting-started',
        };
        const response = await readRedirect(docsSplatLoader, from, params);
        expect(response.status).toBe(301);
        expect(response.headers.get('Location')).toBe(expected);
      });
    }
  });

  describe('legacy Docusaurus category URLs → canonical apex targets', () => {
    const cases: Array<[string, string]> = [
      ['category/program-guides', '/docs'],
      [
        'category/videomancer',
        '/instruments/videomancer/manual/quick-start',
      ],
    ];

    for (const [splat, expected] of cases) {
      it(`redirects /docs/${splat} → ${expected}`, async () => {
        const response = await readRedirect(
          docsSplatLoader,
          `https://lzxindustries.net/docs/${splat}`,
          {'*': splat},
        );
        expect(response.status).toBe(301);
        expect(response.headers.get('Location')).toBe(expected);
      });
    }
  });

  describe('/glossary → /docs/guides/glossary', () => {
    it('redirects with a 301 and preserves query strings', async () => {
      const response = await readRedirect(
        glossaryLoader,
        'https://lzxindustries.net/glossary?term=unipolar',
        {},
      );
      expect(response.status).toBe(301);
      expect(response.headers.get('Location')).toBe(
        '/docs/guides/glossary?term=unipolar',
      );
    });

    it('redirects a bare /glossary request', async () => {
      const response = await readRedirect(
        glossaryLoader,
        'https://lzxindustries.net/glossary',
        {},
      );
      expect(response.status).toBe(301);
      expect(response.headers.get('Location')).toBe('/docs/guides/glossary');
    });
  });
});
