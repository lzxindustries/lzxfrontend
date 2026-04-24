import {getProductRecord, getProductSubtitle} from '~/data/product-catalog';
import type {
  CategoryListingConfig,
  CategoryRawSection,
  CategorySourceEntry,
} from '~/lib/category-listing/types';

const PARTS_HANDLES = [
  'power-entry-module-8hp',
  'power-sync-entry-12hp',
  'video-knob',
] as const;

const ORDER_INDEX = new Map<string, number>(
  PARTS_HANDLES.map((handle, index) => [handle, index]),
);

type ProductBucket = 'active' | 'archive';

function toSourceEntry(handle: string):
  | (CategorySourceEntry & {
      __bucket: ProductBucket;
      __subtitle: string | null;
    })
  | null {
  const product = getProductRecord(handle);
  if (!product) return null;

  return {
    canonical: product.handle,
    name: product.title,
    shopifyGid: product.shopifyProductId,
    externalUrl: null,
    __bucket: product.isActive && product.isVisible ? 'active' : 'archive',
    __subtitle: getProductSubtitle(product),
  };
}

function buildRawSections(): CategoryRawSection[] {
  const entries = PARTS_HANDLES.map(toSourceEntry).filter(
    (entry): entry is NonNullable<ReturnType<typeof toSourceEntry>> =>
      entry != null,
  );

  return [
    {
      key: 'active',
      groups: [
        {
          key: 'active',
          entries: entries.filter((entry) => entry.__bucket === 'active'),
        },
      ],
    },
    {
      key: 'archive',
      groups: [
        {
          key: 'archive',
          entries: entries.filter((entry) => entry.__bucket === 'archive'),
        },
      ],
    },
  ];
}

export const partsCategoryConfig: CategoryListingConfig = {
  key: 'parts',
  pageTitle: 'Parts',
  pageSubtitle:
    'Circuit-board power entry hardware and performance control components for LZX builds.',
  seoTitle: 'Parts',
  seoDescription:
    'Power entry boards and knob components for custom builds, maintenance, and upgrades.',
  sectionLabels: {active: 'Current', archive: 'Archive'},
  cardSize: 'sm',
  defaultArtworkAspectRatio: '1/1',
  defaultArtworkFit: 'contain',

  getRawSections: buildRawSections,

  detailHref: (entry) => `/products/${entry.canonical}`,
  resolveHasInternalPage: () => true,

  resolveSubtitle: (entry) =>
    (entry.__subtitle as string | null | undefined) ?? null,

  resolveBadge: (_entry, ctx) =>
    ctx.sectionKey === 'archive' ? 'Archive' : null,

  sortEntries: (a, b) => {
    const left = ORDER_INDEX.get(a.canonical) ?? Number.MAX_SAFE_INTEGER;
    const right = ORDER_INDEX.get(b.canonical) ?? Number.MAX_SAFE_INTEGER;
    return left - right;
  },
};
