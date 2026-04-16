import {describe, expect, it} from 'vitest';
import {loader} from '~/routes/($lang).blog.$slug';

describe('blog route loader', () => {
  it('redirects legacy dated blog slugs to the canonical blog slug', async () => {
    const response = await loader({
      context: {},
      params: {slug: '2026-03-12-videomancer-preview-release'},
      request: new Request('https://example.com/blog/2026-03-12-videomancer-preview-release'),
    } as unknown as Parameters<typeof loader>[0]);

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe(
      'https://example.com/blog/videomancer-preview-release',
    );
  });

  it('serves canonical blog slugs without redirecting', async () => {
    const response = await loader({
      context: {},
      params: {slug: 'videomancer-preview-release'},
      request: new Request('https://example.com/blog/videomancer-preview-release'),
    } as unknown as Parameters<typeof loader>[0]);

    expect(response.status).toBe(200);
  });
});