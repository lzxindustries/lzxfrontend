#!/usr/bin/env node
/**
 * Add content/support/<slug>.md for SUPPORT_MANIFEST slugs that are missing
 * a file, using a short navigational FAQ (Manual + Specs + troubleshooting).
 * Skips if the file already exists.
 *
 * Usage: node scripts/generate-support-nav-stubs.mjs [--dry-run]
 */

import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

const CATALOG_HANDLE_BY_CANONICAL = {
  'double-vision': 'double-vision-system',
  'double-vision-168': 'double-vision-complete',
  pot: 'p',
};

function resolveCatalogHandle(canonical) {
  return CATALOG_HANDLE_BY_CANONICAL[canonical] ?? canonical;
}

const INSTRUMENT_SLUGS = new Set([
  'videomancer',
  'chromagnon',
  'vidiot',
  'double-vision',
  'double-vision-168',
  'double-vision-expander',
  'andor-1-media-player',
]);

function parseSupportManifestSlugs() {
  const src = readFileSync(
    path.join(REPO_ROOT, 'app/data/support-manifest.ts'),
    'utf8',
  );
  const keys = new Set();
  const re = /^\s{2}['"]?([a-z0-9-]+)['"]?:\s*\{/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

function supportPathForSlug(slug) {
  if (INSTRUMENT_SLUGS.has(slug)) {
    return (p) => `/instruments/${slug}/${p}`;
  }
  return (p) => `/modules/${slug}/${p}`;
}

function main() {
  const catalog = JSON.parse(
    readFileSync(
      path.join(REPO_ROOT, 'app/data/generated/product-catalog.json'),
      'utf8',
    ),
  );
  const products = catalog.products;
  const slugs = parseSupportManifestSlugs();
  let n = 0;
  for (const slug of [...slugs].sort()) {
    const fp = path.join(REPO_ROOT, 'content/support', `${slug}.md`);
    if (existsSync(fp)) continue;

    const handle = resolveCatalogHandle(slug);
    const pr = products[handle];
    const title = pr?.title || slug;
    const pathFn = supportPathForSlug(slug);
    const faq = `  - question: 'Where is the full documentation and specs for this product?'
    answer: |
      Open the [module manual](${pathFn('manual')}) and [Specs](${pathFn(
      'specs',
    )}) on this product hub. Global [troubleshooting](/docs/guides/troubleshooting) covers generic power and video paths. For community threads, see the [LZX forum](https://community.lzxindustries.net).`;

    const instrumentFaq = `  - question: 'Where is the full documentation for this product?'
    answer: |
      Use the [Manual](${pathFn('manual')}) and [Support](${pathFn(
      'support',
    )}) areas on this instrument hub, and the global [troubleshooting guide](/docs/guides/troubleshooting) for power and video paths. For community discussion, see the [LZX forum](https://community.lzxindustries.net).`;

    const body = `---
slug: ${slug}
setupPrerequisites:
  - 'Eurorack case with industry-standard ±12V power (where applicable to this product)'
faqItems:
${INSTRUMENT_SLUGS.has(slug) ? instrumentFaq : faq}
---

# ${title} — support

Triage and links for **${title}**. Add product-specific answers here over time; keep long explanations in the manual.
`;
    if (DRY) {
      console.log(`[dry-run] would create content/support/${slug}.md`);
      n++;
      continue;
    }
    mkdirSync(path.dirname(fp), {recursive: true});
    writeFileSync(fp, body, 'utf8');
    n++;
  }
  console.log(
    DRY
      ? `[dry-run] ${n} file(s) would be created.`
      : `Wrote ${n} support stub file(s).`,
  );
}

main();
