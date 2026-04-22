#!/usr/bin/env node
/**
 * ingest-lfs-assets.mjs
 *
 * Build-time pipeline that copies web-shippable product assets from the
 * local-only `lfs/library/products/` mount into the deployed site:
 *
 *   lfs/library/products/<...>/<slug>/website/   → public/assets/products/<slug>/
 *   lfs/library/products/<...>/<slug>/downloads/ → public/downloads/products/<slug>/
 *
 * It also emits an asset manifest at
 *   app/data/generated/lfs-asset-manifest.json
 * keyed by product slug, so the rest of the app can resolve gallery
 * images and download lists without a second filesystem walk.
 *
 * `lfs/` is a developer-only mount (gitignored, never deployed). When
 * the mount is missing this script logs and exits 0, leaving any
 * previously committed assets and manifest in place. That is the
 * intended behaviour on Cloudflare Pages / Oxygen build runners.
 *
 * Usage:
 *   node scripts/ingest-lfs-assets.mjs              # copy + write manifest
 *   node scripts/ingest-lfs-assets.mjs --dry-run    # report only
 *   node scripts/ingest-lfs-assets.mjs --clean      # wipe public outputs first
 */

import {promises as fs} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const LFS_INDEX = path.join(REPO_ROOT, 'lfs/library/products/product-catalog.json');
const LFS_PRODUCTS_DIR = path.join(REPO_ROOT, 'lfs/library/products');
const PUBLIC_ASSETS_DIR = path.join(REPO_ROOT, 'public/assets/products');
const PUBLIC_DOWNLOADS_DIR = path.join(REPO_ROOT, 'public/downloads/products');
const OUT_MANIFEST = path.join(
  REPO_ROOT,
  'app/data/generated/lfs-asset-manifest.json',
);

// Raster formats are re-encoded to WebP at MAX_LONG_EDGE px (long edge,
// no upscale). SVG is copied verbatim. GIF is copied verbatim too — sharp
// only handles the first frame and we don't want to lose animation.
const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const PASSTHROUGH_IMG_EXT = new Set(['.svg', '.gif']);
const IMAGE_EXT = new Set([...RASTER_EXT, ...PASSTHROUGH_IMG_EXT]);
const DOWNLOAD_EXT = new Set([
  '.pdf', '.zip', '.uf2', '.csv', '.svg', '.sha256', '.txt', '.md',
]);

const MAX_LONG_EDGE = 2048;
const WEBP_QUALITY = 82;

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const CLEAN = args.has('--clean');
const FORCE = args.has('--force');

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function statOrNull(p) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, {withFileTypes: true});
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile()) yield p;
  }
}

async function rmDir(dir) {
  try {
    await fs.rm(dir, {recursive: true, force: true});
  } catch {
    /* ignore */
  }
}

/**
 * Process a single image:
 *   - SVG/GIF: passthrough (copy bytes as-is, same extension)
 *   - PNG/JPG/JPEG/WEBP/AVIF: resize (long-edge cap, no upscale) and
 *     re-encode to WebP at q=WEBP_QUALITY. Strips EXIF.
 *
 * Returns {buf, ext, width, height} where `ext` is the OUTPUT extension
 * (without dot).
 */
async function processImage(filePath, ext) {
  const sourceBuf = await fs.readFile(filePath);

  if (PASSTHROUGH_IMG_EXT.has(ext)) {
    return {buf: sourceBuf, ext: ext.slice(1), width: null, height: null};
  }

  // Raster: pipe through sharp
  const img = sharp(sourceBuf, {failOn: 'none'});
  const meta = await img.metadata();
  const longEdge = Math.max(meta.width || 0, meta.height || 0);

  let pipeline = img;
  if (longEdge > MAX_LONG_EDGE) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? MAX_LONG_EDGE : null,
      height: meta.height > meta.width ? MAX_LONG_EDGE : null,
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  const buf = await pipeline.webp({quality: WEBP_QUALITY}).toBuffer();
  const outMeta = await sharp(buf).metadata();
  return {
    buf,
    ext: 'webp',
    width: outMeta.width ?? null,
    height: outMeta.height ?? null,
  };
}


async function copyAssetsForSlug(slug, productFolder, prevManifest) {
  const sourceWebsite = path.join(LFS_PRODUCTS_DIR, productFolder, 'website');
  const sourceDownloads = path.join(LFS_PRODUCTS_DIR, productFolder, 'downloads');
  const destAssets = path.join(PUBLIC_ASSETS_DIR, slug);
  const destDownloads = path.join(PUBLIC_DOWNLOADS_DIR, slug);

  const galleryFiles = [];
  const downloadFiles = [];

  const prevGalleryBySource = new Map(
    (prevManifest?.gallery ?? []).map((g) => [g.sourcePath, g]),
  );

  // Images
  if (await exists(sourceWebsite)) {
    for await (const filePath of walk(sourceWebsite)) {
      const ext = path.extname(filePath).toLowerCase();
      if (!IMAGE_EXT.has(ext)) continue;

      const rel = path.relative(sourceWebsite, filePath);
      const sourcePath = path.relative(REPO_ROOT, filePath);
      const sourceBuf = await fs.readFile(filePath);
      const sourceSha = sha256(sourceBuf);

      const prev = prevGalleryBySource.get(sourcePath);
      const cacheHit =
        !FORCE &&
        prev?.sourceSha256 === sourceSha &&
        prev?.publicPath &&
        (await exists(path.join(REPO_ROOT, 'public', prev.publicPath.replace(/^\//, ''))));

      let outExt;
      let outBytes;
      let outSha;
      let width = null;
      let height = null;
      let target;

      if (cacheHit) {
        outExt = prev.ext;
        outBytes = prev.bytes;
        outSha = prev.sha256;
        width = prev.width ?? null;
        height = prev.height ?? null;
        target = path.join(REPO_ROOT, 'public', prev.publicPath.replace(/^\//, ''));
      } else {
        const processed = DRY_RUN
          ? {buf: sourceBuf, ext: PASSTHROUGH_IMG_EXT.has(ext) ? ext.slice(1) : 'webp', width: null, height: null}
          : await processImage(filePath, ext);
        outExt = processed.ext;
        outBytes = processed.buf.length;
        outSha = sha256(processed.buf);
        width = processed.width;
        height = processed.height;

        // Output filename: keep stem, replace extension
        const relNoExt = rel.slice(0, -ext.length);
        target = path.join(destAssets, `${relNoExt}.${outExt}`);

        if (!DRY_RUN) {
          await fs.mkdir(path.dirname(target), {recursive: true});
          await fs.writeFile(target, processed.buf);
        }
      }

      galleryFiles.push({
        publicPath: '/' + path.relative(path.join(REPO_ROOT, 'public'), target),
        sourcePath,
        sourceSha256: sourceSha,
        bytes: outBytes,
        sha256: outSha,
        ext: outExt,
        width,
        height,
        cached: cacheHit,
      });
    }
  }

  // Downloads (verbatim copy — never re-encoded)
  if (await exists(sourceDownloads)) {
    for await (const filePath of walk(sourceDownloads)) {
      const ext = path.extname(filePath).toLowerCase();
      if (!DOWNLOAD_EXT.has(ext)) continue;
      const rel = path.relative(sourceDownloads, filePath);
      const target = path.join(destDownloads, rel);
      const buf = await fs.readFile(filePath);
      const hash = sha256(buf);

      if (!DRY_RUN) {
        await fs.mkdir(path.dirname(target), {recursive: true});
        await fs.writeFile(target, buf);
      }
      downloadFiles.push({
        publicPath: '/' + path.relative(path.join(REPO_ROOT, 'public'), target),
        sourcePath: path.relative(REPO_ROOT, filePath),
        bytes: buf.length,
        sha256: hash,
        ext: ext.slice(1),
      });
    }
  }

  return {galleryFiles, downloadFiles};
}

async function main() {
  const startedAt = new Date().toISOString();

  // Soft-fail if lfs not mounted
  let index;
  try {
    index = JSON.parse(await fs.readFile(LFS_INDEX, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENODEV') {
      console.log('[ingest-lfs] lfs/ not mounted — skipping (build environment).');
      console.log('[ingest-lfs] any previously committed public/assets/products/** is preserved.');
      return;
    }
    throw err;
  }

  const products = index.products ?? [];
  console.log(`[ingest-lfs] lfs catalog reports ${products.length} products`);

  if (CLEAN && !DRY_RUN) {
    console.log('[ingest-lfs] --clean: wiping public/assets/products/ and public/downloads/products/');
    await rmDir(PUBLIC_ASSETS_DIR);
    await rmDir(PUBLIC_DOWNLOADS_DIR);
  }

  // Load previous manifest for incremental cache lookup
  let prevManifest = null;
  if (!CLEAN && !FORCE) {
    try {
      prevManifest = JSON.parse(await fs.readFile(OUT_MANIFEST, 'utf8'));
    } catch {
      prevManifest = null;
    }
  }

  const manifest = {
    version: 1,
    generatedAt: startedAt,
    source: 'lfs/library/products',
    products: {},
  };

  let totalImages = 0;
  let totalDownloads = 0;
  let totalBytes = 0;
  let totalCached = 0;
  const skipped = [];

  for (const entry of products) {
    const {slug, folder, name, product_type, category, is_active, is_hidden} = entry;
    if (!slug || !folder) {
      skipped.push(entry);
      continue;
    }

    const prevForSlug = prevManifest?.products?.[slug] ?? null;
    const {galleryFiles, downloadFiles} = await copyAssetsForSlug(
      slug,
      folder,
      prevForSlug,
    );
    totalImages += galleryFiles.length;
    totalDownloads += downloadFiles.length;
    for (const f of galleryFiles) {
      totalBytes += f.bytes;
      if (f.cached) totalCached += 1;
    }
    for (const f of downloadFiles) totalBytes += f.bytes;

    manifest.products[slug] = {
      name,
      productType: product_type ?? null,
      category: category ?? null,
      isActive: !!is_active,
      isHidden: !!is_hidden,
      sourceFolder: folder,
      gallery: galleryFiles,
      downloads: downloadFiles,
    };
  }

  if (skipped.length) {
    console.log(`[ingest-lfs] skipped ${skipped.length} entries (no slug/folder)`);
  }

  const manifestJson = JSON.stringify(manifest, null, 2) + '\n';

  if (DRY_RUN) {
    console.log(`[ingest-lfs] DRY RUN — would copy ${totalImages} images, ${totalDownloads} downloads (${(totalBytes / 1024 / 1024).toFixed(2)} MiB)`);
    return;
  }

  await fs.mkdir(path.dirname(OUT_MANIFEST), {recursive: true});
  await fs.writeFile(OUT_MANIFEST, manifestJson, 'utf8');

  console.log(`[ingest-lfs] processed ${totalImages} images (${totalCached} cached, ${totalImages - totalCached} re-encoded) → ${path.relative(REPO_ROOT, PUBLIC_ASSETS_DIR)}/`);
  console.log(`[ingest-lfs] copied ${totalDownloads} downloads → ${path.relative(REPO_ROOT, PUBLIC_DOWNLOADS_DIR)}/`);
  console.log(`[ingest-lfs] total output bytes: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`);
  console.log(`[ingest-lfs] wrote ${path.relative(REPO_ROOT, OUT_MANIFEST)}`);
}

main().catch((err) => {
  console.error('[ingest-lfs] fatal:', err);
  process.exit(1);
});
