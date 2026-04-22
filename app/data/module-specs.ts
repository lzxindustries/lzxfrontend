import modulesData from '../../db/lzxdb.Module.json';
import companiesData from '../../db/lzxdb.Company.json';
import {getSlugEntry} from './product-slugs';

/**
 * Master "All Modules" specs table data.
 *
 * Sources `db/lzxdb.Module.json` joined with `db/lzxdb.Company.json` and the
 * canonical slug/series registry from `product-slugs.ts`. Replaces the old
 * docs site "Specs: All Modules" page.
 */

export type ModuleStatus = 'Active' | 'Legacy';

export type PowerEntry =
  | 'Eurorack 16-pin'
  | 'DC barrel'
  | 'Eurorack + DC barrel'
  | 'None';

export interface ModuleSpecRow {
  /** lzxdb module _id */
  id: string;
  /** Canonical URL slug, e.g. "esg3" */
  slug: string;
  /** Display name */
  name: string;
  /** Short tagline */
  subtitle: string | null;
  /** External documentation URL (for community/legacy modules) */
  externalUrl: string | null;
  /** Brand / company name, e.g. "LZX" or "VH.S" */
  company: string;
  /** Active vs Legacy/discontinued */
  status: ModuleStatus;
  /** Series key (gen3, pseries, vhs, castle, cadet, orion, expedition, visionary, ...) */
  series: string | null;
  /** Width in HP */
  hp: number | null;
  /** Mounting depth in mm */
  depthMm: number | null;
  /** Max +12V current draw in mA */
  posMa: number | null;
  /** Max -12V current draw in mA */
  negMa: number | null;
  /** Power-entry connector type */
  powerEntry: PowerEntry;
  /** Compact human-readable I/O sync description */
  videoSyncIO: string;
  /** True if this module can generate sync (root sync source) */
  isSyncGenerator: boolean;
  /** True if this module requires an external sync reference */
  requiresSync: boolean;
  /** Release year, or null if unknown */
  releaseYear: number | null;
  /** Discontinued year, or null if still active */
  discontinuedYear: number | null;
}

// --- Company lookup ---

const companyById = new Map<string, string>();
for (const c of companiesData) {
  companyById.set(c._id.$oid, c.name);
}

// --- Helpers ---

function yearOf(value: unknown): number | null {
  if (!value || typeof value !== 'object') return null;
  const date = (value as {$date?: string}).$date;
  if (!date) return null;
  const match = /^(\d{4})/.exec(date);
  return match ? Number(match[1]) : null;
}

function derivePowerEntry(raw: Record<string, unknown>): PowerEntry {
  const euro = !!raw.has_eurorack_power_entry;
  const barrel = !!raw.has_dc_barrel_power_entry;
  if (euro && barrel) return 'Eurorack + DC barrel';
  if (euro) return 'Eurorack 16-pin';
  if (barrel) return 'DC barrel';
  return 'None';
}

function deriveVideoSyncIO(raw: Record<string, unknown>): string {
  const parts: string[] = [];

  const rearRcaIn = !!raw.has_rear_video_sync_input;
  const rearRcaOut = !!raw.has_rear_video_sync_output;
  if (rearRcaIn && rearRcaOut) parts.push('Rear RCA in/out');
  else if (rearRcaIn) parts.push('Rear RCA in');
  else if (rearRcaOut) parts.push('Rear RCA out');

  const rear14In = !!raw.has_rear_14_pin_sync_input;
  const rear14Out = !!raw.has_rear_14_pin_sync_output;
  if (rear14In && rear14Out) parts.push('14-pin in/out');
  else if (rear14In) parts.push('14-pin in');
  else if (rear14Out) parts.push('14-pin out');

  const busIn = !!raw.has_eurorack_power_sync_input;
  const busOut = !!raw.has_eurorack_power_sync_output;
  if (busIn && busOut) parts.push('Bus sync in/out');
  else if (busIn) parts.push('Bus sync in');
  else if (busOut) parts.push('Bus sync out');

  const frontIn = !!raw.has_front_video_sync_input;
  const frontOut = !!raw.has_front_video_sync_output;
  if (frontIn && frontOut) parts.push('Front sync in/out');
  else if (frontIn) parts.push('Front sync in');
  else if (frontOut) parts.push('Front sync out');

  return parts.length ? parts.join(', ') : '—';
}

// --- Build rows ---

function buildRows(): ModuleSpecRow[] {
  const rows: ModuleSpecRow[] = [];

  for (const m of modulesData) {
    const raw = m as unknown as Record<string, unknown>;
    const id = (raw._id as {$oid: string}).$oid;
    const name = raw.name as string;

    // Resolve canonical slug via the central registry (handles aliases like
    // "p" → "pot"). Skip anything that isn't classified as a module hub
    // (instruments, accessories, excluded third-party items).
    const slugified = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slugEntry = getSlugEntry(slugified);
    if (!slugEntry || slugEntry.hubType !== 'module') continue;

    const companyRef = raw.company as {$oid: string} | undefined;
    const company = companyRef ? companyById.get(companyRef.$oid) ?? '' : '';

    const isHidden = !!raw.is_hidden;
    const discontinuedYear = yearOf(raw.discontinuedDate);
    const releaseYear = yearOf(raw.releaseDate);
    const status: ModuleStatus =
      isHidden || discontinuedYear !== null ? 'Legacy' : 'Active';

    rows.push({
      id,
      slug: slugEntry.canonical,
      name,
      subtitle: (raw.subtitle as string | undefined) ?? null,
      externalUrl: (raw.external_url as string | undefined) ?? null,
      company,
      status,
      series: slugEntry.series,
      hp: typeof raw.hp === 'number' ? (raw.hp as number) : null,
      depthMm:
        typeof raw.mounting_depth_mm === 'number'
          ? (raw.mounting_depth_mm as number)
          : null,
      posMa:
        typeof raw.max_pos_12v_ma === 'number'
          ? (raw.max_pos_12v_ma as number)
          : null,
      negMa:
        typeof raw.max_neg_12v_ma === 'number'
          ? (raw.max_neg_12v_ma as number)
          : null,
      powerEntry: derivePowerEntry(raw),
      videoSyncIO: deriveVideoSyncIO(raw),
      isSyncGenerator: !!raw.is_sync_generator,
      requiresSync: !!raw.is_sync_ref_required,
      releaseYear,
      discontinuedYear,
    });
  }

  return rows;
}

// Index name → canonical slug entry for the (rare) cases where the slugified
// module name differs from the canonical slug (e.g. "P" → "pot").
const allRows = buildRows();

// --- Augment with visionary modules from ModularGrid metadata ---
//
// Many Visionary-series modules predate the lzxdb dataset and therefore have
// no record in `db/lzxdb.Module.json`. Their canonical specs are scraped from
// ModularGrid into `lfs/library/products/eurorack-modules/visionary/<slug>/
// modulargrid/metadata.md`. Parse those files and synthesise spec rows so the
// master table covers the full historical catalog.

import visionaryMetadataSnapshot from './generated/visionary-modulargrid-metadata.json';

// Map of slug → raw markdown, snapshotted from
// lfs/library/products/eurorack-modules/visionary/<slug>/modulargrid/metadata.md
// at build time via `scripts/snapshot-visionary-metadata.mjs`.
const visionaryMetadataFiles: Record<string, string> = (
  visionaryMetadataSnapshot as {files: Record<string, string>}
).files;

// Folders inside .../visionary/ that are not actually modules.
const VISIONARY_NON_MODULE_SLUGS = new Set([
  'brand',
  'scroll-position-controller',
]);

function parseVisionaryName(raw: string): string | null {
  return raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null;
}

function parseVisionaryExternalUrl(raw: string): string | null {
  return (
    raw.match(/\*\*ModularGrid:\*\*\s+\[[^\]]+\]\((https?:\/\/[^)]+)\)/)?.[1] ??
    null
  );
}

function parseVisionarySubtitle(raw: string): string | null {
  return raw.match(/## Description\s*\n\s*\n\*\*(.+?)\*\*/s)?.[1]?.trim() ?? null;
}

/** Pull a numeric value out of a row in the Specifications markdown table. */
function parseSpecRow(specsBlock: string, label: RegExp): number | null {
  const re = new RegExp(`\\|\\s*${label.source}\\s*\\|\\s*([^|]+?)\\s*\\|`, 'i');
  const match = specsBlock.match(re);
  if (!match) return null;
  const num = match[1].match(/-?\d+(?:\.\d+)?/);
  return num ? Number(num[0]) : null;
}

function extractSpecsBlock(raw: string): string | null {
  return (
    raw.match(/##\s+Specifications\s*\n([\s\S]*?)(?=\n##\s|$)/i)?.[1] ?? null
  );
}

const existingSlugs = new Set(allRows.map((r) => r.slug));

for (const [slug, raw] of Object.entries(visionaryMetadataFiles)) {
  if (!slug || VISIONARY_NON_MODULE_SLUGS.has(slug)) continue;
  if (existingSlugs.has(slug)) continue;

  const name = parseVisionaryName(raw);
  if (!name) continue;

  const specsBlock = extractSpecsBlock(raw) ?? '';
  const hp = parseSpecRow(specsBlock, /Width/);
  const posMa = parseSpecRow(specsBlock, /\+12V Current/);
  const negMa = parseSpecRow(specsBlock, /-12V Current/);

  allRows.push({
    id: `lfs:visionary:${slug}`,
    slug,
    name,
    subtitle: parseVisionarySubtitle(raw),
    externalUrl: parseVisionaryExternalUrl(raw),
    company: 'LZX',
    status: 'Legacy',
    series: 'visionary',
    hp,
    // Visionary-era modules used a standard ~45 mm Eurorack depth and a
    // 16-pin Eurorack power header. ModularGrid does not record these
    // explicitly so we leave depth blank and rely on the conservative power
    // default from the series.
    depthMm: null,
    posMa,
    negMa,
    powerEntry: 'Eurorack 16-pin',
    videoSyncIO: '—',
    isSyncGenerator: slug === 'video-sync-generator',
    requiresSync: slug !== 'video-sync-generator',
    releaseYear: null,
    discontinuedYear: null,
  });
  existingSlugs.add(slug);
}


/** Get all module spec rows for the master comparison table. */
export function getAllModuleSpecRows(): ModuleSpecRow[] {
  return allRows;
}
