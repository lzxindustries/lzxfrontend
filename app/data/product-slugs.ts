import modulesData from '../../db/lzxdb.Module.json';
import {slugify} from './lzxdb';

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

function detectSeries(m: Record<string, unknown>): string | null {
  const sku = (m.sku as string) ?? '';
  const name = m.name as string;

  if (sku.startsWith('LZXCSTL')) return 'castle';
  if (sku.startsWith('LZXCADT')) return 'cadet';

  // Expedition series modules (have external_url to community forum, eurorack, not hidden)
  const extUrl = (m.external_url as string) ?? '';
  if (extUrl.includes('community.lzxindustries.net') && m.has_eurorack_power_entry)
    return 'expedition';

  // VideoHeadroom third-party
  if (extUrl.includes('videoheadroom.systems')) return 'vhs';

  // Visionary series
  if (name === 'Video Waveform Generator') return 'visionary';

  // Gen3 / P-series: active modules with is_active_product
  if (m.is_active_product && m.has_eurorack_power_entry) return 'gen3';

  // Hidden legacy modules without series
  if (m.is_hidden) return 'legacy';

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
  'TBC2 Expander',
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
  'Triple Video Fader & Key Generator',
  'Video Logic',
  'Video Blending Matrix',
  'Rack 84HP',
  'Bus 168 DIY Kit',
  'DC Distro 3A',
  'DC Distro 5A',
  'Vessel 84',
  'Vessel 168',
  'Vessel 208',
  'Vessel EuroRack PSU Expander',
]);

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

  const oid = ((raw._id as Record<string, string>)?.$oid) ?? null;
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

/**
 * Resolve a product handle (from Shopify/ProductCard) to the correct
 * hub URL path, or null if it should stay at /products/.
 */
export function resolveProductUrl(handle: string): string {
  const entry = getSlugEntry(handle);
  if (!entry) return `/products/${handle}`;
  if (entry.hubType === 'module') return `/modules/${entry.canonical}`;
  if (entry.hubType === 'instrument') return `/instruments/${entry.canonical}`;
  return `/products/${handle}`;
}
