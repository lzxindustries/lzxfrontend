import {
  getModulesBySeries,
  type SlugEntry,
} from '~/data/product-slugs';
import {
  getExternalModuleListingEntries,
  getLegacyVisionaryModuleMetadataBySlug,
  getLfsModuleSeriesArchiveAssets,
  getLfsProductSubtitle,
} from '~/data/lfs-product-metadata';
import {getModuleArtworkPath} from '~/data/module-artwork';
import {getModuleById} from '~/data/lzxdb';
import type {
  CategoryListingConfig,
  CategoryRawSection,
  CategorySourceEntry,
} from '~/lib/category-listing/types';

export const MODULE_LISTING_EXCLUSIONS = new Set(['dc-distro-5a']);

const ACTIVE_SERIES_ORDER = ['pseries', 'gen3', 'vhs', 'castle'];
const LEGACY_SERIES_ORDER = [
  'orion',
  'expedition',
  'cadet',
  'visionary',
  'legacy',
  'other',
];

const SERIES_LABELS: Record<string, string> = {
  pseries: 'P',
  gen3: 'Gen3',
  vhs: 'VH.S',
  orion: 'Orion',
  visionary: 'Visionary',
  castle: 'Castle',
  cadet: 'Cadet',
  expedition: 'Expedition',
  legacy: 'Legacy',
  other: 'Other',
};

const SERIES_SUBTITLES: Record<string, string> = {
  pseries:
    'Compact utility modules designed to solve everyday patching needs with minimal space and maximum flexibility. These are foundational building blocks for routing, buffering, and distribution.',
  gen3:
    'Gen3 defines the modern LZX core: high-precision color, keying, and signal processing modules built for contemporary video synthesis systems. This series is optimized for deep integration and performance.',
  vhs:
    'Third-party modules from Video Headroom Systems built for the LZX Gen3 signal standard. These expand the ecosystem without requiring internal storefront product pages.',
  castle:
    'Castle is a digital logic playground for video-rate pulse structures, counters, gates, and timing experiments. It brings modular logic synthesis into the visual domain with a playful, patch-programmable approach.',
  orion:
    'Orion explored expanded control and memory concepts for expressive visual composition. These modules bridge rhythmic structure, sequencing ideas, and performable modulation workflows.',
  visionary:
    'Visionary captures foundational LZX concepts that shaped early analog video patching techniques. The series remains a key reference point for historical workflows and classic signal behavior.',
  cadet:
    'Cadet offered a modular way to assemble a complete video synthesis voice from focused, single-purpose units. It emphasized accessibility, scalability, and educational clarity.',
  expedition:
    'Expedition documented a broad ecosystem of legacy modules from earlier eras of the platform. Together they represent a diverse toolkit of sync, processing, and image-generation techniques.',
  legacy:
    'Archival modules preserved for historical continuity and documentation access. These products are no longer active but remain important to legacy system owners.',
  other:
    'Special-case and archival modules that do not map cleanly to a single historical family. This section preserves discoverability for less common products.',
};

function moduleEntryToSource(entry: SlugEntry): CategorySourceEntry {
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
  const bySeriesMap = getModulesBySeries();
  const externalEntries: CategorySourceEntry[] = getExternalModuleListingEntries().map(
    (entry) => ({
      canonical: entry.slug,
      name: entry.name,
      isHidden: entry.isHidden,
      externalUrl: entry.externalUrl,
      // Stash subtitle so resolveSubtitle can prefer it.
      __externalSubtitle: entry.subtitle,
    }),
  );

  const buildGroup = (key: string) => {
    if (key === 'vhs') {
      return {key, entries: externalEntries};
    }
    const entries = (bySeriesMap.get(key) ?? [])
      .filter((e) => !MODULE_LISTING_EXCLUSIONS.has(e.canonical))
      .map(moduleEntryToSource);
    return {key, entries};
  };

  return [
    {
      key: 'active',
      groups: ACTIVE_SERIES_ORDER.map(buildGroup),
    },
    {
      key: 'legacy',
      groups: LEGACY_SERIES_ORDER.map(buildGroup),
    },
  ];
}

export const modulesCategoryConfig: CategoryListingConfig = {
  key: 'modules',
  pageTitle: 'Modules',
  seoTitle: 'Modules',
  seoDescription: 'LZX Industries eurorack video synthesis modules',
  rightSlot: {label: 'View all module specs →', to: '/modules/specs'},
  sectionLabels: {active: 'Active', legacy: 'Legacy'},
  cardSize: 'sm',
  defaultArtworkAspectRatio: '1/1',
  defaultArtworkFit: 'contain',

  getRawSections: buildRawSections,

  detailHref: (entry) => `/modules/${entry.canonical}`,

  resolveSubtitle: (entry) => {
    const externalSubtitle = entry.__externalSubtitle as string | undefined;
    if (externalSubtitle) return externalSubtitle;
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

  resolveHasInternalPage: (entry) => !entry.externalUrl,

  resolveBadge: (entry, ctx) => {
    if (entry.externalUrl) return 'External';
    if (ctx.sectionKey === 'legacy') return 'Legacy';
    return null;
  },

  resolveGroupLabel: (key) =>
    SERIES_LABELS[key] ? `${SERIES_LABELS[key]} Series` : undefined,
  resolveGroupSubtitle: (key) => SERIES_SUBTITLES[key],
  resolveGroupArchive: (key) => {
    const assets = getLfsModuleSeriesArchiveAssets(key).filter(
      (a) => !a.isDownload,
    );
    if (assets.length === 0) return null;
    const label = SERIES_LABELS[key] ?? key;
    return {assets, title: `${label} Series Archive`};
  },
};
