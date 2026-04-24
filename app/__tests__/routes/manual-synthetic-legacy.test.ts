import {describe, expect, it, vi} from 'vitest';

vi.mock('~/data/product-slugs', () => ({
  getCanonicalSlug: (slug: string) => slug,
  getDocPathForSlug: () => null,
  getSlugEntry: () => ({
    canonical: 'audio-frequency-decoder',
    name: 'Audio Frequency Decoder',
    externalUrl: null,
  }),
}));

vi.mock('~/data/forum-archive.server', async () => {
  const actual = await vi.importActual<
    typeof import('~/data/forum-archive.server')
  >('~/data/forum-archive.server');

  return {
    ...actual,
    getForumArchiveDocForProduct: vi.fn().mockResolvedValue(null),
  };
});

import {loader as moduleManualLoader} from '~/routes/($lang).modules.$slug.manual._index';

describe('synthetic legacy module manual fallback', () => {
  it('builds a local reference page from legacy product-library content when no authored doc or forum archive exists', async () => {
    const response = await moduleManualLoader({
      params: {slug: 'audio-frequency-decoder'},
      request: new Request(
        'https://lzxindustries.net/modules/audio-frequency-decoder/manual',
      ),
      context: {} as never,
    } as never);

    const payload = (await (response as Response).json()) as any;

    expect(payload.noManual).toBe(false);
    expect(payload.doc.frontmatter.title).toBe(
      'Audio Frequency Decoder Reference',
    );
    expect(payload.doc.html).toContain('Archived product-library reference');
    expect(payload.doc.html).toContain(
      'audio frequency decoder is an eight channel audio envelope extraction tool',
    );
    expect(payload.doc.html).toContain('Gallery');
    // Panel-art sources remain in LFS but are not listed on the public manual.
    expect(payload.doc.html).not.toContain('Product Library Archive');
  });
});
