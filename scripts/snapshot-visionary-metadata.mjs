#!/usr/bin/env node
/**
 * Snapshot the Visionary-series ModularGrid metadata markdown files into a
 * single committed JSON file at
 *   app/data/generated/visionary-modulargrid-metadata.json
 *
 * This lets `app/data/module-specs.ts` synthesise spec rows for the historical
 * Visionary catalog without depending on `lfs/library/` at runtime/build time.
 *
 * Run when the underlying ModularGrid source changes:
 *   node scripts/snapshot-visionary-metadata.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const VISIONARY_DIR = path.join(
  REPO_ROOT,
  'lfs/library/products/eurorack-modules/visionary',
);
const OUT = path.join(
  REPO_ROOT,
  'app/data/generated/visionary-modulargrid-metadata.json',
);

async function main() {
  let entries;
  try {
    entries = await fs.readdir(VISIONARY_DIR, {withFileTypes: true});
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      console.error(`lfs source missing: ${VISIONARY_DIR}`);
      process.exit(1);
    }
    throw err;
  }

  const files = {};
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const md = path.join(VISIONARY_DIR, entry.name, 'modulargrid/metadata.md');
    let raw;
    try {
      raw = await fs.readFile(md, 'utf8');
    } catch (err) {
      if (err && err.code === 'ENOENT') continue;
      throw err;
    }
    files[entry.name] = raw;
  }

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source:
      'lfs/library/products/eurorack-modules/visionary/*/modulargrid/metadata.md',
    files,
  };

  await fs.mkdir(path.dirname(OUT), {recursive: true});
  await fs.writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(
    `wrote ${Object.keys(files).length} entries to ${path.relative(
      REPO_ROOT,
      OUT,
    )}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
