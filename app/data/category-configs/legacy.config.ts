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

const PAGE_SUBTITLE =
  'These modules are no longer in active production, but documentation and downloads remain available for existing owners and users.';

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
  const legacy = all.filter((e) => e.isHidden).map(entryToSource);
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
