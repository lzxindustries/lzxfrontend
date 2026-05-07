import {getModulesBySeries, type SlugEntry} from '~/data/product-slugs';
import {
  getLegacyVisionaryModuleMetadataBySlug,
  getLfsProductSubtitle,
} from '~/data/lfs-product-metadata';
import {getModuleArtworkPath} from '~/data/module-artwork';
import {getModuleById} from '~/data/lzxdb';
import type {
  CategoryListingConfig,
  CategoryRawSection,
  CategorySourceEntry,
} from '~/lib/category-listing/types';
import {MODULE_LISTING_EXCLUSIONS} from '~/data/category-configs/modules.config';

const PAGE_SUBTITLE =
  'This page includes past modules that we no longer have in active production and are not available for purchase. All modules include documentation and download information for existing owners and users.';

// Series considered "legacy" on the /modules listing. Keep in sync with
// LEGACY_SERIES_ORDER in modules.config.ts so /legacy lists every module
// that /modules surfaces under its Legacy section.
const LEGACY_SERIES = new Set([
  'orion',
  'expedition',
  'cadet',
  'visionary',
  'legacy',
  'other',
]);

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
  const all = [...getModulesBySeries().values()].flat();
  const legacy = all
    .filter(
      (e) =>
        !MODULE_LISTING_EXCLUSIONS.has(e.canonical) &&
        (e.isHidden || LEGACY_SERIES.has(e.series ?? 'other')),
    )
    .map(entryToSource);
  return [
    {
      key: 'all',
      groups: [{key: 'all', entries: legacy}],
    },
  ];
}

export const legacyCategoryConfig: CategoryListingConfig = {
  key: 'legacy-modules',
  pageTitle: 'Legacy Modules',
  pageSubtitle: PAGE_SUBTITLE,
  seoTitle: 'Legacy Modules',
  seoDescription:
    'Discontinued and legacy LZX modules with continued access to documentation and downloads.',
  cardSize: 'sm',
  defaultArtworkAspectRatio: '1/1',
  defaultArtworkFit: 'cover',

  getRawSections: buildRawSections,

  detailHref: (entry) => `/modules/${entry.canonical}`,
  resolveHasInternalPage: () => true,

  resolveSubtitle: (entry) => {
    const dbSubtitle = entry.moduleId
      ? getModuleById(entry.moduleId as string)?.subtitle
      : null;
    return (
      dbSubtitle ??
      getLfsProductSubtitle(entry.name) ??
      getLegacyVisionaryModuleMetadataBySlug(entry.canonical)?.subtitle ??
      null
    );
  },

  resolveArtwork: (entry) => {
    const path = getModuleArtworkPath(entry.canonical);
    return path ? {path} : null;
  },

  resolveBadge: () => 'Legacy',
};
