// 3) Manual-version and related-product data format decision.

export interface ManualVersion {
  version: string;
  date: string; // YYYY-MM-DD
  url: string;
}

export interface ProductSupportRecord {
  slug: string;
  manuals: ManualVersion[];
  relatedProductSlugs: string[];
}

export const SUPPORT_MANIFEST: Record<string, ProductSupportRecord> = {
  videomancer: {
    slug: 'videomancer',
    manuals: [
      {
        version: 'current',
        date: '2026-03-20',
        url: '/docs/instruments/videomancer/user-manual',
      },
    ],
    relatedProductSlugs: ['double-vision', 'tbc2', 'lnk'],
  },
  'double-vision': {
    slug: 'double-vision',
    manuals: [],
    relatedProductSlugs: ['videomancer', 'tbc2'],
  },
};
