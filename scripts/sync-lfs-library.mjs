#!/usr/bin/env node
/**
 * Copy LFS library metadata (and curated binaries) into data/lfs-library/
 * so builds and tests never depend on a local lfs/ mount.
 *
 * Source defaults to repo-root lfs/ (symlink or folder). Override:
 *   node scripts/sync-lfs-library.mjs --source /path/to/lfs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DEST_ROOT = path.join(REPO_ROOT, 'data', 'lfs-library');

const SUPPLEMENTAL_DIRS = [
  'products/accessories/andor-1',
  'products/accessories/alternate-frontpanels',
  'products/instruments/bitvision',
  'products/eurorack-modules/cadet/cadet-ix-voltage-controlled-oscillator',
  'products/eurorack-modules/visionary/scroll-position-controller',
  'products/eurorack-modules/orion/tbc2',
  'products/eurorack-modules/expedition/triple-video-interface',
  'products/eurorack-modules/cadet/brand',
  'products/eurorack-modules/expedition/liquid-tv',
  'products/eurorack-modules/expedition/packaging',
  'products/eurorack-modules/gen3/panel-art',
  'products/eurorack-modules/orion/_ingest',
  'products/eurorack-modules/orion/packaging',
  'products/eurorack-modules/visionary/audio-frequency-decoder',
  'products/eurorack-modules/visionary/brand',
];

function parseArgs() {
  const args = process.argv.slice(2);
  let source = path.join(REPO_ROOT, 'lfs');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) {
      source = path.resolve(args[i + 1]);
      i++;
    }
  }
  return {source};
}

function ensureDir(p) {
  fs.mkdirSync(p, {recursive: true});
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyTree(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`skip missing: ${srcDir}`);
    return;
  }
  ensureDir(destDir);
  for (const ent of fs.readdirSync(srcDir, {withFileTypes: true})) {
    const s = path.join(srcDir, ent.name);
    const d = path.join(destDir, ent.name);
    if (ent.isDirectory()) copyTree(s, d);
    else if (ent.isFile()) copyFile(s, d);
  }
}

function copyProductTextMetadata(sourceLibrary) {
  const srcProducts = path.join(sourceLibrary, 'products');
  const destProducts = path.join(DEST_ROOT, 'products');
  if (!fs.existsSync(srcProducts)) {
    throw new Error(`Missing products dir: ${srcProducts}`);
  }

  function walk(dir, rel = '') {
    for (const ent of fs.readdirSync(dir, {withFileTypes: true})) {
      const r = path.join(rel, ent.name);
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full, r);
      } else if (ent.isFile()) {
        const lower = ent.name.toLowerCase();
        if (
          lower.endsWith('.json') ||
          (r.includes(`${path.sep}modulargrid${path.sep}`) &&
            ent.name === 'metadata.md')
        ) {
          copyFile(full, path.join(destProducts, r));
        }
      }
    }
  }

  walk(srcProducts);
  console.log(
    'Copied product JSON + modulargrid/metadata.md → data/lfs-library/products',
  );
}

function expandTagCandidates(handles) {
  const tagCandidates = new Set();
  for (const slug of handles) {
    tagCandidates.add(slug);
    tagCandidates.add(slug.replace(/-/g, ''));
    for (const t of slug.split('-').filter(Boolean)) tagCandidates.add(t);
  }
  return tagCandidates;
}

function copyForumTopics(sourceLibrary) {
  const srcTopics = path.join(sourceLibrary, 'scrape', 'community', 'topics');
  const destTopics = path.join(DEST_ROOT, 'scrape', 'community', 'topics');

  if (!fs.existsSync(srcTopics)) {
    console.warn(`skip forum topics (missing): ${srcTopics}`);
    return;
  }

  const catalogPath = path.join(
    REPO_ROOT,
    'catalog',
    'shopify',
    'catalog.json',
  );
  const handles = fs.existsSync(catalogPath)
    ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')).products?.map(
        (p) => p.handle,
      ) ?? []
    : [];
  const handleSet = new Set(handles);
  const tagCandidates = expandTagCandidates(handleSet);

  let kept = 0;
  for (const name of fs.readdirSync(srcTopics)) {
    if (!name.endsWith('.json')) continue;
    const full = path.join(srcTopics, name);
    const raw = JSON.parse(fs.readFileSync(full, 'utf8'));
    const slug = raw.slug ?? '';
    const tags = new Set((raw.tags ?? []).map((t) => t.slug).filter(Boolean));

    let include = slug.startsWith('all-about-');
    if (!include) {
      include = [...tags].some((t) => tagCandidates.has(t) || handleSet.has(t));
    }

    if (include) {
      copyFile(full, path.join(destTopics, name));
      kept++;
    }
  }
  console.log(
    `Copied ${kept} forum topic JSON files → data/lfs-library/scrape/community/topics`,
  );
}

function main() {
  const {source} = parseArgs();
  const sourceLibrary = path.join(source, 'library');
  if (!fs.existsSync(sourceLibrary)) {
    throw new Error(
      `LFS library not found at ${sourceLibrary}. Mount lfs/ or pass --source.`,
    );
  }

  ensureDir(DEST_ROOT);
  copyProductTextMetadata(sourceLibrary);

  for (const rel of SUPPLEMENTAL_DIRS) {
    const s = path.join(sourceLibrary, rel);
    const d = path.join(DEST_ROOT, rel);
    copyTree(s, d);
  }
  console.log('Copied supplemental / series asset trees');

  copyForumTopics(sourceLibrary);
  console.log('Done. Commit data/lfs-library/ for CI and production builds.');
}

main();
