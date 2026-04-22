#!/usr/bin/env node

/**
 * Post-build script: generates static HTML pages from markdown content
 * for Pagefind indexing, then runs Pagefind to build the search index.
 *
 * Usage: node scripts/build-search-index.mjs
 * Requires: pagefind (npx pagefind)
 */

import fs from 'fs';
import path from 'path';
import {execSync} from 'child_process';

const CONTENT_DIR = path.resolve('content');
const OUTPUT_DIR = path.resolve('dist/client/pagefind-source');
const PAGEFIND_OUTPUT_DIR = path.resolve('dist/client/pagefind');

function extractFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return {meta: {}, body: raw};

  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      // Remove quotes
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      meta[key] = val;
    }
  }
  return {meta, body: match[2]};
}

function stripMarkdown(md) {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, '')           // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // links → text
    .replace(/#{1,6}\s+/g, '')                  // headings
    .replace(/[*_~`>]/g, '')                    // formatting
    .replace(/\|[^\n]*\|/g, '')                 // tables
    .replace(/---+/g, '')                       // hrs
    .replace(/:::.*$/gm, '')                    // admonitions
    .replace(/\n{3,}/g, '\n\n')                 // collapse whitespace
    .trim();
}

function processFile(filePath, urlBase) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const {meta, body} = extractFrontmatter(raw);

  if (meta.draft === 'true') return;

  const title = meta.title || path.basename(filePath, '.md');
  const description = meta.description || '';
  const plainText = stripMarkdown(body);

  // Determine URL
  let url;
  if (urlBase.startsWith('/blog/')) {
    const dirName = path.basename(path.dirname(filePath));
    const slug = dirName.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    url = `/blog/${slug}`;
  } else {
    const relPath = path.relative(path.join(CONTENT_DIR, 'docs'), filePath);
    let docPath = relPath.replace(/\.md$/, '').replace(/\/index$/, '');
    if (docPath === 'index') docPath = '';
    url = docPath ? `/docs/${docPath}` : '/docs';

    // Rewrite module and instrument docs to hub URLs
    const moduleMatch = url.match(/^\/docs\/modules\/([^/]+)$/);
    if (moduleMatch) {
      url = `/modules/${moduleMatch[1]}/manual`;
    }
    const instrMatch = url.match(/^\/docs\/instruments\/([^/]+)(?:\/(.+))?$/);
    if (instrMatch) {
      const slug = instrMatch[1];
      const subpath = instrMatch[2];
      url = `/instruments/${slug}/manual${subpath ? '/' + subpath : ''}`;
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <main data-pagefind-body>
    ${plainText.split('\n').map(p => `<p>${escapeHtml(p)}</p>`).join('\n    ')}
  </main>
</body>
</html>`;

  const outPath = path.join(OUTPUT_DIR, url, 'index.html');
  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  fs.writeFileSync(outPath, html);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.name.endsWith('.md')) {
      callback(fullPath);
    }
  }
}

/**
 * Parse SUPPORT_MANIFEST from the TypeScript source to extract product slugs,
 * FAQ items, and setup prerequisites for search indexing.
 */
function parseSupportManifest() {
  const manifestPath = path.resolve('app/data/support-manifest.ts');
  if (!fs.existsSync(manifestPath)) return {};

  const src = fs.readFileSync(manifestPath, 'utf-8');
  const products = {};

  // Extract slug entries — look for "slug: 'xxx'" patterns and find the
  // enclosing object key by looking backward for "key: {" pattern.
  const slugFieldRegex = /slug:\s*['"]([a-z0-9-]+)['"]/g;
  let match;
  while ((match = slugFieldRegex.exec(src)) !== null) {
    const slug = match[1];
    if (!products[slug]) {
      products[slug] = {slug, faqItems: []};
    }
  }

  // Extract FAQ questions for each product
  const faqRegex = /question:\s*['"](.*?)['"]/g;
  while ((match = faqRegex.exec(src)) !== null) {
    // Find which product this FAQ belongs to by searching backward for the nearest slug field
    const preceding = src.slice(0, match.index);
    const allSlugs = [...preceding.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g)];
    if (allSlugs.length > 0) {
      const nearestSlug = allSlugs[allSlugs.length - 1][1];
      if (products[nearestSlug]) {
        products[nearestSlug].faqItems.push(match[1]);
      }
    }
  }

  // Also harvest FAQs from content/support/<slug>.md frontmatter, which is
  // the new home for per-product support content.
  const supportDir = path.resolve('content/support');
  if (fs.existsSync(supportDir)) {
    for (const entry of fs.readdirSync(supportDir)) {
      if (!entry.endsWith('.md')) continue;
      const slug = entry.replace(/\.md$/, '');
      if (!products[slug]) {
        products[slug] = {slug, faqItems: []};
      }
      const raw = fs.readFileSync(path.join(supportDir, entry), 'utf-8');
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;
      const frontmatter = fmMatch[1];
      const questionRegex = /^\s*-\s*question:\s*['"]?(.+?)['"]?\s*$/gm;
      let qMatch;
      while ((qMatch = questionRegex.exec(frontmatter)) !== null) {
        products[slug].faqItems.push(qMatch[1]);
      }
    }
  }

  return products;
}

/**
 * Parse product-slugs.ts to identify instrument vs module products.
 */
function parseProductSlugs() {
  const slugsPath = path.resolve('app/data/product-slugs.ts');
  if (!fs.existsSync(slugsPath)) return {instruments: [], modules: []};

  const src = fs.readFileSync(slugsPath, 'utf-8');

  // Extract INSTRUMENT_NAMES
  const instrMatch = src.match(/INSTRUMENT_NAMES\s*(?::\s*string\[\])?\s*=\s*\[([\s\S]*?)\]/);
  const instruments = [];
  if (instrMatch) {
    const entries = instrMatch[1].match(/['"]([^'"]+)['"]/g);
    if (entries) {
      for (const e of entries) instruments.push(e.replace(/['"]/g, ''));
    }
  }

  return {instruments, modules: []};
}

/**
 * Parse lzxdb Module.json for module names.
 */
function getModuleNames() {
  const modulesPath = path.resolve('db/lzxdb.Module.json');
  if (!fs.existsSync(modulesPath)) return {};

  const modules = JSON.parse(fs.readFileSync(modulesPath, 'utf-8'));
  const nameMap = {};
  for (const m of modules) {
    const slug = m.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    nameMap[slug] = m.name;
  }
  return nameMap;
}

function writeSyntheticPage(url, title, description, bodyText) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <main data-pagefind-body>
    ${bodyText.split('\n').filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join('\n    ')}
  </main>
</body>
</html>`;

  const outPath = path.join(OUTPUT_DIR, url, 'index.html');
  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  fs.writeFileSync(outPath, html);
}

function generateProductHubPages() {
  const manifest = parseSupportManifest();
  const {instruments} = parseProductSlugs();
  const moduleNames = getModuleNames();
  let count = 0;

  const instrumentSet = new Set(instruments.map(n =>
    n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  ));

  for (const [slug, data] of Object.entries(manifest)) {
    const isInstrument = instrumentSet.has(slug);
    const hubType = isInstrument ? 'instruments' : 'modules';
    const name = moduleNames[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Overview page
    writeSyntheticPage(
      `/${hubType}/${slug}`,
      `${name} | LZX Industries`,
      `Product page for ${name} — overview, features, and purchasing.`,
      `${name} product overview. Learn about features, specifications, and creative applications. Purchase ${name} from LZX Industries.`,
    );

    // Support page
    const faqText = (data.faqItems || []).map(q => `FAQ: ${q}`).join('\n');
    writeSyntheticPage(
      `/${hubType}/${slug}/support`,
      `${name} Support | LZX Industries`,
      `Support, FAQ, and troubleshooting for ${name}.`,
      `${name} support. Get help with setup, troubleshooting, and common questions.\n${faqText}\nContact LZX Industries for additional support.`,
    );

    // Downloads page
    writeSyntheticPage(
      `/${hubType}/${slug}/downloads`,
      `${name} Downloads | LZX Industries`,
      `Firmware, manuals, and support files for ${name}.`,
      `Download firmware, manuals, schematics, and support files for ${name}. Use LZX Connect for guided firmware updates.`,
    );

    // Specs page
    writeSyntheticPage(
      `/${hubType}/${slug}/specs`,
      `${name} Specifications | LZX Industries`,
      `Technical specifications for ${name}.`,
      `${name} technical specifications. Connectors, controls, features, and compatibility information for patching and system integration.`,
    );

    // Instrument-specific pages
    if (isInstrument) {
      writeSyntheticPage(
        `/${hubType}/${slug}/learn`,
        `Learn ${name} | LZX Industries`,
        `Learning resources and documentation for ${name}.`,
        `Learn ${name}. Curated guides, tutorials, and documentation to help you get the most from your ${name}.`,
      );

      writeSyntheticPage(
        `/${hubType}/${slug}/setup`,
        `${name} Setup | LZX Industries`,
        `Setup guide and prerequisites for ${name}.`,
        `Set up your ${name}. Prerequisites, connections, initial configuration, and first-use steps.`,
      );
    }

    count++;
  }

  return count;
}

function generateGlobalPages() {
  writeSyntheticPage(
    '/support',
    'Support | LZX Industries',
    'Find help, manuals, firmware, and troubleshooting for LZX products.',
    'LZX Support Hub. Find product manuals, download firmware, get started with your system, troubleshoot issues, learn core terminology, or contact LZX Industries.',
  );

  writeSyntheticPage(
    '/downloads',
    'Downloads | LZX Industries',
    'Centralized manuals, firmware files, and resources for LZX modules and instruments.',
    'Download firmware, manuals, schematics, and support files for all LZX products. Use LZX Connect for guided firmware updates on Videomancer and Chromagnon.',
  );

  writeSyntheticPage(
    '/connect',
    'LZX Connect | LZX Industries',
    'LZX Connect desktop app for guided firmware updates.',
    'LZX Connect is the desktop firmware updater for LZX instruments. Currently supports Videomancer with Chromagnon support coming soon. Download for Windows, macOS, or Linux.',
  );

  writeSyntheticPage(
    '/getting-started',
    'Getting Started | LZX Industries',
    'Choose your path: learn video synthesis, start with modular, or set up Videomancer.',
    'Getting started with LZX. Choose your path: Learn video synthesis fundamentals, start building a modular system, or set up your Videomancer instrument.',
  );

  writeSyntheticPage(
    '/glossary',
    'Glossary | LZX Industries',
    'Video synthesis terminology and definitions.',
    'LZX Glossary. Definitions for video synthesis terminology, signal types, and technical concepts used across LZX products and documentation.',
  );
}

// Main
console.log('Building search index...');

// Clean output dir
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, {recursive: true});
}
fs.mkdirSync(OUTPUT_DIR, {recursive: true});

if (fs.existsSync(PAGEFIND_OUTPUT_DIR)) {
  fs.rmSync(PAGEFIND_OUTPUT_DIR, {recursive: true});
}

// Process blog posts
let blogCount = 0;
const blogDir = path.join(CONTENT_DIR, 'blog');
if (fs.existsSync(blogDir)) {
  for (const entry of fs.readdirSync(blogDir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      const indexFile = path.join(blogDir, entry.name, 'index.md');
      if (fs.existsSync(indexFile)) {
        processFile(indexFile, '/blog/');
        blogCount++;
      }
    }
  }
}
console.log(`  Processed ${blogCount} blog posts`);

// Process docs
let docsCount = 0;
const docsDir = path.join(CONTENT_DIR, 'docs');
walkDir(docsDir, (filePath) => {
  processFile(filePath, '/docs/');
  docsCount++;
});
console.log(`  Processed ${docsCount} doc pages`);

// Process product hub pages (synthetic pages for search indexing)
let hubCount = 0;
hubCount += generateProductHubPages();
console.log(`  Generated ${hubCount} product hub pages`);

// Process global site pages (synthetic)
generateGlobalPages();
console.log('  Generated global site pages');

// Run pagefind
console.log('  Running Pagefind...');
try {
  execSync(
    `npx pagefind --site ${OUTPUT_DIR} --output-path ${PAGEFIND_OUTPUT_DIR}`,
    {stdio: 'inherit'},
  );
  console.log('  Search index built successfully!');
} catch (e) {
  console.error('  Failed to build search index:', e.message);
  process.exit(1);
}

// Clean up source HTML
fs.rmSync(OUTPUT_DIR, {recursive: true});
console.log('Done.');
