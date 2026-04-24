import {describe, expect, it} from 'vitest';

import {
  getProductGridBadges,
  getProductPurchaseStatus,
  isBackorderVariant,
  isPreorderProduct,
} from '~/lib/product-badges';

describe('product badge rules', () => {
  it('marks a product in stock when any variant has quantity available', () => {
    expect(
      getProductGridBadges({
        productId: 'gid://shopify/Product/1',
        variants: [
          {availableForSale: true, quantityAvailable: 0},
          {availableForSale: true, quantityAvailable: 3},
        ],
      }),
    ).toEqual(['In Stock']);
  });

  it('marks Chromagnon as preorder instead of backorder', () => {
    expect(isPreorderProduct('gid://shopify/Product/4319674761239')).toBe(true);
    expect(
      isBackorderVariant(
        {availableForSale: true, quantityAvailable: 0},
        'gid://shopify/Product/4319674761239',
      ),
    ).toBe(false);
    expect(
      getProductGridBadges({
        productId: 'gid://shopify/Product/4319674761239',
        variants: [{availableForSale: true, quantityAvailable: 0}],
      }),
    ).toEqual(['Preorder']);
  });

  it('does not mark unavailable variants with unknown inventory as backorder', () => {
    expect(
      getProductGridBadges({
        productId: 'gid://shopify/Product/2',
        variants: [{availableForSale: true, quantityAvailable: null}],
      }),
    ).toEqual([]);
  });

  it('derives product page purchase labels from the shared rules', () => {
    expect(
      getProductPurchaseStatus({
        productId: 'gid://shopify/Product/1',
        variant: {availableForSale: true, quantityAvailable: 0},
      }),
    ).toMatchObject({
      isBackorder: true,
      buttonLabel: 'Backorder Now',
      shippingLabel: 'Ships in 4-6 weeks',
      availabilityLabel: 'Ships in 4-6 weeks',
    });

    expect(
      getProductPurchaseStatus({
        productId: 'gid://shopify/Product/4319674761239',
        variant: {availableForSale: true, quantityAvailable: 0},
      }),
    ).toMatchObject({
      isPreorder: true,
      buttonLabel: 'Preorder Now',
      shippingLabel: 'Ships when available',
      availabilityLabel: 'Preorder',
    });

    expect(
      getProductPurchaseStatus({
        productId: 'gid://shopify/Product/3',
        variant: {availableForSale: true, quantityAvailable: 2},
      }),
    ).toMatchObject({
      isLowStock: true,
      availabilityLabel: '2 left',
    });
  });
});
