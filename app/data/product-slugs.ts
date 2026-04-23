import modulesData from '../../db/lzxdb.Module.json';
import {slugify} from './lzxdb';
import {getLegacyVisionaryModuleListingEntries} from './lfs-product-metadata';

/**
 * Canonical slug mapping for modules and instruments.
 *
 * Connects Shopify product handles, lzxdb module records, and
 * documentation file paths into a single lookup system.
 */

// --- Types ---

export type ProductHubType = 'module' | 'instrument';

export interface SlugEntry {
  /** Canonical URL slug (e.g. "esg3", "videomancer") */
  canonical: string;
  /** Hub type determines the URL namespace (/modules/ vs /instruments/) */
  hubType: ProductHubType;
  /** Path within content/docs/ to the doc file/folder (without .md) */
  docPath: string | null;
  /** Shopify product GID from lzxdb */
  shopifyGid: string | null;
  /** lzxdb module _id.$oid */
  moduleId: string | null;
  /** Module name from lzxdb */
  name: string;
  /** is_hidden in lzxdb — indicates legacy/discontinued */
  isHidden: boolean;
  /** external_url if docs live off-site */
  externalUrl: string | null;
  /** has_eurorack_power_entry — true for modules, false for instruments/accessories */
  hasEurorackPower: boolean | null;
  /** Series categorization */
  series: string | null;
}

const SYSTEM_SLUGS = new Set([
  'double-vision',
  'double-vision-168',
  'double-vision-expander',
]);

/**
 * Explicit canonical system slug → Shopify product handle mapping.
 *
 * Canonical slugs in `SYSTEM_SLUGS` are the URL-facing slugs used by
 * `/systems/:slug`. For some systems, the underlying Shopify product
 * handle differs from the canonical slug (e.g. the "Double Vision"
 * system is sold as `double-vision-system` in Shopify). This map
 * makes those overrides explicit so redirects don't depend on
 * brittle GID lookups across stale catalog snapshots.
 *
 * Entries omitted from this map fall through to `canonical` (i.e.
 * canonical slug equals the product handle).
 */
const SYSTEM_HANDLE_OVERRIDES: Record<string, string> = {
  'double-vision': 'double-vision-system',
  'double-vision-168': 'double-vision-complete',
};

// --- Doc slug extraction via import.meta.glob ---

const moduleDocGlob = import.meta.glob<string>(
  '../../content/docs/modules/*.md',
  {query: '?raw', import: 'default', eager: false},
);

const instrumentDocGlob = import.meta.glob<string>(
  '../../content/docs/instruments/**/*.md',
  {query: '?raw', import: 'default', eager: false},
);

/** Extract slug from a glob key like "../../content/docs/modules/esg3.md" → "esg3" */
function slugFromGlobKey(key: string): string {
  const match = key.match(/\/([^/]+)\.md$/);
  return match?.[1] ?? '';
}

/** Extract relative path from glob key: "../../content/docs/modules/esg3.md" → "modules/esg3" */
function docPathFromGlobKey(key: string): string {
  const match = key.match(/\/content\/docs\/(.+)\.md$/);
  if (!match) return '';
  return match[1].replace(/\/index$/, '');
}

// Build sets of known doc slugs
const moduleDocSlugs = new Set<string>();
const moduleDocPaths = new Map<string, string>(); // slug → doc path

for (const key of Object.keys(moduleDocGlob)) {
  const slug = slugFromGlobKey(key);
  if (slug && slug !== 'module-list' && slug !== '_category_') {
    moduleDocSlugs.add(slug);
    moduleDocPaths.set(slug, docPathFromGlobKey(key));
  }
}

// Instrument doc paths: flatten to top-level instrument slugs
const instrumentDocPaths = new Map<string, string>(); // slug → doc path

for (const key of Object.keys(instrumentDocGlob)) {
  const docPath = docPathFromGlobKey(key);
  if (!docPath) continue;
  // e.g. "instruments/videomancer" or "instruments/chromagnon"
  const parts = docPath.replace(/^instruments\//, '').split('/');
  const topSlug = parts[0];
  if (topSlug && topSlug !== '_category_' && !instrumentDocPaths.has(topSlug)) {
    instrumentDocPaths.set(topSlug, `instruments/${topSlug}`);
  }
}

// --- Series detection from SKU patterns ---

// Modules explicitly assigned to the P Series
const P_SERIES_NAMES = new Set(['LNK', 'MLT', 'P', 'PGO', 'PRM', 'PAB']);

// Modules explicitly assigned to the Orion Series
const ORION_SERIES_NAMES = new Set([
  'Escher Sketch',
  'Diver',
  'Fortress',
  'Memory Palace',
]);

// Modules explicitly assigned to the Expedition Series
const EXPEDITION_SERIES_NAMES = new Set([
  'Navigator',
  'Prismatic Ray',
  'Sensory Translator',
  'Shapechanger',
  'Passage',
  'Polar Fringe',
  'Staircase',
  'Liquid TV',
  'Marble Index',
  'Mapper',
  'Cyclops',
  'Topogram',
  'Pendulum',
]);

const MODULE_SERIES_OVERRIDES: Record<string, string> = {
  'DC Distro 3A': 'gen3',
  'DC Distro 5A': 'gen3',
  'TBC2 Expander': 'gen3',
  'Triple Video Fader & Key Generator': 'visionary',
  'Video Blending Matrix': 'visionary',
  'Video Logic': 'visionary',
};

function detectSeries(m: Record<string, unknown>): string | null {
  const sku = (m.sku as string) ?? '';
  const name = m.name as string;

  if (MODULE_SERIES_OVERRIDES[name]) {
    return MODULE_SERIES_OVERRIDES[name];
  }

  if (sku.startsWith('LZXCSTL')) return 'castle';
  if (sku.startsWith('LZXCADT')) return 'cadet';

  // P series (passive/programmable utilities)
  if (P_SERIES_NAMES.has(name)) return 'pseries';

  // Explicit Orion series overrides
  if (ORION_SERIES_NAMES.has(name)) return 'orion';

  // Explicit Expedition series overrides (includes hidden legacy modules)
  if (EXPEDITION_SERIES_NAMES.has(name)) return 'expedition';

  // Visionary series (check before community URL check)
  if (name === 'Video Waveform Generator') return 'visionary';

  const extUrl = (m.external_url as string) ?? '';

  // Remaining community.lzxindustries.net modules → Expedition
  if (
    extUrl.includes('community.lzxindustries.net') &&
    m.has_eurorack_power_entry
  )
    return 'expedition';

  // Gen3: active modules with eurorack power
  if (m.is_active_product && m.has_eurorack_power_entry) return 'gen3';

  // Hidden legacy modules without specific series → Visionary
  if (m.is_hidden) return 'visionary';

  return null;
}

// --- Instrument detection ---

/** Names of products that are standalone instruments (not eurorack modules) */
const INSTRUMENT_NAMES = new Set([
  'Videomancer',
  'Chromagnon',
  'Vidiot',
  'Double Vision System',
  'Double Vision 168',
  'Double Vision Expander',
  'Andor 1',
]);

/** Map from instrument name → canonical slug (handles naming mismatches) */
const INSTRUMENT_SLUG_OVERRIDES: Record<string, string> = {
  'Andor 1': 'andor-1-media-player',
  'Double Vision System': 'double-vision',
  'Double Vision 168': 'double-vision-168',
  'Double Vision Expander': 'double-vision-expander',
};

// --- Explicit slug overrides for name→slug mismatches ---

const MODULE_SLUG_OVERRIDES: Record<string, string> = {
  P: 'pot',
  'Sum/Dist': 'sumdist',
};

// --- Products that should NOT get hub pages ---

const ACCESSORY_NAMES = new Set([
  'Video Knob Pin',
  'Andor 1 Media Player Deluxe Accessories Pack',
  'DC Power Cable',
  'Gift Card',
  'RGB Patch Cable',
  'RCA Sync Cable',
  'Blank Panel',
  'Patch Cable',
  'RCA Video Cable',
  'Video Knob',
  'Power Entry 8HP',
  '14 Pin Sync Cable',
  '12V DC Adapter 3A',
  'Power & Sync Entry 12HP',
  'Alternate Frontpanel',
  'TBC2 Mk2 Fan Upgrade Kit',
  'TBC2 Mk1 Fan Upgrade Kit',
  'Chromagnon Patch',
  'Chromagnon Sticker',
  '8GB MicroSD Card',
  'Rack 84HP',
  'Bus 168 DIY Kit',
  'Vessel 84',
  'Vessel 168',
  'Vessel 208',
  'Vessel EuroRack PSU Expander',
]);

const EXCLUDED_EXTERNAL_URL_PATTERNS = ['videoheadroom.systems'];

function isExcludedFromSiteData(raw: Record<string, unknown>): boolean {
  const externalUrl = ((raw.external_url as string) ?? '').toLowerCase();
  return EXCLUDED_EXTERNAL_URL_PATTERNS.some((pattern) =>
    externalUrl.includes(pattern),
  );
}

// --- Build the master registry ---

const slugRegistry = new Map<string, SlugEntry>();
const aliasMap = new Map<string, string>(); // alias → canonical slug

function registerEntry(entry: SlugEntry) {
  slugRegistry.set(entry.canonical, entry);
}

function registerAlias(alias: string, canonical: string) {
  if (alias !== canonical) {
    aliasMap.set(alias, canonical);
  }
}

// Process all modules from lzxdb
for (const m of modulesData) {
  const raw = m as Record<string, unknown>;
  const name = raw.name as string;

  // Exclude unsupported third-party products from all site data/meta registries.
  if (isExcludedFromSiteData(raw)) continue;

  // Skip accessories
  if (ACCESSORY_NAMES.has(name)) continue;

  // Skip duplicate hidden Vidiot
  if (name === 'Vidiot' && raw.is_hidden) continue;

  const isInstrument = INSTRUMENT_NAMES.has(name);
  const defaultSlug = slugify(name);
  const overrideSlug = isInstrument
    ? INSTRUMENT_SLUG_OVERRIDES[name]
    : MODULE_SLUG_OVERRIDES[name];
  const canonical = overrideSlug ?? defaultSlug;

  const hubType: ProductHubType = isInstrument ? 'instrument' : 'module';

  // Determine doc path
  let docPath: string | null = null;
  if (isInstrument) {
    docPath = instrumentDocPaths.get(canonical) ?? null;
  } else {
    docPath = moduleDocPaths.get(canonical) ?? null;
  }

  const oid = (raw._id as Record<string, string>)?.$oid ?? null;
  const shopifyGid = (raw.id as string) ?? null;
  const externalUrl = (raw.external_url as string) ?? null;
  const isHidden = (raw.is_hidden as boolean) ?? false;
  const hasEurorackPower = (raw.has_eurorack_power_entry as boolean) ?? null;
  const series = isInstrument ? 'instrument' : detectSeries(raw);

  const entry: SlugEntry = {
    canonical,
    hubType,
    docPath,
    shopifyGid,
    moduleId: oid,
    name,
    isHidden,
    externalUrl,
    hasEurorackPower,
    series,
  };

  registerEntry(entry);

  // Register aliases
  if (overrideSlug && defaultSlug !== overrideSlug) {
    registerAlias(defaultSlug, canonical);
  }
}

for (const entry of getLegacyVisionaryModuleListingEntries()) {
  if (slugRegistry.has(entry.slug)) continue;

  registerEntry({
    canonical: entry.slug,
    hubType: 'module',
    docPath: null,
    shopifyGid: null,
    moduleId: null,
    name: entry.name,
    isHidden: entry.isHidden,
    externalUrl: entry.externalUrl,
    hasEurorackPower: null,
    series: 'visionary',
  });
}

// --- Public API ---

/** Resolve any slug (including aliases) to its canonical form. */
export function getCanonicalSlug(slug: string): string | null {
  if (slugRegistry.has(slug)) return slug;
  return aliasMap.get(slug) ?? null;
}

/** Get the full slug entry for a canonical or aliased slug. */
export function getSlugEntry(slug: string): SlugEntry | null {
  const canonical = getCanonicalSlug(slug);
  if (!canonical) return null;
  return slugRegistry.get(canonical) ?? null;
}

/** Check if a slug corresponds to a eurorack module. */
export function isModuleSlug(slug: string): boolean {
  const entry = getSlugEntry(slug);
  return entry?.hubType === 'module';
}

/** Check if a slug corresponds to a standalone instrument. */
export function isInstrumentSlug(slug: string): boolean {
  const entry = getSlugEntry(slug);
  return entry?.hubType === 'instrument';
}

export function isSystemSlug(slug: string): boolean {
  const entry = getSlugEntry(slug);
  return entry ? SYSTEM_SLUGS.has(entry.canonical) : false;
}

/** Get the hub type for a slug, or null if not a hub product. */
export function getProductHubType(slug: string): ProductHubType | null {
  return getSlugEntry(slug)?.hubType ?? null;
}

/** Get the doc path for a slug (e.g. "modules/esg3" or "instruments/videomancer"). */
export function getDocPathForSlug(slug: string): string | null {
  return getSlugEntry(slug)?.docPath ?? null;
}

/** Get the Shopify product GID for a slug. */
export function getShopifyGidForSlug(slug: string): string | null {
  return getSlugEntry(slug)?.shopifyGid ?? null;
}

/** Get the lzxdb module _id for a slug. */
export function getModuleIdForSlug(slug: string): string | null {
  return getSlugEntry(slug)?.moduleId ?? null;
}

/** Get all module slugs (for listings, sitemaps). */
export function getAllModuleSlugs(): string[] {
  return [...slugRegistry.values()]
    .filter((e) => e.hubType === 'module')
    .map((e) => e.canonical);
}

/** Get all instrument slugs. */
export function getAllInstrumentSlugs(): string[] {
  return [...slugRegistry.values()]
    .filter((e) => e.hubType === 'instrument')
    .map((e) => e.canonical);
}

/** Get all module entries grouped by series. */
export function getModulesBySeries(): Map<string, SlugEntry[]> {
  const groups = new Map<string, SlugEntry[]>();
  for (const entry of slugRegistry.values()) {
    if (entry.hubType !== 'module') continue;
    const series = entry.series ?? 'other';
    const list = groups.get(series) ?? [];
    list.push(entry);
    groups.set(series, list);
  }
  return groups;
}

/** Get all instrument entries. */
export function getAllInstrumentEntries(): SlugEntry[] {
  return [...slugRegistry.values()].filter((e) => e.hubType === 'instrument');
}

export function getAllSystemSlugs(): string[] {
  return [...SYSTEM_SLUGS].filter((slug) => slugRegistry.has(slug));
}

/**
 * Resolve a canonical system slug to its Shopify product handle.
 *
 * Resolution order:
 * 1. Explicit override from `SYSTEM_HANDLE_OVERRIDES` when the Shopify
 *    handle differs from the canonical slug.
 * 2. Canonical slug itself when it matches the product handle.
 *
 * Returns null when the slug is not a known system. Callers should
 * still verify the handle resolves to a `ProductRecord` (the catalog
 * may lag behind this mapping), and may fall back to a GID lookup
 * as a last resort.
 */
export function getSystemProductHandle(canonical: string): string | null {
  if (!SYSTEM_SLUGS.has(canonical)) return null;
  return SYSTEM_HANDLE_OVERRIDES[canonical] ?? canonical;
}

export function resolveHubUrlForSlug(slug: string): string {
  const entry = getSlugEntry(slug);
  if (!entry) return `/products/${slug}`;
  if (isSystemSlug(entry.canonical)) return `/systems/${entry.canonical}`;
  if (entry.hubType === 'module') return `/modules/${entry.canonical}`;
  return `/instruments/${entry.canonical}`;
}

/**
 * Resolve a product handle (from Shopify/ProductCard) to the correct
 * hub URL path, or null if it should stay at /products/.
 */
export function resolveProductUrl(handle: string): string {
  return resolveHubUrlForSlug(handle);
}
