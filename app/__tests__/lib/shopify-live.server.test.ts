import {describe, expect, it, vi} from 'vitest';

import {getCommerceByHandle} from '~/data/shopify-live.server';

function createStorefront() {
  return {
    i18n: {country: 'US', language: 'EN'},
    CacheCustom: vi.fn(() => ({})),
    query: vi.fn().mockResolvedValue({
      nodes: [
        {
          id: 'gid://shopify/Product/8186914373655',
          handle: 'videomancer',
          availableForSale: true,
          variants: {
            nodes: [
              {
                id: 'gid://shopify/ProductVariant/43474696011799',
                sku: '930003',
                title: 'Default Title',
                availableForSale: true,
                quantityAvailable: 125,
                currentlyNotInStock: false,
                selectedOptions: [{name: 'Title', value: 'Default Title'}],
                price: {amount: '1499.0', currencyCode: 'USD'},
                compareAtPrice: null,
              },
            ],
          },
        },
      ],
    }),
  } as any;
}

describe('getCommerceByHandle', () => {
  it('queries Shopify by exact product id from the local catalog', async () => {
    const storefront = createStorefront();

    const snippet = await getCommerceByHandle(storefront, 'videomancer');

    expect(snippet).toMatchObject({
      handle: 'videomancer',
      availableForSale: true,
      defaultVariant: expect.objectContaining({
        variantId: 'gid://shopify/ProductVariant/43474696011799',
        availableForSale: true,
        quantityAvailable: 125,
      }),
    });

    expect(storefront.query).toHaveBeenCalledWith(
      expect.stringContaining('query CommerceByIds'),
      expect.objectContaining({
        variables: expect.objectContaining({
          ids: ['gid://shopify/Product/8186914373655'],
          country: 'US',
          language: 'EN',
        }),
      }),
    );
  });
});
