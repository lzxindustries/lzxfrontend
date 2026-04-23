import {describe, expect, it, vi} from 'vitest';

import {
  getRecommendedProducts,
  meta,
} from '~/routes/($lang).products.$productHandle';

// Regression test for the 500s on /products/2-1mm-dc-jumper-cable,
// /products/andor-1-media-player-deluxe-accessories-pack, and
// /products/double-vision-84. Shopify's productRecommendations query
// returns `null` for either `recommended` or `additional` when a SKU
// has no recs — we must resolve to [] instead of blowing up the
// deferred swimlane promise.
describe('products route getRecommendedProducts', () => {
  function stubStorefront(overrides: any = {}) {
    return {
      query: vi.fn().mockResolvedValue(overrides),
    } as any;
  }

  it('returns [] when Shopify returns null for recommended and additional', async () => {
    const storefront = stubStorefront({recommended: null, additional: null});
    const result = await getRecommendedProducts(
      storefront,
      'gid://shopify/Product/1',
    );
    expect(result).toEqual([]);
  });

  it('returns [] when Shopify returns null for just recommended', async () => {
    const storefront = stubStorefront({
      recommended: null,
      additional: {nodes: []},
    });
    const result = await getRecommendedProducts(
      storefront,
      'gid://shopify/Product/1',
    );
    expect(result).toEqual([]);
  });

  it('returns [] when Shopify returns null for just additional', async () => {
    const storefront = stubStorefront({
      recommended: [],
      additional: null,
    });
    const result = await getRecommendedProducts(
      storefront,
      'gid://shopify/Product/1',
    );
    expect(result).toEqual([]);
  });

  it('returns [] when the storefront query throws', async () => {
    const storefront = {
      query: vi.fn().mockRejectedValue(new Error('storefront down')),
    } as any;
    const result = await getRecommendedProducts(
      storefront,
      'gid://shopify/Product/1',
    );
    expect(result).toEqual([]);
  });

  it('returns [] when the query resolves to null', async () => {
    const storefront = {
      query: vi.fn().mockResolvedValue(null),
    } as any;
    const result = await getRecommendedProducts(
      storefront,
      'gid://shopify/Product/1',
    );
    expect(result).toEqual([]);
  });

  it('merges recommended + additional, dedupes, and removes the current product', async () => {
    const products = {
      recommended: [
        {id: 'gid://shopify/Product/1', handle: 'self'},
        {id: 'gid://shopify/Product/2', handle: 'a'},
      ],
      additional: {
        nodes: [
          {id: 'gid://shopify/Product/2', handle: 'a'},
          {id: 'gid://shopify/Product/3', handle: 'b'},
        ],
      },
    };
    const storefront = stubStorefront(products);
    const result = await getRecommendedProducts(
      storefront,
      'gid://shopify/Product/1',
    );
    expect(result.map((p: any) => p.handle)).toEqual(['a', 'b']);
  });

  it('skips the Shopify query entirely for synthetic LFS product IDs', async () => {
    // Legacy-only products (no Shopify record) carry an `lfs-product:<slug>`
    // id. Passing that to productRecommendations makes Shopify reject it
    // with "Variable $productId of type ID! was provided invalid value".
    // We should short-circuit with [] instead.
    const query = vi.fn();
    const storefront = {query} as any;
    const result = await getRecommendedProducts(
      storefront,
      'lfs-product:andor-1-media-player-deluxe-accessories-pack',
    );
    expect(result).toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });
});

describe('products route meta', () => {
  // When the loader throws (e.g. 404 for an unknown handle) Remix still
  // invokes `meta` during error rendering, but with `data === undefined`.
  // The old implementation dereferenced `data!.seo` and crashed the
  // response into a 500. Guard against that.
  it('returns an empty tag list when loader data is undefined', () => {
    const tags = (meta as any)({data: undefined} as any);
    expect(tags).toEqual([]);
  });

  it('returns an empty tag list when seo is missing from loader data', () => {
    const tags = (meta as any)({data: {}} as any);
    expect(tags).toEqual([]);
  });
});
