export const SITE_DECISIONS = {
  // 1) Back-in-stock provider decision
  backInStockProvider: 'klaviyo' as const,

  // 2) Shopify collection handles decision
  collections: {
    bStock: 'b-stock',
    accessories: 'accessories',
  },
} as const;

export type BackInStockProvider =
  (typeof SITE_DECISIONS)['backInStockProvider'];
