import {describe, expect, it} from 'vitest';

import {loader as moduleManualLoader} from '~/routes/($lang).modules.$slug.manual._index';

describe('manual archive fallbacks', () => {
  it('renders archived community docs for legacy modules instead of redirecting externally', async () => {
    const response = await moduleManualLoader({
      params: {slug: 'fortress'},
      request: new Request('https://lzxindustries.net/modules/fortress/manual'),
      context: {} as never,
    } as never);

    const payload = await (response as Response).json();

    expect(payload.noManual).toBe(false);
    expect(payload.doc.frontmatter.title).toBe('Fortress Archive');
    expect(payload.doc.html).toContain('Archived community reference');
    expect(payload.doc.html).toContain('Program Selection Reference');
  });

  it('builds manual fallbacks from related discussions when no official thread exists', async () => {
    const response = await moduleManualLoader({
      params: {slug: 'liquid-tv'},
      request: new Request('https://lzxindustries.net/modules/liquid-tv/manual'),
      context: {} as never,
    } as never);

    const payload = await (response as Response).json();

    expect(payload.noManual).toBe(false);
    expect(payload.doc.frontmatter.title).toBe('Liquid TV Archive');
    expect(payload.doc.html).toContain('Community Discussions');
    expect(payload.doc.html).toContain('Connecting Liquid TV to Visual Cortex');
  });
});