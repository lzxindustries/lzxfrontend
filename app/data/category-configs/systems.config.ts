import {getSlugEntry, type SlugEntry} from '~/data/product-slugs';
import {getInstrumentArtworkPath} from '~/data/instrument-artwork';
import {getModuleById} from '~/data/lzxdb';
import type {
  CategoryListingConfig,
  CategoryRawSection,
  CategorySourceEntry,
} from '~/lib/category-listing/types';

const SYSTEM_SLUGS = [
  'double-vision',
  'double-vision-168',
  'double-vision-expander',
] as const;

const SYSTEMS_SUBTITLE =
  'Double Vision brings the modern Gen3 video synthesis platform into complete instruments and expandable system formats, from the base desktop configuration to larger racks and companion expansion.';

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
  const entries = SYSTEM_SLUGS.map((slug) => getSlugEntry(slug))
    .filter((e): e is SlugEntry => Boolean(e))
    .map(entryToSource);
  return [
    {
      key: 'gen3',
      groups: [{key: 'gen3', entries}],
    },
  ];
}

export const systemsCategoryConfig: CategoryListingConfig = {
  key: 'systems',
  pageTitle: 'Systems',
  seoTitle: 'Systems',
  seoDescription: 'Double Vision Gen3 systems and expansion configurations.',
  cardSize: 'sm',
  defaultArtworkAspectRatio: '1/1',
  defaultArtworkFit: 'contain',

  getRawSections: buildRawSections,

  detailHref: (entry) => `/systems/${entry.canonical}`,
  resolveHasInternalPage: () => true,

  resolveSubtitle: (entry) =>
    (entry.moduleId
      ? getModuleById(entry.moduleId as string)?.subtitle
      : null) ?? null,

  resolveArtwork: (entry) => {
    const path = getInstrumentArtworkPath(entry.canonical);
    return path ? {path} : null;
  },

  // Preserve declared SYSTEM_SLUGS order rather than alphabetizing.
  sortEntries: () => 0,

  resolveGroupLabel: (key) => (key === 'gen3' ? 'Gen3 Series' : undefined),
  resolveGroupSubtitle: (key) =>
    key === 'gen3' ? SYSTEMS_SUBTITLE : undefined,
};
