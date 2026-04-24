#!/usr/bin/env node
/**
 * Writes short Overview HTML to catalog/shopify/products/<handle>/description.html
 * and syncs product.json `description` (plain) for consistent pulls.
 * Optional: update seo.json description from PRODUCT_OVERVIEWS[].seoDescription.
 *
 * Usage:
 *   node scripts/apply-product-overviews.mjs
 *   node scripts/apply-product-overviews.mjs --dry-run
 */

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PRODUCT_OVERVIEWS} from './data/product-overviews.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

function truncateSeo(s, max = 160) {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}

function main() {
  let n = 0;
  for (const [handle, o] of Object.entries(PRODUCT_OVERVIEWS)) {
    const dir = path.join(REPO_ROOT, 'catalog/shopify/products', handle);
    const pPath = path.join(dir, 'product.json');
    const seoPath = path.join(dir, 'seo.json');
    if (!existsSync(pPath)) {
      console.warn(`skip: no ${handle} in catalog`);
      continue;
    }
    if (DRY) {
      console.log(`[dry-run] ${handle}`);
      n++;
      continue;
    }
    writeFileSync(
      path.join(dir, 'description.html'),
      o.html.trim() + '\n',
      'utf8',
    );
    const product = JSON.parse(readFileSync(pPath, 'utf8'));
    let seoOut = product.seo ? {...product.seo} : null;
    if (o.seoDescription && existsSync(seoPath)) {
      const seo = JSON.parse(readFileSync(seoPath, 'utf8'));
      const existingTitle = seo?.title ?? product.seo?.title ?? null;
      const next = {
        title:
          existingTitle && String(existingTitle).trim()
            ? existingTitle
            : `${product.title} | LZX Industries`,
        description: truncateSeo(o.seoDescription, 180),
      };
      writeFileSync(seoPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
      seoOut = next;
    }
    const out = {
      ...product,
      description: o.plain,
      ...(seoOut ? {seo: seoOut} : {}),
    };
    writeFileSync(pPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
    n++;
  }
  console.log(
    DRY
      ? `[dry-run] would update ${n} product(s).`
      : `Updated ${n} product description.html + product.json (and seo where set).`,
  );
}

main();
