import {
  getAllInstrumentSlugs,
  getSlugEntry,
  type SlugEntry,
} from '~/data/product-slugs';
import {getInstrumentArtworkPath} from '~/data/instrument-artwork';
import {getLfsProductSubtitle} from '~/data/lfs-product-metadata';
import {getModuleById} from '~/data/lzxdb';
import type {
  CategoryListingConfig,
  CategoryRawSection,
  CategorySourceEntry,
} from '~/lib/category-listing/types';

export const EXCLUDED_INSTRUMENT_SLUGS = new Set([
  'andor-1-media-player',
  'double-vision',
  'double-vision-168',
  'double-vision-expander',
]);

const FORCE_LOCAL_SQUARE_ARTWORK_SLUGS = new Set([
  'chromagnon',
  'videomancer',
  'vidiot',
]);
const ACTIVE_INSTRUMENT_SLUGS = new Set(['videomancer', 'chromagnon']);
const LEGACY_INSTRUMENT_SLUGS = new Set(['vidiot']);

const INSTRUMENT_LISTING_ARTWORK_OVERRIDES: Record<string, string> = {
  videomancer: '/images/videomancer/hardware/photo-angle-front.png',
};

/** Synthetic legacy entry for BitVision (no Shopify product, community link). */
const BITVISION_LEGACY_ENTRY: CategorySourceEntry = {
  canonical: 'bitvision',
  name: 'BitVision',
  isHidden: true,
  externalUrl:
    'https://community.lzxindustries.net/t/all-about-bitvision-legacy/1353',
  __subtitleOverride: 'Compact Video Synthesizer for Audiovisualization',
};

export function isListedInstrumentSlug(slug: string): boolean {
  return !EXCLUDED_INSTRUMENT_SLUGS.has(slug);
}

function entryToSource(entry: SlugEntry): CategorySourceEntry {
  return {
    canonical: entry.canonical,
    name: entry.name,
    isHidden: entry.isHidden,
    shopifyGid: entry.shopifyGid ?? null,
    externalUrl: entry.externalUrl ?? null,
    moduleId: entry.moduleId ?? null,
  };
}

function buildRawSections(): CategoryRawSection[] {
  const slugEntries = getAllInstrumentSlugs()
    .map((slug) => getSlugEntry(slug))
    .filter((e): e is SlugEntry => Boolean(e))
    .filter((e) => isListedInstrumentSlug(e.canonical))
    .map(entryToSource);

  const active = slugEntries.filter((e) =>
    ACTIVE_INSTRUMENT_SLUGS.has(e.canonical),
  );
  const legacy = [
    ...slugEntries.filter((e) => LEGACY_INSTRUMENT_SLUGS.has(e.canonical)),
    BITVISION_LEGACY_ENTRY,
  ];

  return [
    {key: 'active', groups: [{key: 'active', entries: active}]},
    {key: 'legacy', groups: [{key: 'legacy', entries: legacy}]},
  ];
}

function getInstrumentListingArtworkPath(slug: string): string | null {
  return (
    INSTRUMENT_LISTING_ARTWORK_OVERRIDES[slug] ??
    getInstrumentArtworkPath(slug)
  );
}

export const instrumentsCategoryConfig: CategoryListingConfig = {
  key: 'instruments',
  pageTitle: 'Instruments',
  seoTitle: 'Instruments',
  seoDescription: 'LZX Industries standalone video instruments',
  cardSize: 'md',
  defaultArtworkAspectRatio: '16/9',
  defaultArtworkFit: 'cover',
  gridColsClassName:
    'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6',

  getRawSections: buildRawSections,

  detailHref: (entry) => `/instruments/${entry.canonical}/manual`,

  resolveSubtitle: (entry) => {
    const override = entry.__subtitleOverride as string | undefined;
    if (override) return override;
    const dbSubtitle = entry.moduleId
      ? getModuleById(entry.moduleId as string)?.subtitle
      : null;
    return dbSubtitle ?? getLfsProductSubtitle(entry.name) ?? null;
  },

  resolveArtwork: (entry) => {
    const path = getInstrumentListingArtworkPath(entry.canonical);
    if (!path) return null;
    if (FORCE_LOCAL_SQUARE_ARTWORK_SLUGS.has(entry.canonical)) {
      return {path, aspectRatio: '1/1', fit: 'contain'};
    }
    return {path, aspectRatio: '16/9', fit: 'cover'};
  },

  resolveHasInternalPage: (entry) => !entry.externalUrl,

  resolveBadge: (_entry, ctx) => (ctx.sectionKey === 'legacy' ? 'Legacy' : null),

  // Listing serves as a docs index — only entries with a manual or external link.
  filterEntry: (entry) => entry.hasManual || Boolean(entry.externalUrl),
};
