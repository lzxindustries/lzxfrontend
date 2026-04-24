import {getProductRecord, getProductSubtitle} from '~/data/product-catalog';
import type {
  CategoryListingConfig,
  CategoryRawSection,
  CategorySourceEntry,
} from '~/lib/category-listing/types';

const ACCESSORIES_HANDLES = [
  'dc-power-cable',
  'patch-cable',
  'rca-sync-cable',
  'rgb-patch-cable',
  'video-cable',
  'video-sync-distribution-cable',
  '8gb-microsd-card',
] as const;

const ORDER_INDEX = new Map<string, number>(
  ACCESSORIES_HANDLES.map((handle, index) => [handle, index]),
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
  const entries = ACCESSORIES_HANDLES.map(toSourceEntry).filter(
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

export const accessoriesCategoryConfig: CategoryListingConfig = {
  key: 'accessories',
  pageTitle: 'Accessories',
  pageSubtitle:
    'Patch, sync, video, and power cables along with SD storage accessories for LZX systems.',
  seoTitle: 'Accessories',
  seoDescription:
    'Cables and SD card accessories for patching, sync distribution, and media workflows.',
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
