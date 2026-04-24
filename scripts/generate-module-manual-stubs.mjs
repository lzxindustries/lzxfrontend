#!/usr/bin/env node
/**
 * Generate content/docs/modules/<slug>.md stubs for hub modules that lack a
 * shippable manual, using lzxdb.Module.json + catalog copy. Skips if a file
 * already exists (including drafts — do not overwrite WIP).
 *
 * Usage: node scripts/generate-module-manual-stubs.mjs [--dry-run]
 *
 * Keep ACCESSORY / INSTRUMENT / OVERRIDE sets in sync with
 * app/data/product-slugs.ts and scripts/audit-product-content.mjs.
 */

import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

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

/** Manual tab uses `getForumArchiveDocForProduct` when no doc file exists; do not add a thin stub. */
const SKIP_STUB_SLUGS = new Set(['fortress', 'liquid-tv']);

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
      return {hasFile: true, draft, file: fp};
    } catch {
      return {hasFile: true, draft: false, file: fp};
    }
  }
  return {hasFile: false, draft: false, file: null};
}

function buildHubModuleEntries() {
  const modules = JSON.parse(
    readFileSync(path.join(REPO_ROOT, 'db/lzxdb.Module.json'), 'utf8'),
  );
  const out = [];
  for (const m of modules) {
    if (isExcludedFromSiteData(m)) continue;
    const name = m.name;
    if (ACCESSORY_NAMES.has(name)) continue;
    if (name === 'Vidiot' && m.is_hidden) continue;
    if (INSTRUMENT_NAMES.has(name)) continue;

    const overrideSlug = MODULE_SLUG_OVERRIDES[name];
    const canonical = overrideSlug ?? slugify(name);
    const relPath = `modules/${canonical}`;
    out.push({canonical, name, lzx: m, relPath});
  }
  return out;
}

function cleanDesc(s) {
  if (!s) return '';
  return String(s)
    .replace(/^\uFEFF/, '')
    .replace(/SOLD OUT/gi, '')
    .replace(/Owner's Manual \(PDF\)[^\n]*/gi, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600);
}

function yamlEscape(s) {
  if (!s) return "''";
  if (/[:\n'"]/m.test(s)) return `'` + s.replace(/'/g, "''") + `'`;
  return s;
}

function buildBody({name, subtitle, lzx, catalogPlain}) {
  const lines = [];
  lines.push(`# ${name}`);
  lines.push('');
  if (subtitle) {
    lines.push(`*${subtitle}*`);
    lines.push('');
  }
  const intro = cleanDesc(lzx.description || catalogPlain || '');
  if (intro) {
    lines.push('## Overview');
    lines.push('');
    lines.push(intro);
    lines.push('');
  } else {
    lines.push('## Overview');
    lines.push('');
    lines.push(
      `**${name}** is an LZX Eurorack video module. This page is a concise reference entry; the **Specs** tab on the product hub lists connectors, features, and controls from the LZX module database.`,
    );
    lines.push('');
  }
  lines.push('## On the product hub');
  lines.push('');
  lines.push(
    'Open the **Specs** tab for the full connector list, control definitions, and feature bullets (synced from the LZX knowledge base). Use **Overview** for commerce copy and the **Support** tab for triage and community links.',
  );
  lines.push('');
  if (lzx.hp || lzx.max_pos_12v_ma != null || lzx.max_neg_12v_ma != null) {
    lines.push('## Power and size (summary)');
    lines.push('');
    const hp = lzx.hp != null ? `**${lzx.hp} HP**` : null;
    const pos =
      lzx.max_pos_12v_ma != null ? `+12V @ ${lzx.max_pos_12v_ma} mA` : null;
    const neg =
      lzx.max_neg_12v_ma != null ? `-12V @ ${lzx.max_neg_12v_ma} mA` : null;
    const bits = [hp, [pos, neg].filter(Boolean).join(', ')].filter(Boolean);
    if (bits.length) lines.push(bits.join(' · ') + '.');
    if (lzx.mounting_depth_mm) {
      lines.push(
        `Mounting depth (reference): **${lzx.mounting_depth_mm} mm**.`,
      );
    }
    lines.push('');
  }
  lines.push('## Community');
  lines.push('');
  lines.push(
    'Search the [LZX community forum](https://community.lzxindustries.net) for build notes, patch ideas, and troubleshooting threads mentioning this module.',
  );
  lines.push('');
  return lines.join('\n');
}

function main() {
  const catalog = JSON.parse(
    readFileSync(
      path.join(REPO_ROOT, 'app/data/generated/product-catalog.json'),
      'utf8',
    ),
  );
  const products = catalog.products;
  const entries = buildHubModuleEntries();
  let created = 0;
  for (const entry of entries) {
    if (SKIP_STUB_SLUGS.has(entry.canonical)) continue;
    const d = docFileStatus(entry.relPath);
    if (d.hasFile) continue;

    const handle = resolveCatalogHandle(entry.canonical);
    const pr = products[handle] ?? null;
    const plain = pr?.descriptionPlain ? String(pr.descriptionPlain) : '';
    const subtitle = (entry.lzx.subtitle && String(entry.lzx.subtitle)) || '';
    const name = entry.name;

    let description =
      (subtitle ? `${subtitle} — ` : '') +
      'Concise LZX module reference. See the product hub Specs tab for full connector and control data.';
    if (entry.lzx.discontinuedDate) {
      description =
        (subtitle ? `${subtitle}. ` : '') +
        'This module is discontinued; the Manual tab preserves reference material for existing owners.';
    }

    const body = buildBody({
      name,
      subtitle,
      lzx: entry.lzx,
      catalogPlain: plain,
    });

    const doc = `---
draft: false
title: ${yamlEscape(name)}
description: ${yamlEscape(description)}
---

${body}
`;

    const outPath = path.join(REPO_ROOT, 'content/docs', entry.relPath + '.md');
    if (DRY) {
      console.log(
        `[dry-run] would create ${path.relative(REPO_ROOT, outPath)}`,
      );
      created++;
      continue;
    }
    mkdirSync(path.dirname(outPath), {recursive: true});
    writeFileSync(outPath, doc, 'utf8');
    created++;
  }
  console.log(
    DRY
      ? `[dry-run] ${created} stub(s) would be created.`
      : `Wrote ${created} module manual stub(s).`,
  );
}

main();
