#!/usr/bin/env node
/**
 * seed-local-from-pulled.mjs
 *
 * One-shot bootstrap that converts the existing
 * `catalog/shopify/products/<handle>/` mirror (produced by
 * `yarn shopify:sync:pull`) into the local-first content sources:
 *
 *   - app/data/generated/product-catalog.json   (committed; site reads this)
 *   - app/data/generated/product-catalog.manifest.json
 *   - app/data/pricing.json                     (committed; authored input)
 *
 * After the migration is complete the site never reads from
 * `catalog/shopify/products/`. That tree continues to exist as a
 * staging mirror for `yarn shopify:sync:push --apply`.
 *
 * Usage:
 *   node scripts/seed-local-from-pulled.mjs              # writes outputs
 *   node scripts/seed-local-from-pulled.mjs --dry-run    # prints summary only
 *   node scripts/seed-local-from-pulled.mjs --force      # overwrite pricing.json
 *
 * pricing.json is treated as authoring source: by default this script will
 * NOT overwrite an existing pricing.json. Pass --force to regenerate it
 * from Shopify's current variant prices (only useful during bootstrap).
 *
 * The product-catalog.json is treated as a build artifact: it is ALWAYS
 * regenerated.
 */

import {promises as fs} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const SOURCE_DIR = path.join(REPO_ROOT, 'catalog/shopify/products');
const OUT_DIR = path.join(REPO_ROOT, 'app/data/generated');
const OUT_CATALOG = path.join(OUT_DIR, 'product-catalog.json');
const OUT_MANIFEST = path.join(OUT_DIR, 'product-catalog.manifest.json');
const OUT_PRICING = path.join(REPO_ROOT, 'app/data/pricing.json');

// CLI flags
const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const FORCE_PRICING = args.has('--force');

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function readText(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasContent(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildFallbackDescriptionHtml(description) {
  if (!hasContent(description)) return '';

  return description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('\n');
}

/** Is this product "active" (non-discontinued, non-test)? */
function isActiveProduct(product) {
  if (!product) return false;
  if (product.status !== 'ACTIVE') return false;
  const tags = (product.tags || []).map((t) => String(t).toLowerCase());
  if (tags.includes('discontinued')) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* per-handle assembly                                                 */
/* ------------------------------------------------------------------ */

async function buildProductRecord(handle) {
  const dir = path.join(SOURCE_DIR, handle);
  const [product, variants, metafields, media, descriptionHtml, seo] =
    await Promise.all([
      readJson(path.join(dir, 'product.json')),
      readJson(path.join(dir, 'variants.json')),
      readJson(path.join(dir, 'metafields.json')),
      readJson(path.join(dir, 'media.json')),
      readText(path.join(dir, 'description.html')),
      readJson(path.join(dir, 'seo.json')),
    ]);

  if (!product) return null;

  const resolvedDescriptionHtml = hasContent(descriptionHtml)
    ? descriptionHtml
    : buildFallbackDescriptionHtml(product.description);

  // Index metafields as `${namespace}:${key}`
  const mfMap = {};
  for (const mf of metafields ?? []) {
    if (!mf?.namespace || !mf?.key) continue;
    mfMap[`${mf.namespace}:${mf.key}`] = {
      type: mf.type,
      value: mf.value,
    };
  }

  const subtitle = mfMap['descriptors:subtitle']?.value ?? null;

  const gallery = (media ?? []).map((entry, idx) => {
    const item = {
      type: entry.mediaContentType?.toLowerCase() || 'image',
      alt: entry.alt || entry.image?.altText || '',
      width: entry.image?.width ?? null,
      height: entry.image?.height ?? null,
      shopifyUrl: entry.image?.url ?? entry.originUrl ?? null,
      localPath: entry.localPath ?? null,
      position: idx,
    };
    if (entry.embeddedUrl) item.embeddedUrl = entry.embeddedUrl;
    if (entry.host) item.host = entry.host;
    if (entry.sources?.length) item.sources = entry.sources;
    return item;
  });

  const variantsOut = (variants ?? []).map((v) => ({
    shopifyVariantId: v.id,
    sku: v.sku || null,
    title: v.title,
    position: v.position ?? 0,
    selectedOptions: v.selectedOptions ?? [],
    barcode: v.barcode || null,
    inventoryPolicy: v.inventoryPolicy ?? null,
    taxable: v.taxable ?? true,
  }));

  const tags = product.tags ?? [];
  const tagsLower = tags.map((t) => String(t).toLowerCase());

  return {
    handle,
    shopifyProductId: product.id,
    title: product.title,
    vendor: product.vendor,
    productType: product.productType,
    status: product.status,
    tags,
    isActive: isActiveProduct(product),
    isVisible: tagsLower.includes('visible'),
    isBStock: tagsLower.includes('b-stock'),
    subtitle,
    descriptionHtml: resolvedDescriptionHtml,
    descriptionPlain: stripHtml(resolvedDescriptionHtml || product.description),
    seo: seo ?? product.seo ?? null,
    options: product.options ?? [],
    gallery,
    variants: variantsOut,
    metafields: mfMap,
    onlineStoreUrl: product.onlineStoreUrl ?? null,
    createdAt: product.createdAt ?? null,
    updatedAt: product.updatedAt ?? null,
  };
}

function pricingForProduct(handle, variants) {
  const entry = {variants: {}};
  for (const v of variants ?? []) {
    const key = v.sku || v.id; // SKU when present, fall back to GID
    entry.variants[key] = {
      title: v.title,
      price: v.price ?? null,
      compareAtPrice: v.compareAtPrice ?? null,
    };
  }
  return entry;
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const startedAt = new Date().toISOString();

  let entries;
  try {
    entries = await fs.readdir(SOURCE_DIR, {withFileTypes: true});
  } catch (err) {
    console.error(`[seed-local] cannot read ${SOURCE_DIR}: ${err.message}`);
    console.error(
      '[seed-local] run `yarn shopify:sync:pull` first to populate the mirror.',
    );
    process.exit(1);
  }

  const handles = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  console.log(`[seed-local] scanning ${handles.length} handles in ${SOURCE_DIR}`);

  const products = {};
  const pricing = {};
  const skipped = [];

  for (const handle of handles) {
    const record = await buildProductRecord(handle);
    if (!record) {
      skipped.push(handle);
      continue;
    }

    // Pull raw variants again for pricing (we discarded price during normalize)
    const rawVariants = await readJson(
      path.join(SOURCE_DIR, handle, 'variants.json'),
    );
    products[handle] = record;
    pricing[handle] = pricingForProduct(handle, rawVariants);
  }

  if (skipped.length) {
    console.log(`[seed-local] skipped ${skipped.length} (no product.json):`);
    for (const h of skipped) console.log(`  - ${h}`);
  }

  // Build catalog payload
  const catalog = {
    version: 1,
    generatedAt: startedAt,
    source: 'catalog/shopify/products',
    productCount: Object.keys(products).length,
    products,
  };

  // Stable JSON
  const catalogJson = JSON.stringify(catalog, null, 2) + '\n';
  const pricingJson = JSON.stringify(pricing, null, 2) + '\n';

  // Manifest: hash per ingested file so downstream processes can
  // cheaply detect changes to source content.
  const manifest = {
    version: 1,
    generatedAt: startedAt,
    catalogSha256: sha256(catalogJson),
    productCount: Object.keys(products).length,
  };
  const manifestJson = JSON.stringify(manifest, null, 2) + '\n';

  if (DRY_RUN) {
    console.log('[seed-local] DRY RUN — no files written');
    console.log(`[seed-local]   product-catalog.json: ${catalogJson.length} bytes`);
    console.log(`[seed-local]   pricing.json:         ${pricingJson.length} bytes`);
    console.log(`[seed-local]   manifest:             sha256=${manifest.catalogSha256.slice(0, 12)}...`);
    return;
  }

  await fs.mkdir(OUT_DIR, {recursive: true});
  await fs.writeFile(OUT_CATALOG, catalogJson, 'utf8');
  await fs.writeFile(OUT_MANIFEST, manifestJson, 'utf8');

  // Pricing: do not clobber existing authoring file unless --force
  const existingPricing = await readJson(OUT_PRICING);
  if (existingPricing && !FORCE_PRICING) {
    console.log(
      `[seed-local] ${path.relative(REPO_ROOT, OUT_PRICING)} already exists — keeping (pass --force to regenerate)`,
    );
  } else {
    await fs.writeFile(OUT_PRICING, pricingJson, 'utf8');
    console.log(`[seed-local] wrote ${path.relative(REPO_ROOT, OUT_PRICING)}`);
  }

  console.log(`[seed-local] wrote ${path.relative(REPO_ROOT, OUT_CATALOG)}`);
  console.log(`[seed-local] wrote ${path.relative(REPO_ROOT, OUT_MANIFEST)}`);
  console.log(
    `[seed-local] done — ${Object.keys(products).length} products, sha256=${manifest.catalogSha256.slice(0, 12)}...`,
  );
}

main().catch((err) => {
  console.error('[seed-local] fatal:', err);
  process.exit(1);
});
