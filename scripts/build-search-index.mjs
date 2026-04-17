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
