#!/usr/bin/env node
/**
 * After `yarn shopify:sync:pull`, some products with only one variant
 * still have `position: 2` in the mirror. Shopify's `productSet` rejects
 * that ("Variant position must be between 1 and the number of variants").
 * This rewrites `catalog/shopify/products/<handle>/variants.json` for the
 * single-variant case only: set `position: 1`.
 *
 *   node scripts/normalize-single-variant-positions.mjs
 *   node scripts/normalize-single-variant-positions.mjs --dry-run
 */

import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PRODUCTS_DIR = path.join(REPO_ROOT, 'catalog/shopify/products');
const DRY_RUN = process.argv.includes('--dry-run');

const jsonOut = (value) => JSON.stringify(value, null, 2) + '\n';

async function main() {
  const entries = await fs.readdir(PRODUCTS_DIR, {withFileTypes: true});
  const dirs = entries.filter((d) => d.isDirectory()).map((d) => d.name);
  const changed = [];

  for (const handle of dirs) {
    const file = path.join(PRODUCTS_DIR, handle, 'variants.json');
    let raw;
    try {
      raw = await fs.readFile(file, 'utf8');
    } catch (e) {
      if (e && e.code === 'ENOENT') {
        continue;
      }
      throw e;
    }
    const variants = JSON.parse(raw);
    if (!Array.isArray(variants) || variants.length !== 1) {
      continue;
    }
    const v = variants[0];
    if (!v || typeof v !== 'object' || v.position === 1) {
      continue;
    }
    v.position = 1;
    if (DRY_RUN) {
      changed.push(`${handle} (would write ${file})`);
    } else {
      await fs.writeFile(file, jsonOut(variants), 'utf8');
      changed.push(handle);
    }
  }

  if (changed.length === 0) {
    console.log('normalize-single-variant-positions: no changes needed.');
  } else {
    console.log(
      DRY_RUN
        ? 'normalize-single-variant-positions: dry run — would update:'
        : 'normalize-single-variant-positions: updated handles:',
    );
    for (const line of changed) {
      console.log(`  ${line}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
