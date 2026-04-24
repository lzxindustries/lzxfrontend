#!/usr/bin/env node
/**
 * Deep product gallery audit.
 *
 * Inputs:
 *   - app/data/generated/product-catalog.json            (Shopify mirror shape)
 *   - catalog/shopify/products/<handle>/media.json       (per-product mirror)
 *   - catalog/shopify/products/<handle>/media/*          (binary files for hashing)
 *   - app/data/generated/lfs-asset-manifest.json         (runtime LFS override)
 *
 * Signals (layered, each with objective evidence):
 *   - Exact identity:    same Shopify CDN pathname, same sha256 bytes.
 *   - Near-duplicate:    8x8 dHash (64-bit) Hamming distance clustering.
 *   - Token contradiction: handle/title token disagrees with filename token
 *                           (mk1 vs mk2, product-name token in another product's file).
 *   - Alt/type/placement: empty/generic alt, legend/diagram in slot 0 when
 *                           photo-style media exists later.
 *   - Runtime visibility: whether runtime serves LFS (hub-product.server.ts
 *                           buildMediaNodes) or falls back to catalog.
 *
 * Outputs:
 *   - audit-results/product-gallery-audit.json (machine-readable)
 *   - docs/reports/PRODUCT_GALLERY_MEDIA_AUDIT.md (human-readable; overwritten)
 *
 * Usage:
 *   node scripts/audit-product-galleries.mjs
 *   node scripts/audit-product-galleries.mjs --skip-perceptual  # skip sharp dHash
 *   node scripts/audit-product-galleries.mjs --json-only        # skip markdown
 */

import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

/* Load .env / .env.local so PUBLIC_STORE_DOMAIN flows into admin URLs. */
function loadEnvFiles(cwd) {
  for (const fileName of ['.env', '.env.local']) {
    const filePath = path.join(cwd, fileName);
    if (!existsSync(filePath)) continue;
    const contents = readFileSync(filePath, 'utf8');
    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}
loadEnvFiles(REPO_ROOT);

const ARGS = new Set(process.argv.slice(2));
const SKIP_PERCEPTUAL = ARGS.has('--skip-perceptual');
const JSON_ONLY = ARGS.has('--json-only');

const CATALOG_PATH = path.join(
  REPO_ROOT,
  'app/data/generated/product-catalog.json',
);
const LFS_MANIFEST_PATH = path.join(
  REPO_ROOT,
  'app/data/generated/lfs-asset-manifest.json',
);
const CATALOG_PRODUCTS_DIR = path.join(REPO_ROOT, 'catalog/shopify/products');
const AUDIT_RESULTS_DIR = path.join(REPO_ROOT, 'audit-results');
const JSON_OUT = path.join(AUDIT_RESULTS_DIR, 'product-gallery-audit.json');
const REMEDIATION_JSON_OUT = path.join(
  AUDIT_RESULTS_DIR,
  'product-gallery-remediation.json',
);
const MD_OUT = path.join(
  REPO_ROOT,
  'docs/reports/PRODUCT_GALLERY_MEDIA_AUDIT.md',
);
const REMEDIATION_MD_OUT = path.join(
  REPO_ROOT,
  'docs/reports/PRODUCT_GALLERY_REMEDIATION.md',
);
const SUPPRESSIONS_PATH = path.join(
  REPO_ROOT,
  'audit/product-gallery-suppressions.json',
);

/* ------------------------------------------------------------------ */
/* Shared heuristics / vocab                                           */
/* ------------------------------------------------------------------ */

const ILLUSTRATION_TOKENS = [
  'legend',
  'diagram',
  'schematic',
  'silk',
  'gerber',
  'illustrat',
  'line-art',
  'line_art',
  'lineart',
  'wireframe',
  'vector',
  'panel-art',
  'panel_art',
  'frontpanel',
  'front-panel',
  'front_panel',
  'modulargrid',
];

const PHOTO_TOKENS = [
  'photo',
  'lifestyle',
  'studio',
  '_dsc',
  '-dsc',
  'img_',
  'product-shot',
  'product_shot',
  'hero',
  'angle',
];

// Matches `mk2`, `Mk2`, `mk_2`, `-mk2-`, `_mk2_`, etc. Intentionally permissive
// because Shopify filenames commonly use `_mk2_` underscores which break \b.
const VERSION_TOKEN_RE = /(?:^|[^a-z0-9])mk[-_]?(\d+)(?=[^a-z0-9]|$)/i;

const GENERIC_ALT_RE = /^(?:|image\s*\d*|.+\s+image\s*\d+)$/i;

/* ------------------------------------------------------------------ */
/* I/O helpers                                                         */
/* ------------------------------------------------------------------ */

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function writeJson(p, value) {
  mkdirSync(path.dirname(p), {recursive: true});
  writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
}

function relRepo(p) {
  return path.relative(REPO_ROOT, p).replaceAll('\\', '/');
}

/* ------------------------------------------------------------------ */
/* Unified inventory                                                   */
/* ------------------------------------------------------------------ */

function urlPathKey(url) {
  if (!url) return null;
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

function tokensFromText(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

function hasIllustrationToken(text) {
  const lower = (text || '').toLowerCase();
  return ILLUSTRATION_TOKENS.some((t) => lower.includes(t));
}

function hasPhotoToken(text) {
  const lower = (text || '').toLowerCase();
  return PHOTO_TOKENS.some((t) => lower.includes(t));
}

function loadMirrorMediaIds(handle) {
  const p = path.join(CATALOG_PRODUCTS_DIR, handle, 'media.json');
  if (!existsSync(p)) return [];
  try {
    return readJson(p);
  } catch {
    return [];
  }
}

function buildInventory(catalog, lfsManifest) {
  const lfsProducts = lfsManifest.products ?? {};
  const rows = [];
  const excludedArchived = [];

  for (const [handle, product] of Object.entries(catalog.products ?? {})) {
    // Archived products are not customer-facing. Excluding them prevents stale
    // data from generating noisy cross-product flags (e.g. "shares bytes with X"
    // where X was archived weeks ago).
    if (product.status === 'ARCHIVED') {
      excludedArchived.push(handle);
      continue;
    }

    const lfs = lfsProducts[handle] ?? null;
    const lfsGalleryCount = Array.isArray(lfs?.gallery) ? lfs.gallery.length : 0;
    const runtimeSource = lfsGalleryCount > 0 ? 'lfs' : 'catalog';

    // Join Shopify media GIDs from the per-product mirror media.json.
    // The generated catalog strips them; remediation operations need them.
    const mirrorMedia = loadMirrorMediaIds(handle);

    const gallery = Array.isArray(product.gallery) ? product.gallery : [];
    for (const item of gallery) {
      const mirror = mirrorMedia[item.position] ?? null;
      const localPath = item.localPath ?? null;
      const absoluteLocal = localPath
        ? path.join(REPO_ROOT, localPath)
        : null;
      const fileName = localPath ? localPath.split('/').pop() : null;
      const shopifyFileName = item.shopifyUrl
        ? (urlPathKey(item.shopifyUrl) ?? '').split('/').pop() || null
        : null;

      rows.push({
        handle,
        title: product.title,
        productShopifyId: product.shopifyProductId ?? null,
        mediaShopifyId: mirror?.id ?? null,
        isVisible: Boolean(product.isVisible),
        isActive: Boolean(product.isActive),
        runtimeSource,
        runtimeExposed: runtimeSource === 'catalog',
        slot: Number.isFinite(item.position) ? item.position : null,
        mediaType: (item.type || 'image').toLowerCase(),
        alt: item.alt || '',
        width: item.width ?? null,
        height: item.height ?? null,
        shopifyUrl: item.shopifyUrl ?? null,
        shopifyUrlPath: urlPathKey(item.shopifyUrl),
        shopifyFileName,
        localPath,
        absoluteLocal,
        localExists: absoluteLocal ? existsSync(absoluteLocal) : false,
        localFileName: fileName,
        // Filled later:
        sha256: null,
        dHash: null,
        dHashHex: null,
        signals: [],
        riskScore: 0,
        tier: null,
        actions: [],
      });
    }
  }

  return {rows, excludedArchived};
}

/* ------------------------------------------------------------------ */
/* Hashing (sha256 + perceptual dHash)                                 */
/* ------------------------------------------------------------------ */

async function computeHashes(rows) {
  let sharp = null;
  if (!SKIP_PERCEPTUAL) {
    try {
      ({default: sharp} = await import('sharp'));
    } catch (error) {
      console.warn(
        `[warn] sharp unavailable, perceptual hashing disabled: ${error.message}`,
      );
    }
  }

  const fs = await import('node:fs/promises');

  let processed = 0;
  const total = rows.filter((r) => r.localExists).length;

  for (const row of rows) {
    if (!row.localExists) continue;
    processed += 1;
    if (processed % 25 === 0) {
      process.stderr.write(`  hashed ${processed}/${total}\n`);
    }

    try {
      const buf = await fs.readFile(row.absoluteLocal);
      row.sha256 = createHash('sha256').update(buf).digest('hex');

      if (sharp && row.mediaType === 'image') {
        // dHash: 9x8 grayscale, compare adjacent horizontal pixels => 64 bits
        const raw = await sharp(buf)
          .grayscale()
          .resize(9, 8, {fit: 'fill', kernel: 'lanczos3'})
          .raw()
          .toBuffer();
        const bits = new Uint8Array(64);
        for (let y = 0; y < 8; y += 1) {
          for (let x = 0; x < 8; x += 1) {
            const left = raw[y * 9 + x];
            const right = raw[y * 9 + x + 1];
            bits[y * 8 + x] = left > right ? 1 : 0;
          }
        }
        row.dHash = bits;
        row.dHashHex = bitsToHex(bits);
      }
    } catch (error) {
      row.signals.push({
        type: 'hash_error',
        detail: error.message,
      });
    }
  }
}

function bitsToHex(bits) {
  let out = '';
  for (let i = 0; i < bits.length; i += 4) {
    const nibble =
      (bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3];
    out += nibble.toString(16);
  }
  return out;
}

function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) d += 1;
  return d;
}

/* ------------------------------------------------------------------ */
/* Clustering                                                          */
/* ------------------------------------------------------------------ */

/**
 * Build three cluster maps:
 *  - exactUrl: by Shopify CDN pathname (same remote file)
 *  - exactBytes: by sha256 (same local bytes)
 *  - nearDup: dHash Hamming <= 6 groups (visually near-identical)
 */
function buildClusters(rows) {
  const byUrl = new Map();
  const byHash = new Map();

  for (const row of rows) {
    if (row.shopifyUrlPath) {
      const list = byUrl.get(row.shopifyUrlPath) ?? [];
      list.push(row);
      byUrl.set(row.shopifyUrlPath, list);
    }
    if (row.sha256) {
      const list = byHash.get(row.sha256) ?? [];
      list.push(row);
      byHash.set(row.sha256, list);
    }
  }

  // Near-dup clustering by dHash Hamming distance. Because n is small (~259),
  // an O(n^2) pass is acceptable and keeps implementation simple/deterministic.
  const DUP_THRESHOLD = 6; // near-duplicate
  const nearDupClusters = [];
  const assigned = new Set();
  const hashed = rows.filter((r) => r.dHash);

  for (let i = 0; i < hashed.length; i += 1) {
    const a = hashed[i];
    const aKey = a.handle + '::' + a.slot;
    if (assigned.has(aKey)) continue;
    const cluster = [a];
    assigned.add(aKey);
    for (let j = i + 1; j < hashed.length; j += 1) {
      const b = hashed[j];
      const bKey = b.handle + '::' + b.slot;
      if (assigned.has(bKey)) continue;
      const d = hamming(a.dHash, b.dHash);
      if (d <= DUP_THRESHOLD) {
        cluster.push(b);
        assigned.add(bKey);
      }
    }
    if (cluster.length > 1) nearDupClusters.push({distance: DUP_THRESHOLD, members: cluster});
  }

  return {byUrl, byHash, nearDupClusters};
}

/* ------------------------------------------------------------------ */
/* Signal extraction + risk scoring                                    */
/* ------------------------------------------------------------------ */

function rowKey(row) {
  return `${row.handle}::${row.slot}`;
}

function annotateSignals(rows, clusters, catalog) {
  const handles = new Set(Object.keys(catalog.products ?? {}));
  const byKey = new Map(rows.map((r) => [rowKey(r), r]));

  // Index rows by handle for per-product checks
  const byHandle = new Map();
  for (const row of rows) {
    const list = byHandle.get(row.handle) ?? [];
    list.push(row);
    byHandle.set(row.handle, list);
  }

  /* Exact-URL and exact-bytes cross-product duplicates */
  for (const [urlPath, list] of clusters.byUrl) {
    const handlesInCluster = new Set(list.map((r) => r.handle));
    if (list.length < 2) continue;

    if (handlesInCluster.size > 1) {
      for (const row of list) {
        row.signals.push({
          type: 'cross_product_same_url',
          detail: `Same Shopify CDN pathname used by ${handlesInCluster.size} products`,
          urlPath,
          members: list.map((r) => ({handle: r.handle, slot: r.slot})),
        });
      }
    } else {
      // within-product same URL
      for (const row of list) {
        row.signals.push({
          type: 'within_product_same_url',
          detail: 'Same Shopify CDN URL used in multiple slots of this product',
          urlPath,
          slots: list.map((r) => r.slot),
        });
      }
    }
  }

  for (const [sha, list] of clusters.byHash) {
    if (list.length < 2) continue;
    const handlesInCluster = new Set(list.map((r) => r.handle));
    if (handlesInCluster.size > 1) {
      for (const row of list) {
        row.signals.push({
          type: 'cross_product_same_bytes',
          detail: `Byte-identical file used by ${handlesInCluster.size} products`,
          sha256: sha,
          members: list.map((r) => ({handle: r.handle, slot: r.slot})),
        });
      }
    } else {
      for (const row of list) {
        row.signals.push({
          type: 'within_product_same_bytes',
          detail: 'Byte-identical file in multiple slots of this product',
          sha256: sha,
          slots: list.map((r) => r.slot),
        });
      }
    }
  }

  /* Near-dup clusters (dHash) */
  for (const cluster of clusters.nearDupClusters) {
    const handlesIn = new Set(cluster.members.map((r) => r.handle));
    const byBytes = new Set(cluster.members.map((r) => r.sha256).filter(Boolean));
    // If every member has the same sha256, the exact check already covered it.
    if (byBytes.size <= 1 && cluster.members.every((m) => m.sha256)) continue;
    for (const row of cluster.members) {
      row.signals.push({
        type:
          handlesIn.size > 1
            ? 'cross_product_near_dup'
            : 'within_product_near_dup',
        detail: `Perceptually near-identical (dHash ≤ ${cluster.distance})`,
        members: cluster.members.map((r) => ({
          handle: r.handle,
          slot: r.slot,
          dHashHex: r.dHashHex,
        })),
      });
    }
  }

  /* Token contradiction: filename mentions different mk version than handle */
  for (const row of rows) {
    const blob = `${row.shopifyUrl || ''} ${row.localPath || ''}`.toLowerCase();
    const handleVer = row.handle.match(VERSION_TOKEN_RE);
    const assetVer = blob.match(VERSION_TOKEN_RE);
    if (handleVer && assetVer && handleVer[1] !== assetVer[1]) {
      row.signals.push({
        type: 'version_token_contradiction',
        detail: `Handle says mk${handleVer[1]} but asset filename says mk${assetVer[1]}`,
        handleToken: `mk${handleVer[1]}`,
        assetToken: `mk${assetVer[1]}`,
      });
    }
  }

  /* Token contradiction: filename contains another product's handle as substring */
  const handleList = [...handles].filter((h) => h.length >= 4);
  for (const row of rows) {
    const blob = `${row.shopifyUrl || ''} ${row.localPath || ''}`.toLowerCase();
    // Find any *other* handle that appears as a dash-delimited token sequence
    for (const other of handleList) {
      if (other === row.handle) continue;
      const ownTokens = row.handle.split('-');
      const otherTokens = other.split('-');
      // Skip noisy short fragments; require uniqueness against own handle
      if (otherTokens.length < 2) continue;
      if (ownTokens.includes(other)) continue;
      // Require the full dashed-token sequence in the asset blob
      if (!blob.includes(other)) continue;
      // And the asset must NOT contain our own handle as a more specific prefix.
      if (blob.includes(row.handle)) continue;
      row.signals.push({
        type: 'filename_references_other_handle',
        detail: `Asset filename references unrelated product handle "${other}"`,
        otherHandle: other,
      });
      break;
    }
  }

  /* Alt text quality */
  for (const row of rows) {
    if (GENERIC_ALT_RE.test((row.alt || '').trim())) {
      row.signals.push({
        type: 'generic_or_empty_alt',
        detail: row.alt ? `Generic alt "${row.alt}"` : 'Empty alt',
      });
    }
  }

  /* Placement: illustration in slot 0 when photo-style media exists later */
  for (const [handle, items] of byHandle) {
    const sorted = [...items].sort(
      (a, b) => (a.slot ?? 0) - (b.slot ?? 0),
    );
    if (sorted.length < 2) continue;
    const first = sorted[0];
    const firstName =
      (first.shopifyFileName || '') + ' ' + (first.localFileName || '');
    const isFirstIllustration = hasIllustrationToken(firstName);
    if (!isFirstIllustration) continue;
    const laterPhoto = sorted
      .slice(1)
      .find((r) =>
        hasPhotoToken(
          (r.shopifyFileName || '') + ' ' + (r.localFileName || ''),
        ),
      );
    if (laterPhoto) {
      first.signals.push({
        type: 'illustration_before_photo',
        detail: `Slot 0 looks illustration-like; slot ${laterPhoto.slot} looks photo-like`,
        betterSlot: laterPhoto.slot,
        betterFile: laterPhoto.shopifyFileName,
      });
    }
  }

  /* Hero quality heuristic: materially higher-res later slot */
  for (const [handle, items] of byHandle) {
    const sorted = [...items].sort(
      (a, b) => (a.slot ?? 0) - (b.slot ?? 0),
    );
    if (sorted.length < 2) continue;
    const hero = sorted[0];
    if (!hero.width || !hero.height) continue;
    const heroArea = hero.width * hero.height;
    let best = hero;
    let bestArea = heroArea;
    for (const cand of sorted.slice(1)) {
      if (!cand.width || !cand.height) continue;
      const a = cand.width * cand.height;
      if (a > bestArea) {
        best = cand;
        bestArea = a;
      }
    }
    if (best !== hero && bestArea >= heroArea * 3) {
      hero.signals.push({
        type: 'higher_res_later_slot',
        detail: `Slot ${best.slot} has ${Math.round(
          bestArea / heroArea,
        )}× the pixel area of the hero (${heroArea.toLocaleString()} → ${bestArea.toLocaleString()})`,
        betterSlot: best.slot,
        heroArea,
        bestArea,
      });
    }
  }

  /* Score + tier + recommended actions */
  for (const row of rows) {
    scoreRow(row);
  }

  return rows;
}

function scoreRow(row) {
  let score = 0;
  const reasons = [];

  for (const sig of row.signals) {
    switch (sig.type) {
      case 'version_token_contradiction':
        score += 40;
        reasons.push('version_mismatch');
        break;
      case 'filename_references_other_handle':
        score += 25;
        reasons.push('wrong_handle_token');
        break;
      case 'cross_product_same_url':
      case 'cross_product_same_bytes':
        score += 18;
        reasons.push('cross_product_duplicate');
        break;
      case 'cross_product_near_dup':
        score += 12;
        reasons.push('cross_product_near_dup');
        break;
      case 'within_product_same_url':
      case 'within_product_same_bytes':
        score += 10;
        reasons.push('within_product_duplicate');
        break;
      case 'within_product_near_dup':
        score += 6;
        reasons.push('within_product_near_dup');
        break;
      case 'illustration_before_photo':
        score += 8;
        reasons.push('reorder_hero');
        break;
      case 'higher_res_later_slot':
        score += 6;
        reasons.push('reorder_hero_resolution');
        break;
      case 'generic_or_empty_alt':
        score += 2;
        reasons.push('alt_quality');
        break;
      case 'hash_error':
        score += 1;
        reasons.push('hash_error');
        break;
      default:
        break;
    }
  }

  // Boost score for runtime-exposed issues (what customers actually see)
  if (row.runtimeExposed && score > 0) score += 5;
  // Boost further if this is the hero slot and the product is visible+active
  if (row.slot === 0 && row.isVisible && row.isActive && score > 0) score += 5;

  row.riskScore = score;
  row.riskReasons = [...new Set(reasons)];

  // Tiers
  if (row.riskReasons.includes('version_mismatch')) {
    row.tier = 'P0';
  } else if (
    row.riskReasons.includes('wrong_handle_token') ||
    row.riskReasons.includes('cross_product_duplicate')
  ) {
    row.tier = 'P1';
  } else if (
    row.riskReasons.includes('cross_product_near_dup') ||
    row.riskReasons.includes('within_product_duplicate')
  ) {
    row.tier = 'P2';
  } else if (
    row.riskReasons.includes('within_product_near_dup') ||
    row.riskReasons.includes('reorder_hero') ||
    row.riskReasons.includes('reorder_hero_resolution')
  ) {
    row.tier = 'P3';
  } else if (score > 0) {
    row.tier = 'P4';
  }

  // Recommended actions (non-exclusive)
  const actions = new Set();
  if (row.riskReasons.includes('version_mismatch')) actions.add('replace');
  if (row.riskReasons.includes('wrong_handle_token')) actions.add('replace');
  if (row.riskReasons.includes('within_product_duplicate')) actions.add('remove');
  if (row.riskReasons.includes('within_product_near_dup')) actions.add('remove');
  if (row.riskReasons.includes('cross_product_duplicate'))
    actions.add('manual-review');
  if (row.riskReasons.includes('cross_product_near_dup'))
    actions.add('manual-review');
  if (row.riskReasons.includes('reorder_hero')) actions.add('reorder');
  if (row.riskReasons.includes('reorder_hero_resolution'))
    actions.add('reorder');
  row.actions = [...actions];
}

/* ------------------------------------------------------------------ */
/* Remediation planner                                                 */
/* ------------------------------------------------------------------ */

/**
 * Translate findings into Shopify Admin operations.
 *
 * Operation kinds:
 *   - delete:  drop one or more mediaShopifyIds on a product (for
 *              within-product exact-bytes duplicates).
 *   - reorder: move the preferred slot to position 0 when the hero is
 *              clearly a smaller / illustration-style asset.
 *   - replace: hero is wrong media entirely (version mismatch or
 *              cross-product wrong-handle) — a human must source a new
 *              asset; we emit the delete of the bad one plus a NOTE.
 *   - manual-review: cross-product duplicates that need merchant decision.
 *
 * Every operation carries `productShopifyId`, `handle`, `evidence`, and
 * where applicable `mediaShopifyIds`, so a downstream applier can act
 * without re-computing signals.
 */
/**
 * Load the suppression list that lets humans explicitly accept a flagged
 * (handle, slot[, kind]) combo as intentional (e.g. merchandising cross-reference
 * or accepted shared asset with alt-text disclosure). Entries are matched by
 * exact handle + slot; if `kind` is present it must also match. Matching
 * operations are moved from the actionable plan to a suppressed list with the
 * human-supplied reason attached.
 */
function loadSuppressions() {
  if (!existsSync(SUPPRESSIONS_PATH)) return {entries: [], path: null};
  let raw;
  try {
    raw = readJson(SUPPRESSIONS_PATH);
  } catch (error) {
    process.stderr.write(
      `[audit] ignoring invalid suppressions file (${error.message})\n`,
    );
    return {entries: [], path: null};
  }
  const entries = Array.isArray(raw?.suppressions) ? raw.suppressions : [];
  return {entries, path: SUPPRESSIONS_PATH};
}

function matchSuppression(op, entries) {
  for (const e of entries) {
    if (!e || e.handle !== op.handle) continue;
    if (Number.isFinite(e.slot) && e.slot !== op.slot) continue;
    if (e.kind && e.kind !== op.kind) continue;
    return e;
  }
  return null;
}

function applySuppressions(operations, entries) {
  if (!entries || entries.length === 0) {
    return {operations, suppressed: [], unmatched: []};
  }
  const remaining = [];
  const suppressed = [];
  const matchedIdx = new Set();
  for (const op of operations) {
    const match = matchSuppression(op, entries);
    if (match) {
      suppressed.push({
        ...op,
        suppression: {
          reason: match.reason ?? '',
          pattern: match.pattern ?? null,
          addedAt: match.addedAt ?? null,
        },
      });
      matchedIdx.add(entries.indexOf(match));
    } else {
      remaining.push(op);
    }
  }
  const unmatched = entries.filter((_, i) => !matchedIdx.has(i));
  return {operations: remaining, suppressed, unmatched};
}

function buildRemediationPlan(rows) {
  const byHandle = new Map();
  for (const row of rows) {
    if (!row.tier || row.tier === 'P4') continue;
    const list = byHandle.get(row.handle) ?? [];
    list.push(row);
    byHandle.set(row.handle, list);
  }

  const operations = [];

  for (const [handle, items] of byHandle) {
    const productShopifyId = items[0].productShopifyId;
    const title = items[0].title;
    const runtimeSource = items[0].runtimeSource;

    // 1) Within-product exact-bytes duplicates -> delete extras, keep lowest slot
    const bySha = new Map();
    for (const row of items) {
      if (!row.sha256) continue;
      const hasWithinDupe = row.signals.some(
        (s) =>
          s.type === 'within_product_same_bytes' ||
          s.type === 'within_product_same_url',
      );
      if (!hasWithinDupe) continue;
      const key = row.sha256 || row.shopifyUrlPath;
      const group = bySha.get(key) ?? [];
      group.push(row);
      bySha.set(key, group);
    }
    for (const [key, group] of bySha) {
      if (group.length < 2) continue;
      const sorted = [...group].sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
      const keep = sorted[0];
      const drops = sorted.slice(1).filter((r) => r.mediaShopifyId);
      if (drops.length === 0) continue;
      operations.push({
        kind: 'delete',
        handle,
        title,
        productShopifyId,
        runtimeSource,
        keepSlot: keep.slot,
        mediaShopifyIds: drops.map((r) => r.mediaShopifyId),
        dropSlots: drops.map((r) => r.slot),
        evidence: {
          reason: 'within-product exact duplicate',
          sha256: keep.sha256,
          localPaths: [keep.localPath, ...drops.map((r) => r.localPath)],
        },
      });
    }

    // 2) Version contradiction (P0) -> replace (delete bad, note new source)
    const versionMismatchRows = items.filter((r) =>
      r.signals.some((s) => s.type === 'version_token_contradiction'),
    );
    for (const row of versionMismatchRows) {
      if (!row.mediaShopifyId) continue;
      operations.push({
        kind: 'replace',
        handle,
        title,
        productShopifyId,
        runtimeSource,
        slot: row.slot,
        mediaShopifyIds: [row.mediaShopifyId],
        evidence: {
          reason: 'version token mismatch (handle vs asset filename)',
          shopifyUrl: row.shopifyUrl,
          localPath: row.localPath,
          signals: row.signals
            .filter((s) => s.type === 'version_token_contradiction')
            .map((s) => s.detail),
        },
        note:
          'The current hero is the wrong product version. A correct asset must be sourced for this SKU before deleting.',
      });
    }

    // 3) Illustration-first hero with a later photo -> reorder
    const illFirstRow = items.find((r) =>
      r.signals.some((s) => s.type === 'illustration_before_photo'),
    );
    if (illFirstRow) {
      const sig = illFirstRow.signals.find(
        (s) => s.type === 'illustration_before_photo',
      );
      const betterSlot = sig?.betterSlot;
      if (Number.isInteger(betterSlot)) {
        operations.push({
          kind: 'reorder',
          handle,
          title,
          productShopifyId,
          runtimeSource,
          move: {fromSlot: betterSlot, toSlot: 0},
          evidence: {
            reason: 'illustration-style slot 0 with photo-style asset later',
            detail: sig.detail,
          },
        });
      }
    }

    // 4) Hero resolution much smaller than a later slot -> reorder (skip if already handled by (3))
    const resFirstRow = items.find((r) =>
      r.signals.some((s) => s.type === 'higher_res_later_slot'),
    );
    if (resFirstRow && !illFirstRow) {
      const sig = resFirstRow.signals.find(
        (s) => s.type === 'higher_res_later_slot',
      );
      const betterSlot = sig?.betterSlot;
      if (Number.isInteger(betterSlot)) {
        operations.push({
          kind: 'reorder',
          handle,
          title,
          productShopifyId,
          runtimeSource,
          move: {fromSlot: betterSlot, toSlot: 0},
          evidence: {
            reason: 'hero is materially lower-resolution than a later slot',
            detail: sig.detail,
          },
        });
      }
    }

    // 5) Cross-product duplicates -> manual-review (we don't auto-plan these)
    const crossDupRow = items.find((r) =>
      r.signals.some(
        (s) =>
          s.type === 'cross_product_same_url' ||
          s.type === 'cross_product_same_bytes',
      ),
    );
    if (crossDupRow) {
      const sigs = crossDupRow.signals.filter(
        (s) =>
          s.type === 'cross_product_same_url' ||
          s.type === 'cross_product_same_bytes',
      );
      const otherHandles = new Set();
      for (const s of sigs) {
        for (const m of s.members ?? []) {
          if (m.handle !== handle) otherHandles.add(m.handle);
        }
      }
      operations.push({
        kind: 'manual-review',
        handle,
        title,
        productShopifyId,
        runtimeSource,
        slot: crossDupRow.slot,
        otherHandles: [...otherHandles],
        evidence: {
          reason: 'asset shared across multiple products',
          detail: sigs.map((s) => s.detail).join('; '),
        },
        note:
          'Merchant decision: is this placeholder reuse intentional (e.g., generic panel) or a wrong-asset assignment? Replace if not intentional.',
      });
    }
  }

  return operations;
}

function adminUrl(storeDomain, productShopifyId) {
  if (!productShopifyId || !storeDomain) return null;
  const numericId = productShopifyId.split('/').pop();
  return `https://${storeDomain}/admin/products/${numericId}`;
}

function adminLocatorText(productShopifyId) {
  if (!productShopifyId) return '';
  const numericId = productShopifyId.split('/').pop();
  return `Shopify Admin > Products > id:${numericId}`;
}

function buildRemediationMarkdown({
  operations,
  runAt,
  storeDomain,
  suppressed = [],
  staleSuppressions = [],
}) {
  const byKind = new Map();
  for (const op of operations) {
    const list = byKind.get(op.kind) ?? [];
    list.push(op);
    byKind.set(op.kind, list);
  }

  const byHandle = new Map();
  for (const op of operations) {
    const list = byHandle.get(op.handle) ?? [];
    list.push(op);
    byHandle.set(op.handle, list);
  }

  const lines = [];
  lines.push('# Product gallery remediation playbook');
  lines.push('');
  lines.push(`**Generated:** ${runAt}  `);
  lines.push(
    `**Source:** \`${relRepo(JSON_OUT)}\` and \`${relRepo(REMEDIATION_JSON_OUT)}\``,
  );
  lines.push('');
  lines.push(
    'Each operation carries concrete Shopify media GIDs and product GIDs so it can be executed either by hand in Shopify Admin or via `yarn shopify:sync:gallery-apply --apply` (subcommand of `scripts/shopify-sync.mjs`).',
  );
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total actionable operations: **${operations.length}**`);
  for (const kind of ['delete', 'replace', 'reorder', 'manual-review']) {
    lines.push(`- ${kind}: **${(byKind.get(kind) ?? []).length}**`);
  }
  if (suppressed.length > 0) {
    lines.push(
      `- Suppressed (intentional per \`audit/product-gallery-suppressions.json\`): **${suppressed.length}**`,
    );
  }
  if (staleSuppressions.length > 0) {
    lines.push(
      `- Stale suppressions (no matching op — safe to delete): **${staleSuppressions.length}**`,
    );
  }
  lines.push('');
  lines.push('## By product');
  lines.push('');

  const sortedHandles = [...byHandle.keys()].sort();
  for (const handle of sortedHandles) {
    const ops = byHandle.get(handle);
    const title = ops[0].title;
    const pid = ops[0].productShopifyId;
    const admin = adminUrl(storeDomain, pid);
    const runtime = ops[0].runtimeSource;
    const locatorSuffix = admin
      ? ` — [Admin](${admin})`
      : pid
        ? ` — ${adminLocatorText(pid)}`
        : '';
    lines.push(`### \`${handle}\` — ${title}`);
    lines.push('');
    lines.push(`- Product: \`${pid ?? 'unknown'}\`${locatorSuffix}`);
    lines.push(
      `- Runtime: **${runtime}**${runtime === 'lfs' ? ' (customer-facing gallery uses LFS; these are mirror-side fixes)' : ' (customer-facing)'}`,
    );
    lines.push('');
    for (const op of ops) {
      switch (op.kind) {
        case 'delete':
          lines.push(
            `- [ ] **Delete duplicate slots** ${op.dropSlots.join(', ')}; keep slot ${op.keepSlot}.`,
          );
          lines.push(`  - Evidence: ${op.evidence.reason}.`);
          lines.push(
            `  - Shopify media IDs to delete: ${op.mediaShopifyIds.map((id) => `\`${id}\``).join(', ')}`,
          );
          break;
        case 'replace':
          lines.push(
            `- [ ] **Replace slot ${op.slot}** (delete current + upload correct asset).`,
          );
          lines.push(`  - Evidence: ${op.evidence.reason} (${op.evidence.signals?.join('; ')}).`);
          lines.push(
            `  - Current Shopify media ID: ${op.mediaShopifyIds.map((id) => `\`${id}\``).join(', ')}`,
          );
          lines.push(`  - NOTE: ${op.note}`);
          break;
        case 'reorder':
          lines.push(
            `- [ ] **Reorder**: move slot ${op.move.fromSlot} to slot ${op.move.toSlot}.`,
          );
          lines.push(`  - Evidence: ${op.evidence.reason}. ${op.evidence.detail}`);
          break;
        case 'manual-review':
          lines.push(
            `- [ ] **Manual review** (slot ${op.slot}): asset shared with \`${op.otherHandles.join('`, `')}\`.`,
          );
          lines.push(`  - ${op.evidence.detail}`);
          lines.push(`  - ${op.note}`);
          break;
        default:
          break;
      }
    }
    lines.push('');
  }

  if (suppressed.length > 0) {
    lines.push('## Suppressed (intentional)');
    lines.push('');
    lines.push(
      'These operations were previously actionable but have been marked intentional in `audit/product-gallery-suppressions.json`. They are excluded from the by-product list above. To re-surface, remove the matching entry from the suppressions file.',
    );
    lines.push('');
    const suppByHandle = new Map();
    for (const op of suppressed) {
      const list = suppByHandle.get(op.handle) ?? [];
      list.push(op);
      suppByHandle.set(op.handle, list);
    }
    for (const handle of [...suppByHandle.keys()].sort()) {
      const ops = suppByHandle.get(handle);
      lines.push(`- \`${handle}\``);
      for (const op of ops) {
        const slot = Number.isFinite(op.slot) ? ` slot ${op.slot}` : '';
        const pattern = op.suppression?.pattern
          ? ` _[${op.suppression.pattern}]_`
          : '';
        lines.push(
          `  - ${op.kind}${slot}${pattern}: ${op.suppression?.reason ?? ''}`,
        );
      }
    }
    lines.push('');
  }

  if (staleSuppressions.length > 0) {
    lines.push('## Stale suppressions');
    lines.push('');
    lines.push(
      'These suppression entries did not match any current operation. They are safe to delete from `audit/product-gallery-suppressions.json` (the underlying issue has been resolved or the data has moved).',
    );
    lines.push('');
    for (const s of staleSuppressions) {
      lines.push(
        `- \`${s.handle}\` slot ${s.slot ?? '*'} kind ${s.kind ?? '*'} — ${s.reason ?? ''}`,
      );
    }
    lines.push('');
  }

  lines.push('## How to apply');
  lines.push('');
  lines.push(
    'All execution goes through the repo Shopify CLI (`scripts/shopify-sync.mjs`), same auth path as every other store mutation in this codebase.',
  );
  lines.push('');
  lines.push('Dry-run (safe default):');
  lines.push('');
  lines.push('```bash');
  lines.push('yarn shopify:sync:gallery-apply');
  lines.push('```');
  lines.push('');
  lines.push('Execute a single product (requires admin credentials in `.env`):');
  lines.push('');
  lines.push('```bash');
  lines.push(
    'yarn shopify:sync gallery-apply --handle <product-handle> --apply',
  );
  lines.push('```');
  lines.push('');
  lines.push('Execute all auto-plannable ops (delete + reorder):');
  lines.push('');
  lines.push('```bash');
  lines.push('yarn shopify:sync gallery-apply --kinds delete,reorder --apply');
  lines.push('```');
  lines.push('');
  lines.push(
    'After any apply, refresh the local mirror and regenerate the audit:',
  );
  lines.push('');
  lines.push('```bash');
  lines.push('yarn shopify:sync:pull');
  lines.push('yarn catalog:bootstrap');
  lines.push('yarn audit:product-galleries');
  lines.push('```');
  lines.push('');

  return lines.join('\n') + '\n';
}

/* ------------------------------------------------------------------ */
/* Report generation                                                   */
/* ------------------------------------------------------------------ */

function groupFindings(rows) {
  const withIssues = rows.filter((r) => r.tier && r.tier !== 'P4');
  const byTier = new Map();
  for (const r of withIssues) {
    const list = byTier.get(r.tier) ?? [];
    list.push(r);
    byTier.set(r.tier, list);
  }
  for (const list of byTier.values()) {
    list.sort((a, b) => b.riskScore - a.riskScore);
  }
  return byTier;
}

function buildMarkdown({rows, catalog, lfsManifest, runAt, clusters}) {
  const byTier = groupFindings(rows);
  const total = rows.length;
  const productCount = Object.keys(catalog.products ?? {}).length;
  const lfsCount = Object.values(lfsManifest.products ?? {}).filter(
    (p) => Array.isArray(p.gallery) && p.gallery.length > 0,
  ).length;

  const runtimeExposed = rows.filter((r) => r.runtimeExposed).length;
  const flaggedRuntime = rows.filter(
    (r) => r.runtimeExposed && r.tier && r.tier !== 'P4',
  ).length;

  const lines = [];
  lines.push('# Product gallery media audit');
  lines.push('');
  lines.push(`**Generated:** ${runAt}  `);
  lines.push(
    `**Inputs:** \`${relRepo(CATALOG_PATH)}\` (${productCount} products, ${total} media items), \`${relRepo(LFS_MANIFEST_PATH)}\` (${lfsCount} products with runtime LFS media), \`${relRepo(CATALOG_PRODUCTS_DIR)}\`.`,
  );
  lines.push('');
  lines.push(
    'This report is produced by `node scripts/audit-product-galleries.mjs`. It layers four independent signals for each gallery slot: **exact identity** (Shopify CDN pathname + sha256 bytes), **near-duplicate** (8x8 dHash Hamming distance ≤ 6), **token contradictions** (handle/title vs filename), and **placement quality** (illustration-in-hero, higher-resolution-later). Each flagged row carries concrete evidence.',
  );
  lines.push('');
  lines.push(
    'Findings here are translated into concrete Shopify Admin operations in [`PRODUCT_GALLERY_REMEDIATION.md`](PRODUCT_GALLERY_REMEDIATION.md). Run `yarn shopify:sync:gallery-apply` (dry-run by default) to preview the fixes and add `--apply` to execute them via the repo Shopify CLI (`scripts/shopify-sync.mjs`).',
  );
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Media items scanned: **${total}**`);
  lines.push(`- Products (catalog.json): **${productCount}**`);
  lines.push(
    `- Runtime gallery source: LFS preferred for **${lfsCount}** products (see \`app/data/hub-product.server.ts\` \`buildMediaNodes\`); remainder served from catalog Shopify URLs.`,
  );
  lines.push(
    `- Media items currently served from catalog (customer-visible now): **${runtimeExposed}**`,
  );
  lines.push(`- Flagged runtime-visible items: **${flaggedRuntime}**`);
  lines.push('');
  for (const tier of ['P0', 'P1', 'P2', 'P3']) {
    const list = byTier.get(tier) ?? [];
    lines.push(`- ${tier}: **${list.length}** item(s)`);
  }
  lines.push('');

  lines.push('## Tier definitions');
  lines.push('');
  lines.push(
    '- **P0** — Almost certainly the wrong media (version or handle token contradiction).',
  );
  lines.push(
    '- **P1** — Same file or same handle reference across unrelated products; needs merchant decision.',
  );
  lines.push(
    '- **P2** — Duplicate within one product (remove a slot), or byte-identical across products.',
  );
  lines.push(
    '- **P3** — Near-duplicate clusters and ordering/hero-quality opportunities.',
  );
  lines.push('');
  lines.push(
    'A row may carry multiple signals; the listed tier is the highest-severity signal for that row.',
  );
  lines.push('');

  for (const tier of ['P0', 'P1', 'P2', 'P3']) {
    const list = byTier.get(tier) ?? [];
    lines.push(`## ${tier}`);
    lines.push('');
    if (list.length === 0) {
      lines.push('_No findings._');
      lines.push('');
      continue;
    }
    lines.push(
      '| Handle | Slot | Runtime | Score | Actions | Evidence |',
    );
    lines.push(
      '|--------|-----:|---------|------:|---------|----------|',
    );
    for (const r of list) {
      const evidence = r.signals
        .map((s) => summarizeSignal(s))
        .filter(Boolean)
        .join('; ');
      const runtime = r.runtimeExposed ? 'catalog' : 'lfs-masked';
      lines.push(
        `| \`${r.handle}\` | ${r.slot} | ${runtime} | ${r.riskScore} | ${
          r.actions.join(', ') || '—'
        } | ${truncate(evidence, 240)} |`,
      );
    }
    lines.push('');
  }

  // Duplicate cluster overview
  lines.push('## Duplicate clusters (informational)');
  lines.push('');
  const byHashClusters = [...clusters.byHash.entries()].filter(
    ([, v]) => v.length > 1,
  );
  const byUrlClusters = [...clusters.byUrl.entries()].filter(
    ([, v]) => v.length > 1,
  );
  lines.push(
    `- Exact-bytes clusters: **${byHashClusters.length}**, exact-URL clusters: **${byUrlClusters.length}**, near-duplicate clusters: **${clusters.nearDupClusters.length}**.`,
  );
  lines.push('');
  if (byHashClusters.length) {
    lines.push('### Byte-identical groups');
    lines.push('');
    for (const [sha, members] of byHashClusters.slice(0, 50)) {
      lines.push(`- \`${sha.slice(0, 10)}…\` (${members.length}):`);
      for (const m of members) {
        lines.push(`  - \`${m.handle}\` slot ${m.slot}: \`${m.localPath}\``);
      }
    }
    lines.push('');
  }

  lines.push('## How to re-run');
  lines.push('');
  lines.push('```bash');
  lines.push('yarn shopify:sync:pull         # refresh catalog/shopify/products/*');
  lines.push('yarn catalog:bootstrap         # rebuild app/data/generated/product-catalog.json');
  lines.push('yarn audit:product-galleries   # regenerate this report + audit-results/product-gallery-audit.json');
  lines.push('```');
  lines.push('');
  lines.push(
    'Skip perceptual hashing (faster, fewer near-dup results) with `node scripts/audit-product-galleries.mjs --skip-perceptual`.',
  );
  lines.push('');

  return lines.join('\n') + '\n';
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

function summarizeSignal(sig) {
  switch (sig.type) {
    case 'cross_product_same_url':
      return `cross-product same-URL (${new Set(sig.members.map((m) => m.handle)).size} products)`;
    case 'within_product_same_url':
      return `within-product same-URL (slots ${sig.slots?.join(',')})`;
    case 'cross_product_same_bytes':
      return `cross-product same-bytes (${new Set(sig.members.map((m) => m.handle)).size} products)`;
    case 'within_product_same_bytes':
      return `within-product same-bytes (slots ${sig.slots?.join(',')})`;
    case 'cross_product_near_dup':
      return `near-dup across ${new Set(sig.members.map((m) => m.handle)).size} products (dHash≤${sig.distance ?? 6})`;
    case 'within_product_near_dup':
      return `within-product near-dup (dHash≤${sig.distance ?? 6})`;
    case 'version_token_contradiction':
      return `version mismatch: handle ${sig.handleToken} vs asset ${sig.assetToken}`;
    case 'filename_references_other_handle':
      return `filename references "${sig.otherHandle}"`;
    case 'illustration_before_photo':
      return `illustration first; photo at slot ${sig.betterSlot}`;
    case 'higher_res_later_slot':
      return `hero is small; slot ${sig.betterSlot} is much larger`;
    case 'generic_or_empty_alt':
      return `generic alt`;
    case 'hash_error':
      return `hash error: ${sig.detail}`;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* JSON serialization (strip bulky binary fields)                      */
/* ------------------------------------------------------------------ */

function serializeRow(row) {
  const {dHash, absoluteLocal, ...rest} = row;
  return rest;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const runAt = new Date().toISOString();
  const catalog = readJson(CATALOG_PATH);
  const lfsManifest = existsSync(LFS_MANIFEST_PATH)
    ? readJson(LFS_MANIFEST_PATH)
    : {products: {}};

  process.stderr.write(
    `[audit] ${Object.keys(catalog.products ?? {}).length} products; hashing...\n`,
  );

  const {rows, excludedArchived} = buildInventory(catalog, lfsManifest);
  if (excludedArchived.length > 0) {
    process.stderr.write(
      `[audit] excluded ${excludedArchived.length} archived product(s): ${excludedArchived.join(', ')}\n`,
    );
  }
  await computeHashes(rows);
  const clusters = buildClusters(rows);
  annotateSignals(rows, clusters, catalog);

  const tiers = {P0: 0, P1: 0, P2: 0, P3: 0, P4: 0};
  for (const r of rows) if (r.tier) tiers[r.tier] = (tiers[r.tier] ?? 0) + 1;

  const machine = {
    generatedAt: runAt,
    inputs: {
      catalog: relRepo(CATALOG_PATH),
      lfsManifest: relRepo(LFS_MANIFEST_PATH),
      catalogProductsDir: relRepo(CATALOG_PRODUCTS_DIR),
    },
    options: {
      skipPerceptual: SKIP_PERCEPTUAL,
    },
    summary: {
      products: Object.keys(catalog.products ?? {}).length,
      productsAudited:
        Object.keys(catalog.products ?? {}).length - excludedArchived.length,
      archivedExcluded: excludedArchived.length,
      mediaItems: rows.length,
      localExists: rows.filter((r) => r.localExists).length,
      hashedBytes: rows.filter((r) => r.sha256).length,
      hashedPerceptual: rows.filter((r) => r.dHash).length,
      runtimeExposed: rows.filter((r) => r.runtimeExposed).length,
      tiers,
      clusterCounts: {
        exactUrlClusters: [...clusters.byUrl.values()].filter(
          (v) => v.length > 1,
        ).length,
        exactByteClusters: [...clusters.byHash.values()].filter(
          (v) => v.length > 1,
        ).length,
        nearDupClusters: clusters.nearDupClusters.length,
      },
    },
    findings: rows.map(serializeRow),
  };

  writeJson(JSON_OUT, machine);
  process.stderr.write(`[audit] wrote ${relRepo(JSON_OUT)}\n`);

  const rawOperations = buildRemediationPlan(rows);
  const {entries: suppressionEntries, path: suppressionsPath} =
    loadSuppressions();
  const {
    operations,
    suppressed,
    unmatched: unmatchedSuppressions,
  } = applySuppressions(rawOperations, suppressionEntries);
  if (suppressionEntries.length > 0) {
    process.stderr.write(
      `[audit] suppressions: ${suppressed.length}/${suppressionEntries.length} matched (${unmatchedSuppressions.length} stale)\n`,
    );
  }
  for (const stale of unmatchedSuppressions) {
    process.stderr.write(
      `[audit] stale suppression (no matching op): ${stale.handle} slot=${stale.slot ?? '*'} kind=${stale.kind ?? '*'}\n`,
    );
  }
  const remediation = {
    generatedAt: runAt,
    inputs: {
      auditJson: relRepo(JSON_OUT),
      storeDomain: process.env.PUBLIC_STORE_DOMAIN ?? null,
      suppressions: suppressionsPath ? relRepo(suppressionsPath) : null,
    },
    summary: {
      total: operations.length,
      byKind: operations.reduce((acc, op) => {
        acc[op.kind] = (acc[op.kind] ?? 0) + 1;
        return acc;
      }, {}),
      suppressed: suppressed.length,
      staleSuppressions: unmatchedSuppressions.length,
    },
    operations,
    suppressed,
    staleSuppressions: unmatchedSuppressions,
  };
  writeJson(REMEDIATION_JSON_OUT, remediation);
  process.stderr.write(`[audit] wrote ${relRepo(REMEDIATION_JSON_OUT)}\n`);

  if (!JSON_ONLY) {
    const md = buildMarkdown({rows, catalog, lfsManifest, runAt, clusters});
    mkdirSync(path.dirname(MD_OUT), {recursive: true});
    writeFileSync(MD_OUT, md);
    process.stderr.write(`[audit] wrote ${relRepo(MD_OUT)}\n`);

    const remMd = buildRemediationMarkdown({
      operations,
      runAt,
      storeDomain: process.env.PUBLIC_STORE_DOMAIN ?? null,
      suppressed,
      staleSuppressions: unmatchedSuppressions,
    });
    mkdirSync(path.dirname(REMEDIATION_MD_OUT), {recursive: true});
    writeFileSync(REMEDIATION_MD_OUT, remMd);
    process.stderr.write(`[audit] wrote ${relRepo(REMEDIATION_MD_OUT)}\n`);
  }

  // Print a compact summary to stdout for CI/pipeline consumption
  const flagged = rows.filter((r) => r.tier && r.tier !== 'P4');
  console.log(
    JSON.stringify(
      {
        products: machine.summary.products,
        media: machine.summary.mediaItems,
        tiers,
        flagged: flagged.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
