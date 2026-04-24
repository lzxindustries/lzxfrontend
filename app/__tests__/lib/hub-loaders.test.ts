import {describe, expect, it, vi} from 'vitest';

import {buildHubProductFromLocal} from '~/data/hub-product.server';
import {
  getRecommendedProducts,
  loadInstrumentHubData,
  loadModuleHubData,
} from '~/data/hub-loaders';

function createContext() {
  // The new hub loader sources content from the local catalog and only
  // calls Shopify for the live commerce snippet (price/stock). The
  // commerce query is fail-soft, so a stub that returns no product
  // nodes is enough — the catalog entry still drives the page.
  return {
    storefront: {
      i18n: {country: 'US', language: 'EN'},
      CacheCustom: () => ({}),
      query: vi.fn().mockResolvedValue({products: {nodes: []}}),
    },
  } as any;
}

describe('loadModuleHubData', () => {
  it('prefers live Shopify description HTML over flattened catalog HTML', () => {
    const product = buildHubProductFromLocal({
      record: {
        handle: 'demo-module',
        shopifyProductId: 'gid://shopify/Product/1',
        title: 'Demo Module',
        vendor: 'LZX Industries',
        productType: 'Module',
        status: 'ACTIVE',
        tags: ['Visible'],
        isActive: true,
        isVisible: true,
        isBStock: false,
        subtitle: null,
        descriptionHtml: '<p>Flattened catalog copy.</p>',
        descriptionPlain: 'Flattened catalog copy.',
        seo: null,
        options: [],
        gallery: [],
        variants: [],
        metafields: {},
        onlineStoreUrl: null,
        createdAt: null,
        updatedAt: null,
      },
      commerce: {
        handle: 'demo-module',
        productId: 'gid://shopify/Product/1',
        description: 'Lead paragraph. Bullet one. Bullet two.',
        descriptionHtml:
          '<p>Lead paragraph.</p><ul><li>Bullet one</li><li>Bullet two</li></ul>',
        defaultVariant: null,
        variants: [],
        availableForSale: true,
        currencyCode: 'USD',
      },
      lfs: null,
      selectedOptions: [],
    });

    expect(product.descriptionHtml).toContain('<ul>');
    expect(product.descriptionHtml).toContain('<li>Bullet one</li>');
    expect(product.description).toBe('Lead paragraph. Bullet one. Bullet two.');
  });

  it('builds fallback hub data for legacy modules with no catalog entry', async () => {
    const context = createContext();

    const data = await loadModuleHubData(
      'color-video-encoder',
      context,
      new Request('https://www.lzxindustries.net/modules/color-video-encoder'),
    );

    expect(data).not.toBeNull();
    // Not in the local Shopify-mirror catalog → falls back to the
    // synthetic legacy product.
    expect(data?.hasShopifyProduct).toBe(false);
    expect(data?.product.id).toBe('legacy-module:color-video-encoder');
    expect(data?.product.title).toBe('Color Video Encoder');
    expect(data?.slugEntry.externalUrl).toBe(
      'https://www.modulargrid.net/e/lzx-industries-color-video-encoder',
    );
    expect(data?.product.descriptionHtml).toContain(
      'Color Video Encoder is one of two required modules',
    );
    expect((data?.product as any).metafields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({namespace: 'custom', key: 'specs'}),
      ]),
    );
  });

  it('hydrates legacy media from the LFS product library', async () => {
    const context = createContext();

    const data = await loadModuleHubData(
      'liquid-tv',
      context,
      new Request('https://www.lzxindustries.net/modules/liquid-tv'),
    );

    expect(data).not.toBeNull();
    // liquid-tv is an inactive (legacy) catalog entry — commerce is
    // hidden but the local product record still drives the page.
    expect(data?.isLegacy).toBe(true);
    expect((data?.product as any).media.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({mediaContentType: 'IMAGE'}),
      ]),
    );
    expect(data?.archiveAssets.length).toBeGreaterThan(0);
  });

  it('returns null for a slug that exists nowhere', async () => {
    const context = createContext();

    const data = await loadModuleHubData(
      'this-slug-does-not-exist-anywhere-9999',
      context,
      new Request(
        'https://www.lzxindustries.net/modules/this-slug-does-not-exist-anywhere-9999',
      ),
    );

    expect(data).toBeNull();
  });
});

describe('getRecommendedProducts', () => {
  // Regression test for the 500s on /modules/pot, /modules/cyclops,
  // /modules/liquid-tv. Shopify returns `null` for either field when a
  // product has no recommendations yet; we must resolve to [] instead
  // of blowing up the deferred promise.
  it('returns [] when Shopify returns null for recommended and additional', async () => {
    const context = {
      storefront: {
        query: vi.fn().mockResolvedValue({recommended: null, additional: null}),
      },
    } as any;

    const result = await getRecommendedProducts(
      context,
      'gid://shopify/Product/1',
    );
    expect(result).toEqual([]);
  });

  it('returns [] when the storefront query throws', async () => {
    const context = {
      storefront: {
        query: vi.fn().mockRejectedValue(new Error('storefront down')),
      },
    } as any;

    const result = await getRecommendedProducts(
      context,
      'gid://shopify/Product/1',
    );
    expect(result).toEqual([]);
  });
});

describe('loadInstrumentHubData', () => {
  it('loads system products when the canonical slug differs from the catalog handle', async () => {
    const context = createContext();

    for (const [slug, name, handle] of [
      ['double-vision', 'Double Vision System', 'double-vision-system'],
      ['double-vision-168', 'Double Vision 168', 'double-vision-complete'],
      [
        'double-vision-expander',
        'Double Vision Expander',
        'double-vision-expander',
      ],
    ] as const) {
      const data = await loadInstrumentHubData(
        slug,
        context,
        new Request(`https://www.lzxindustries.net/systems/${slug}`),
      );

      expect(data).not.toBeNull();
      expect(data?.slug).toBe(slug);
      expect(data?.slugEntry.name).toBe(name);
      expect(data?.product.handle).toBe(handle);
      expect(data?.product.id).toMatch(/^gid:\/\/shopify\/Product\//);
    }
  });
});
