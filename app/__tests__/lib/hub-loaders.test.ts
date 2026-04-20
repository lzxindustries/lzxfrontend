import {describe, expect, it, vi} from 'vitest';

import {loadModuleHubData} from '~/data/hub-loaders';

function createContext() {
  return {
    storefront: {
      i18n: {country: 'US', language: 'EN'},
      query: vi.fn().mockResolvedValue({
        product: null,
        shop: {
          name: 'LZX Industries',
          primaryDomain: {url: 'https://www.lzxindustries.net'},
          shippingPolicy: null,
          refundPolicy: null,
        },
      }),
    },
  } as any;
}

describe('loadModuleHubData', () => {
  it('builds fallback hub data for hidden modules with no Shopify product', async () => {
    const context = createContext();

    const data = await loadModuleHubData(
      'color-video-encoder',
      context,
      new Request('https://www.lzxindustries.net/modules/color-video-encoder'),
    );

    expect(data).not.toBeNull();
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

  it('keeps active modules Shopify-dependent', async () => {
    const context = createContext();

    const data = await loadModuleHubData(
      'esg3',
      context,
      new Request('https://www.lzxindustries.net/modules/esg3'),
    );

    expect(data).toBeNull();
  });
});