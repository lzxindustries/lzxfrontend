import type {
  CategoryListingConfig,
  CategoryRawSection,
  CategorySourceEntry,
} from '~/lib/category-listing/types';

const PAGE_SUBTITLE =
  'Cases, racks, busboards, and external power hardware for building, powering, and expanding LZX modular systems.';

const ACTIVE_SECTION_SUBTITLE =
  'Current enclosures and busboards for Gen3 systems, from compact racks to larger Vessel builds.';

const LEGACY_SECTION_SUBTITLE =
  'Earlier rack, distro, and OEM power parts preserved for compatibility with older systems and support workflows.';

type CuratedEntry = {
  slug: string;
  name: string;
  subtitle: string;
  imagePath: string | null;
  isActive: boolean;
  isPreRelease?: boolean;
};

const CURATED_CASES_AND_POWER_ENTRIES: readonly CuratedEntry[] = [
  {
    slug: 'vessel-84',
    name: 'Vessel 84',
    subtitle:
      '84HP EuroRack enclosure with 12V DC power and video sync distribution',
    imagePath: '/images/base-system-84-square.png',
    isActive: true,
    isPreRelease: true,
  },
  {
    slug: 'vessel-168',
    name: 'Vessel 168',
    subtitle:
      '168HP EuroRack enclosure with 12V DC power and video sync distribution',
    imagePath: '/images/vessel168_photo_top_square2.png',
    isActive: true,
  },
  {
    slug: 'vessel-208',
    name: 'Vessel 208',
    subtitle:
      '208HP EuroRack enclosure with 12V DC power and video sync distribution',
    imagePath: null,
    isActive: false,
  },
  {
    slug: 'bus-168-diy-kit',
    name: 'Bus 168 DIY Kit',
    subtitle: 'DIY power and sync busboard for Vessel systems',
    imagePath: '/images/bus208_photo_top.png',
    isActive: true,
  },
  {
    slug: 'rack-84hp',
    name: 'Rack 84HP',
    subtitle: '84HP rack enclosure for desktop or 19" rack mounting',
    imagePath: '/images/rack-84.png',
    isActive: true,
  },
  {
    slug: 'dc-distro-3a',
    name: 'DC Distro 3A',
    subtitle: 'DC power distributor',
    imagePath: '/images/dc-distro-3a-front-panel-square.png',
    isActive: true,
  },
  {
    slug: 'dc-distro-5a',
    name: 'DC Distro 5A',
    subtitle: 'DC power distributor',
    imagePath: '/images/dc-distro-3a-front-panel-square.png',
    isActive: false,
  },
  {
    slug: '12v-dc-adapter-3a',
    name: '12V DC Adapter 3A',
    subtitle: '3A wall wart power supply with international plug kit',
    imagePath: '/images/12v-dc-wall-wart-adapter-set.png',
    isActive: true,
  },
  {
    slug: 'dc-power-cable',
    name: 'DC Power Cable',
    subtitle: '2.1mm DC jumper cables for module power distribution',
    imagePath: '/images/dc-power-cable-square.png',
    isActive: true,
  },
  {
    slug: 'power-entry-8hp',
    name: 'Power Entry 8HP',
    subtitle: 'OEM power entry assembly for 8HP and larger builds',
    imagePath: '/images/psu8-and-rear-panel.png',
    isActive: true,
  },
  {
    slug: 'power-sync-entry-12hp',
    name: 'Power & Sync Entry 12HP',
    subtitle:
      'OEM power and sync entry assembly for 12HP and larger builds',
    imagePath: '/images/fpga12-and-rear-panel.png',
    isActive: true,
  },
  {
    slug: 'vessel-eurorack-psu-expander',
    name: 'Vessel EuroRack PSU Expander',
    subtitle: 'Legacy +/-12V power expander for Vessel cases',
    imagePath: null,
    isActive: false,
    isPreRelease: true,
  },
];

/** Backwards-compatible export consumed by the cases-and-power tests. */
export function getCasesAndPowerEntries(): CuratedEntry[] {
  return CURATED_CASES_AND_POWER_ENTRIES.map((entry) => ({...entry}));
}

function curatedToSource(entry: CuratedEntry): CategorySourceEntry {
  return {
    canonical: entry.slug,
    name: entry.name,
    shopifyGid: null,
    externalUrl: null,
    __curatedSubtitle: entry.subtitle,
    __imagePath: entry.imagePath,
    __isPreRelease: entry.isPreRelease,
  };
}

function buildRawSections(): CategoryRawSection[] {
  const sources = CURATED_CASES_AND_POWER_ENTRIES.map(curatedToSource);
  // Helper to look up the original isActive flag.
  const isActiveBySlug = new Map(
    CURATED_CASES_AND_POWER_ENTRIES.map((e) => [e.slug, e.isActive]),
  );
  return [
    {
      key: 'active',
      groups: [
        {
          key: 'active',
          entries: sources.filter((s) => isActiveBySlug.get(s.canonical)),
        },
      ],
    },
    {
      key: 'legacy',
      groups: [
        {
          key: 'legacy',
          entries: sources.filter((s) => !isActiveBySlug.get(s.canonical)),
        },
      ],
    },
  ];
}

export const casesAndPowerCategoryConfig: CategoryListingConfig = {
  key: 'cases-and-power',
  pageTitle: 'Cases & Power',
  pageSubtitle: PAGE_SUBTITLE,
  seoTitle: 'Cases & Power',
  seoDescription: PAGE_SUBTITLE,
  cardSize: 'sm',
  defaultArtworkAspectRatio: '1/1',
  defaultArtworkFit: 'contain',
  gridColsClassName:
    'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
  sectionLabels: {active: 'Active', legacy: 'Legacy'},

  getRawSections: buildRawSections,

  // Filter out pre-release products.
  filterEntry: (entry) => !((entry as Record<string, unknown>).__isPreRelease as boolean | undefined),

  // Cases & power link to Shopify product pages directly (no internal hub).
  detailHref: (entry) => `/products/${entry.canonical}`,
  resolveHasInternalPage: () => true,

  resolveSubtitle: (entry) =>
    (entry.__curatedSubtitle as string | undefined) ?? null,

  resolveArtwork: (entry) => {
    const path = entry.__imagePath as string | null | undefined;
    return path ? {path} : null;
  },

  resolveBadge: (_entry, ctx) => (ctx.sectionKey === 'legacy' ? 'Legacy' : null),

  // Preserve curated order rather than alphabetizing.
  sortEntries: () => 0,

  resolveGroupSubtitle: (key) => {
    if (key === 'active') return ACTIVE_SECTION_SUBTITLE;
    if (key === 'legacy') return LEGACY_SECTION_SUBTITLE;
    return undefined;
  },
};
