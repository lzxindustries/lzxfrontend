#!/usr/bin/env node

import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const sourceRoot = path.resolve(repoRoot, 'data/lfs-library/products');
const outputPath = path.resolve(
  repoRoot,
  'docs/lfs-products-integration-audit.md',
);

const PRODUCT_SUPPLEMENTAL_ROOTS = {
  'alternate-frontpanel': [
    path.join(sourceRoot, 'accessories/alternate-frontpanels'),
  ],
  bitvision: [path.join(sourceRoot, 'instruments/bitvision')],
  'cadet-ix-vco': [
    path.join(
      sourceRoot,
      'eurorack-modules/cadet/cadet-ix-voltage-controlled-oscillator',
    ),
  ],
  'scroll-position-controller': [
    path.join(
      sourceRoot,
      'eurorack-modules/visionary/scroll-position-controller',
    ),
  ],
  tbc2: [path.join(sourceRoot, 'eurorack-modules/orion/tbc2')],
  'triple-video-interface': [
    path.join(sourceRoot, 'eurorack-modules/expedition/triple-video-interface'),
  ],
};

const MODULE_SERIES_SHARED_ROOTS = {
  cadet: [path.join(sourceRoot, 'eurorack-modules/cadet/brand')],
  expedition: [path.join(sourceRoot, 'eurorack-modules/expedition/packaging')],
  gen3: [path.join(sourceRoot, 'eurorack-modules/gen3/panel-art')],
  orion: [
    path.join(sourceRoot, 'eurorack-modules/orion/_ingest'),
    path.join(sourceRoot, 'eurorack-modules/orion/packaging'),
  ],
  visionary: [path.join(sourceRoot, 'eurorack-modules/visionary/brand')],
};

const PUBLISHED_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.jpg',
  '.jpeg',
  '.pdf',
  '.png',
  '.sha256',
  '.svg',
  '.uf2',
  '.webp',
  '.zip',
  '.csv',
]);
const GALLERY_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

main();

function main() {
  if (!existsSync(sourceRoot)) {
    throw new Error(`LFS source root not found: ${sourceRoot}`);
  }

  const allFiles = collectFilesRecursive(sourceRoot).filter(
    (filePath) => path.extname(filePath).toLowerCase() !== '.json',
  );
  const productFiles = collectFilesRecursive(sourceRoot)
    .filter((filePath) => filePath.endsWith('.json'))
    .filter(
      (filePath) => !filePath.endsWith(`${path.sep}product-catalog.json`),
    );
  const modulargridMetadataFiles = allFiles.filter(
    (filePath) =>
      filePath.endsWith(`${path.sep}metadata.md`) &&
      filePath.includes(`${path.sep}modulargrid${path.sep}`),
  );

  const siteCoverage = new Map();
  const shopifyGalleryCoverage = new Set();
  const ownerMap = new Map();
  const discoveredProductSlugs = new Set();
  const sharedSeriesRoots = new Set(
    Object.values(MODULE_SERIES_SHARED_ROOTS).flat(),
  );

  for (const filePath of productFiles.sort()) {
    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    const slug = stringValue(raw.slug);
    const name = stringValue(raw.name);
    if (!slug || !name) continue;
    discoveredProductSlugs.add(slug);

    const productDir = path.dirname(filePath);
    const productFilesOnDisk = collectFilesRecursive(productDir).filter(
      (childPath) => path.extname(childPath).toLowerCase() !== '.json',
    );

    for (const assetPath of productFilesOnDisk) {
      markOwner(ownerMap, assetPath, slug, name);
      markSiteCoverage(siteCoverage, assetPath, 'inventory');
    }

    const manifestEntries = flattenManifestEntries(raw.file_manifest, 'other');
    for (const entry of manifestEntries) {
      const relativePath = stringValue(entry.path);
      if (!relativePath) continue;

      const resolvedPath = path.resolve(productDir, relativePath);
      if (!existsSync(resolvedPath)) continue;

      markOwner(ownerMap, resolvedPath, slug, name);
      markSiteCoverage(
        siteCoverage,
        resolvedPath,
        `manifest:${entry.category}`,
      );

      if (isSeedGalleryImagePath(relativePath)) {
        shopifyGalleryCoverage.add(resolvedPath);
      }
    }

    const frontpanelPath = stringValue(raw.images?.frontpanel);
    if (frontpanelPath) {
      const resolvedPath = path.resolve(productDir, frontpanelPath);
      if (existsSync(resolvedPath)) {
        markOwner(ownerMap, resolvedPath, slug, name);
        markSiteCoverage(siteCoverage, resolvedPath, 'frontpanel');
        if (isGalleryImageExtension(resolvedPath)) {
          shopifyGalleryCoverage.add(resolvedPath);
        }
      }
    }

    for (const assetPath of productFilesOnDisk) {
      const relativePath = toPosix(path.relative(productDir, assetPath));
      if (isSeedGalleryImagePath(relativePath)) {
        shopifyGalleryCoverage.add(assetPath);
      }
    }

    for (const supplementalRoot of PRODUCT_SUPPLEMENTAL_ROOTS[slug] ?? []) {
      if (!existsSync(supplementalRoot)) continue;

      const supplementalFiles = collectFilesRecursive(supplementalRoot).filter(
        (childPath) => path.extname(childPath).toLowerCase() !== '.json',
      );

      for (const assetPath of supplementalFiles) {
        markOwner(ownerMap, assetPath, slug, name);
        markSiteCoverage(siteCoverage, assetPath, 'supplemental-inventory');

        const relativePath = toPosix(
          path.relative(supplementalRoot, assetPath),
        );
        if (isSeedGalleryImagePath(relativePath)) {
          shopifyGalleryCoverage.add(assetPath);
        }
      }
    }
  }

  for (const metadataPath of modulargridMetadataFiles) {
    const productRoot = path.dirname(path.dirname(metadataPath));
    const slug = path.basename(productRoot);

    if (
      discoveredProductSlugs.has(slug) ||
      sharedSeriesRoots.has(productRoot)
    ) {
      continue;
    }

    const productFilesOnDisk = collectFilesRecursive(productRoot).filter(
      (childPath) => path.extname(childPath).toLowerCase() !== '.json',
    );

    for (const assetPath of productFilesOnDisk) {
      markOwner(ownerMap, assetPath, slug, slug);
      markSiteCoverage(siteCoverage, assetPath, 'metadata-inventory');
    }
  }

  for (const [slug, roots] of Object.entries(PRODUCT_SUPPLEMENTAL_ROOTS)) {
    for (const root of roots) {
      if (!existsSync(root)) continue;

      const supplementalFiles = collectFilesRecursive(root).filter(
        (childPath) => path.extname(childPath).toLowerCase() !== '.json',
      );

      for (const assetPath of supplementalFiles) {
        markOwner(ownerMap, assetPath, slug, slug);
        markSiteCoverage(
          siteCoverage,
          assetPath,
          'synthetic-supplemental-inventory',
        );

        const relativePath = toPosix(path.relative(root, assetPath));
        if (isSeedGalleryImagePath(relativePath)) {
          shopifyGalleryCoverage.add(assetPath);
        }
      }
    }
  }

  for (const [series, roots] of Object.entries(MODULE_SERIES_SHARED_ROOTS)) {
    for (const root of roots) {
      if (!existsSync(root)) continue;

      const sharedFiles = collectFilesRecursive(root).filter(
        (childPath) => path.extname(childPath).toLowerCase() !== '.json',
      );

      for (const assetPath of sharedFiles) {
        markOwner(
          ownerMap,
          assetPath,
          `${series}-shared-archive`,
          `${series} shared archive`,
        );
        markSiteCoverage(siteCoverage, assetPath, 'series-archive');
      }
    }
  }

  const publishedFiles = allFiles.filter((filePath) =>
    isPublishedAsset(filePath),
  );
  const indexedOnlyFiles = allFiles.filter(
    (filePath) => siteCoverage.has(filePath) && !isPublishedAsset(filePath),
  );
  const missingFiles = allFiles.filter(
    (filePath) => !siteCoverage.has(filePath),
  );
  const galleryCandidateFiles = allFiles.filter((filePath) =>
    isSeedGalleryImagePath(toPosix(path.relative(sourceRoot, filePath))),
  );
  const coveredGalleryCandidateFiles = galleryCandidateFiles.filter(
    (filePath) => shopifyGalleryCoverage.has(filePath),
  );
  const galleryCandidateMisses = galleryCandidateFiles.filter(
    (filePath) => !shopifyGalleryCoverage.has(filePath),
  );

  const indexedByCategory = countBy(indexedOnlyFiles, (filePath) =>
    topLevelCategory(path.relative(sourceRoot, filePath)),
  );

  const lines = [
    '# LFS Product Integration Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Scope',
    '',
    'This report reflects the current product-library runtime and Shopify seed logic in the repository.',
    '',
    'Counted as site integrated:',
    '- Files surfaced directly with a published URL.',
    '- Files surfaced as indexed archive inventory on product pages.',
    '',
    'Counted as Shopify gallery covered:',
    '- Local images discoverable by the current seed path from frontpanel, `website/`, and `photos/` locations, including nested edition photo sets.',
    '',
    '## Executive Summary',
    '',
    `- Product JSON files scanned: ${productFiles.length}`,
    `- Non-JSON product-library files audited: ${allFiles.length}`,
    `- Files surfaced somewhere on the website: ${siteCoverage.size}`,
    `- Files with direct published links: ${publishedFiles.length}`,
    `- Files surfaced as indexed-only archive entries: ${indexedOnlyFiles.length}`,
    `- Files not surfaced anywhere on the website: ${missingFiles.length}`,
    `- Shopify gallery candidate files: ${galleryCandidateFiles.length}`,
    `- Shopify gallery candidate files covered by current seed path: ${coveredGalleryCandidateFiles.length}`,
    `- Shopify gallery candidate misses: ${galleryCandidateMisses.length}`,
    '',
    '## Readiness',
    '',
    missingFiles.length === 0
      ? '- Site coverage: all audited product-library files are now surfaced either as direct links or indexed archive entries.'
      : `- Site coverage: ${missingFiles.length} audited files are still missing from runtime surfaces.`,
    galleryCandidateMisses.length === 0
      ? '- Shopify gallery seed coverage: all local gallery-candidate product images are covered by the current seed path.'
      : `- Shopify gallery seed coverage: ${galleryCandidateMisses.length} gallery-candidate images are still outside the current seed path.`,
    '- Indexed-only assets are intentionally not emitted as web downloads when they are source formats or otherwise unsuitable for storefront delivery.',
    '',
    '## Indexed-Only Categories',
    '',
    ...formatCountMap(indexedByCategory),
    '',
    '## Residual Website Misses',
    '',
    ...(missingFiles.length === 0
      ? ['- None.']
      : missingFiles.map(
          (filePath) => `- ${formatOwnedFile(ownerMap, filePath)}`,
        )),
    '',
    '## Residual Shopify Gallery Misses',
    '',
    ...(galleryCandidateMisses.length === 0
      ? ['- None.']
      : galleryCandidateMisses.map(
          (filePath) => `- ${formatOwnedFile(ownerMap, filePath)}`,
        )),
  ];

  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
}

function collectFilesRecursive(directoryPath) {
  const entries = readdirSync(directoryPath, {withFileTypes: true});
  const files = [];

  for (const entry of entries) {
    const childPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFilesRecursive(childPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(childPath);
    }
  }

  return files;
}

function flattenManifestEntries(value, category) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((entry) => ({...entry, category}));
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenManifestEntries(child, `${category}.${key}`),
  );
}

function stringValue(value) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function toPosix(value) {
  return String(value).split(path.sep).join('/');
}

function isPublishedAsset(filePath) {
  return PUBLISHED_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function isGalleryImageExtension(filePath) {
  return GALLERY_IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function isSeedGalleryImagePath(relativePath) {
  const normalized = toPosix(relativePath).toLowerCase();
  if (!isGalleryImageExtension(normalized)) return false;

  const segments = normalized.split('/');
  return segments.includes('website') || segments.includes('photos');
}

function markSiteCoverage(map, filePath, reason) {
  const existing = map.get(filePath) ?? {reasons: new Set()};
  existing.reasons.add(reason);
  map.set(filePath, existing);
}

function markOwner(map, filePath, slug, name) {
  const existing = map.get(filePath) ?? new Map();
  existing.set(slug, name);
  map.set(filePath, existing);
}

function topLevelCategory(relativePath) {
  const normalized = toPosix(relativePath).replace(/^(\.\.\/)+/, '');
  return normalized.split('/').find(Boolean) ?? 'other';
}

function countBy(values, getKey) {
  const counts = new Map();

  for (const value of values) {
    const key = getKey(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
  );
}

function formatCountMap(entries) {
  if (entries.length === 0) {
    return ['- None.'];
  }

  return entries.map(([key, count]) => `- ${key}: ${count}`);
}

function formatOwnedFile(ownerMap, filePath) {
  const owners = ownerMap.get(filePath);
  const ownerLabel =
    owners && owners.size > 0
      ? ` (${[...owners.entries()]
          .map(([slug, name]) => `${name} / ${slug}`)
          .join('; ')})`
      : '';

  return `${toPosix(path.relative(sourceRoot, filePath))}${ownerLabel}`;
}
