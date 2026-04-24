#!/usr/bin/env node
/**
 * Product content audit: hub slugs × catalog copy × docs × support.
 *
 * Registry logic mirrors app/data/product-slugs.ts; doc + draft handling mirrors
 * app/lib/content.server.ts (getDocPage / hasDocPagePath).
 * Keep the ACCESSORY / INSTRUMENT / OVERRIDE sets in sync with product-slugs.ts.
 *
 * Usage:
 *   node scripts/audit-product-content.mjs
 *   node scripts/audit-product-content.mjs --format=csv   # TSV to stdout
 */

import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// --- Keep in sync with app/data/product-slugs.ts ---

const ACCESSORY_NAMES = new Set([
  'Video Knob Pin',
  'Andor 1 Media Player Deluxe Accessories Pack',
  'DC Power Cable',
  'Gift Card',
  'RGB Patch Cable',
  'RCA Sync Cable',
  'Blank Panel',
  'Patch Cable',
  'RCA Video Cable',
  'Video Knob',
  'Power Entry 8HP',
  '14 Pin Sync Cable',
  '12V DC Adapter 3A',
  'Power & Sync Entry 12HP',
  'Alternate Frontpanel',
  'TBC2 Mk2 Fan Upgrade Kit',
  'TBC2 Mk1 Fan Upgrade Kit',
  'Chromagnon Patch',
  'Chromagnon Sticker',
  '8GB MicroSD Card',
  'Rack 84HP',
  'Bus 168 DIY Kit',
  'Vessel 84',
  'Vessel 168',
  'Vessel 208',
  'Vessel EuroRack PSU Expander',
]);

const INSTRUMENT_NAMES = new Set([
  'Videomancer',
  'Chromagnon',
  'Vidiot',
  'Double Vision System',
  'Double Vision 168',
  'Double Vision Expander',
  'Andor 1',
]);

const INSTRUMENT_SLUG_OVERRIDES = {
  'Andor 1': 'andor-1-media-player',
  'Double Vision System': 'double-vision',
  'Double Vision 168': 'double-vision-168',
  'Double Vision Expander': 'double-vision-expander',
};

const MODULE_SLUG_OVERRIDES = {
  P: 'pot',
  'Sum/Dist': 'sumdist',
};

const EXCLUDED_EXTERNAL_URL_PATTERNS = ['videoheadroom.systems'];

const CATALOG_HANDLE_BY_CANONICAL = {
  'double-vision': 'double-vision-system',
  'double-vision-168': 'double-vision-complete',
  pot: 'p',
};

function isExcludedFromSiteData(raw) {
  const externalUrl = (raw.external_url ?? '').toLowerCase();
  return EXCLUDED_EXTERNAL_URL_PATTERNS.some((p) => externalUrl.includes(p));
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function resolveCatalogHandle(canonical) {
  return CATALOG_HANDLE_BY_CANONICAL[canonical] ?? canonical;
}

function loadJson(rel) {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, rel), 'utf8'));
}

function docFileStatus(relDocPath) {
  const base = path.join(REPO_ROOT, 'content/docs');
  const candidates = [
    path.join(base, `${relDocPath}.md`),
    path.join(base, `${relDocPath}/index.md`),
  ];
  for (const fp of candidates) {
    if (!existsSync(fp)) continue;
    const raw = readFileSync(fp, 'utf8');
    try {
      const {data} = matter(raw);
      const draft = Boolean(data?.draft);
      return {hasFile: true, draft, file: path.relative(REPO_ROOT, fp)};
    } catch {
      return {hasFile: true, draft: false, file: path.relative(REPO_ROOT, fp)};
    }
  }
  return {hasFile: false, draft: false, file: null};
}

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

function charCountPlain(html) {
  if (!html) return 0;
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

function metafieldKeysWithValues(mf) {
  if (!mf || typeof mf !== 'object') return [];
  return Object.keys(mf).filter(
    (k) => mf[k] && String(mf[k].value ?? '').trim().length > 0,
  );
}

function buildHubEntries() {
  const modules = loadJson('db/lzxdb.Module.json');
  const out = [];
  for (const m of modules) {
    if (isExcludedFromSiteData(m)) continue;
    const name = m.name;
    if (ACCESSORY_NAMES.has(name)) continue;
    if (name === 'Vidiot' && m.is_hidden) continue;

    const isInstrument = INSTRUMENT_NAMES.has(name);
    const defaultSlug = slugify(name);
    const overrideSlug = isInstrument
      ? INSTRUMENT_SLUG_OVERRIDES[name]
      : MODULE_SLUG_OVERRIDES[name];
    const canonical = overrideSlug ?? defaultSlug;
    const hubType = isInstrument ? 'instrument' : 'module';

    const relPath =
      hubType === 'instrument'
        ? `instruments/${canonical}`
        : `modules/${canonical}`;
    const d = docFileStatus(relPath);
    out.push({canonical, hubType, name, docStatus: d});
  }
  return out;
}

function tierForRow({pr, manualInProd, descLen, seook}) {
  if (!pr) return 'P2';
  if (!pr.isActive) return 'P2';
  if (pr.isVisible && !manualInProd) return 'P0';
  if (pr.isVisible && (!seook || descLen > 4000)) return 'P1';
  return 'P2';
}

function tsvLine(fields) {
  return fields
    .map((f) => {
      const s = f === null || f === undefined ? '' : String(f);
      if (/[\t\n\r"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    })
    .join('\t');
}

function main() {
  const format = process.argv.find((a) => a.startsWith('--format='))?.split('=')[1] || 'md';

  const catalog = loadJson('app/data/generated/product-catalog.json');
  const products = catalog.products;
  const supportFile = (slug) =>
    existsSync(path.join(REPO_ROOT, 'content/support', `${slug}.md`));
  const supportManifestSlugs = parseSupportManifestSlugs();
  const rows = buildHubEntries();

  const dataRows = [];
  const noCatalog = [];

  for (const entry of rows) {
    const handle = resolveCatalogHandle(entry.canonical);
    const pr = products[handle] ?? null;
    if (!pr) noCatalog.push({...entry, handle});

    const descLen = pr ? charCountPlain(pr.descriptionHtml) : 0;
    const seook = pr
      ? Boolean(
          (pr.seo?.title && String(pr.seo.title).trim()) ||
            (pr.seo?.description && String(pr.seo.description).trim()),
        )
      : false;
    const {hasFile, draft} = entry.docStatus;
    const manualInProd = hasFile && !draft;
    const mkeys = pr ? metafieldKeysWithValues(pr.metafields) : [];
    const tier = tierForRow({pr, manualInProd, descLen, seook});

    dataRows.push({
      canonical: entry.canonical,
      hubType: entry.hubType,
      name: entry.name,
      handle,
      inCatalog: Boolean(pr),
      active: pr?.isActive,
      visible: pr?.isVisible,
      descLen,
      seook,
      metafieldKeys: mkeys.join(' '),
      hasDocFile: hasFile,
      docDraft: draft,
      manualInProd,
      supportMd: supportFile(entry.canonical),
      inSupportManifest: supportManifestSlugs.has(entry.canonical),
      tier,
    });
  }

  const header = [
    'canonical',
    'hubType',
    'name',
    'handle',
    'inCatalog',
    'active',
    'visible',
    'descLen',
    'seook',
    'metafieldKeys',
    'hasDocFile',
    'docDraft',
    'manualInProd',
    'supportMd',
    'inSupportManifest',
    'tier',
  ];

  if (format === 'csv' || format === 'tsv') {
    process.stdout.write(tsvLine(header) + '\n');
    for (const r of dataRows) {
      process.stdout.write(
        tsvLine([
          r.canonical,
          r.hubType,
          r.name,
          r.handle,
          r.inCatalog,
          r.active,
          r.visible,
          r.descLen,
          r.seook,
          r.metafieldKeys,
          r.hasDocFile,
          r.docDraft,
          r.manualInProd,
          r.supportMd,
          r.inSupportManifest,
          r.tier,
        ]) + '\n',
      );
    }
    return;
  }

  const outDir = path.join(REPO_ROOT, 'docs', 'reports');
  mkdirSync(outDir, {recursive: true});
  const outFile = path.join(outDir, 'product-content-audit.md');

  const p0 = dataRows.filter((r) => r.tier === 'P0');
  const lines = [
    '# Product content audit (generated)',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'Source: `app/data/generated/product-catalog.json` and `db/lzxdb.Module.json` (registry mirrors `app/data/product-slugs.ts`).',
    '',
    '**`manualInProd`**: a markdown file exists at `content/docs/{modules|instruments}/<slug>.md` (or `.../<slug>/index.md`) and front matter is not `draft: true` — product manuals render the same way in production (`getDocPage` / `hasDocPagePath`).',
    '',
    '## Summary',
    '',
    `- Hub products in registry: **${dataRows.length}**`,
    `- P0 (visible + active, no shippable manual in prod): **${p0.length}**`,
    `- Catalog record missing (handle map or sync): **${noCatalog.length}**`,
    '',
    '## Table',
    '',
    '| Slug | Type | Name | In catalog | Desc chars | SEO | Manual prod | Support `.md` | Tier |',
    '|------|------|------|------------|------------|-----|-------------|--------------|------|',
  ];

  for (const r of dataRows) {
    const cat = r.inCatalog ? 'yes' : 'no';
    const seo = r.seook ? 'yes' : 'no';
    const man = r.manualInProd ? 'yes' : 'no';
    const sup = r.supportMd ? 'yes' : 'no';
    lines.push(
      `| ${r.canonical} | ${r.hubType} | ${r.name} | ${cat} | ${r.descLen} | ${seo} | ${man} | ${sup} | ${r.tier} |`,
    );
  }

  lines.push('');
  lines.push('## P0 (prioritize first)');
  lines.push('');
  for (const r of p0) {
    lines.push(
      `- **${r.canonical}** (${r.name}): add or un-draft manual under \`content/docs/\`; check Shopify copy length (${r.descLen} chars)`,
    );
  }

  lines.push('');
  lines.push('## SUPPORT_MANIFEST without `content/support/<slug>.md`');
  lines.push('');
  for (const s of [...supportManifestSlugs].sort()) {
    if (!supportFile(s)) {
      lines.push(`- \`${s}\` (optional; add only when you have product-specific FAQ or setup prerequisites per content/support README)`);
    }
  }

  if (noCatalog.length) {
    lines.push('');
    lines.push('## No catalog product for resolved handle (fix map or `yarn shopify:sync:pull`)');
    lines.push('');
    for (const e of noCatalog) {
      lines.push(
        `- \`${e.canonical}\` → tried \`${e.handle}\` (${e.name})`,
      );
    }
  }

  writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');
  process.stdout.write(`Wrote ${path.relative(REPO_ROOT, outFile)}\n`);
}

main();
