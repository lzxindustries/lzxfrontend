#!/usr/bin/env node
/**
 * Fill missing SEO in catalog/shopify/products/<handle>/seo.json from product title
 * and plain-text description. Updates product.json embedded `seo` when present.
 *
 * Usage: node scripts/fill-missing-seo.mjs [--dry-run]
 */

import {readFileSync, writeFileSync, readdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(REPO_ROOT, 'catalog/shopify/products');

const DRY = process.argv.includes('--dry-run');

function stripHtml(html) {
  if (!html) return '';
  return String(html)
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

function truncate(s, max) {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}

function needsFill(seo) {
  if (!seo || typeof seo !== 'object') return true;
  const t = seo.title && String(seo.title).trim();
  const d = seo.description && String(seo.description).trim();
  return !t || !d;
}

function main() {
  let updated = 0;
  const handles = readdirSync(SOURCE, {withFileTypes: true})
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const handle of handles) {
    const dir = path.join(SOURCE, handle);
    const prodPath = path.join(dir, 'product.json');
    const seoPath = path.join(dir, 'seo.json');
    const descHtmlPath = path.join(dir, 'description.html');
    if (!existsSync(prodPath)) continue;

    const product = JSON.parse(readFileSync(prodPath, 'utf8'));
    let seo = existsSync(seoPath)
      ? JSON.parse(readFileSync(seoPath, 'utf8'))
      : {title: null, description: null};

    if (product.seo?.title) {
      seo = {...seo, title: seo.title ?? product.seo.title};
    }
    if (product.seo?.description) {
      seo = {...seo, description: seo.description ?? product.seo.description};
    }

    if (!needsFill(seo)) continue;

    let descSource = product.description ?? '';
    if (existsSync(descHtmlPath)) {
      descSource = readFileSync(descHtmlPath, 'utf8');
    }
    const plainFromStore = stripHtml(descSource);

    const title = `${product.title} | LZX Industries`;
    const description = truncate(plainFromStore || product.title, 160);

    const next = {
      title: seo.title && String(seo.title).trim() ? seo.title : title,
      description:
        seo.description && String(seo.description).trim()
          ? seo.description
          : description,
    };

    if (DRY) {
      console.log(`[dry-run] ${handle}`);
      updated++;
      continue;
    }

    writeFileSync(seoPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
    const prodOut = {
      ...product,
      seo: {title: next.title, description: next.description},
    };
    writeFileSync(prodPath, JSON.stringify(prodOut, null, 2) + '\n', 'utf8');
    updated++;
  }

  console.log(
    DRY
      ? `[dry-run] ${updated} product(s) would be updated.`
      : `Updated SEO for ${updated} product(s).`,
  );
}

main();
