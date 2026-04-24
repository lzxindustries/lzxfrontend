import {describe, expect, it} from 'vitest';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

describe('seoMetaFromLoaderData', () => {
  it('returns meta without throwing when data is undefined', () => {
    const meta = seoMetaFromLoaderData(undefined);
    expect(Array.isArray(meta)).toBe(true);
  });

  it('returns meta without throwing when seo is missing', () => {
    const meta = seoMetaFromLoaderData({});
    expect(Array.isArray(meta)).toBe(true);
  });

  it('passes through when seo is present', () => {
    const meta = seoMetaFromLoaderData({
      seo: {
        title: 'Test',
        titleTemplate: '%s | Site',
        description: 'Hi',
      },
    });
    expect(Array.isArray(meta)).toBe(true);
    expect((meta ?? []).length).toBeGreaterThan(0);
  });
});
