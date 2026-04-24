#!/usr/bin/env node
/**
 * Comprehensive site audit: crawl every page, screenshot, test links/images,
 * detect rendering artifacts, and output structured reports.
 *
 * Usage:
 *   node scripts/site-audit.mjs                          # audit live site
 *   node scripts/site-audit.mjs http://localhost:3000     # audit local dev
 *   node scripts/site-audit.mjs --skip-screenshots       # skip screenshot capture
 *   node scripts/site-audit.mjs --skip-external          # skip external link checks
 */

import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';
import {parseStringPromise} from 'xml2js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL =
  process.argv.find((a) => a.startsWith('http')) || 'https://lzxindustries.net';
const SKIP_SCREENSHOTS = process.argv.includes('--skip-screenshots');
const SKIP_EXTERNAL = process.argv.includes('--skip-external');
const OUT_DIR = path.resolve('audit-results');
const SCREENSHOT_DIR = path.join(OUT_DIR, 'screenshots');
const CONCURRENCY = 3; // parallel page visits
const LINK_CHECK_CONCURRENCY = 10;
const EXTERNAL_TIMEOUT = 10_000;

// Known static routes that may not appear in sitemap.xml
const EXTRA_ROUTES = [
  '/',
  '/blog',
  '/blog/tags',
  '/docs',
  '/cart',
  '/search',
  '/wishlist',
  '/account/login',
  '/account/register',
  '/policies',
  '/getting-started',
  '/docs/guides/glossary',
  '/patches',
  '/videos',
  '/catalog',
  '/collections',
  '/products',
  '/featured-products',
];

// ---------------------------------------------------------------------------
// Artifact detection patterns (applied to visible page text / DOM)
// ---------------------------------------------------------------------------

const ARTIFACT_PATTERNS = [
  {
    name: 'raw-mdx-import',
    regex: /^import\s+\w+\s+from\s+['"]/m,
    target: 'text',
  },
  {
    name: 'unresolved-jsx-responsive-youtube',
    regex: /<ResponsiveYouTube/i,
    target: 'html',
  },
  {name: 'unresolved-jsx-img-src-var', regex: /<img\s+src=\{/i, target: 'html'},
  {name: 'unresolved-jsx-tabs', regex: /<Tab(?:s|Item)[>\s]/i, target: 'html'},
  {
    name: 'raw-admonition',
    regex: /^:::(note|tip|info|warning|caution|danger|important)/m,
    target: 'text',
  },
  {
    name: 'docusaurus-category-link',
    regex: /\/docs\/category\//i,
    target: 'href',
  },
  {name: 'frontmatter-leak-title', regex: /^title:\s/m, target: 'text'},
  {
    name: 'frontmatter-leak-sidebar',
    regex: /sidebar_position:\s/m,
    target: 'text',
  },
  {name: 'frontmatter-leak-dashes', regex: /^---\s*$/m, target: 'text'},
  {
    name: 'raw-export-function',
    regex: /^export\s+function\s+/m,
    target: 'text',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(urlPath) {
  return (
    urlPath
      .replace(/^\//, '')
      .replace(/\//g, '__')
      .replace(/[^a-zA-Z0-9_-]/g, '_') || 'index'
  );
}

function isInternal(href) {
  if (!href) return false;
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  try {
    const u = new URL(href);
    const base = new URL(BASE_URL);
    return u.hostname === base.hostname;
  } catch {
    return false;
  }
}

function normalizeUrl(href, pageUrl) {
  if (!href) return null;
  // Skip non-http schemes
  if (/^(mailto:|tel:|javascript:|data:|blob:|#)/.test(href)) return null;
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return null;
  }
}

async function limit(tasks, concurrency) {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = task().then((r) => {
      executing.delete(p);
      return r;
    });
    executing.add(p);
    results.push(p);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// ---------------------------------------------------------------------------
// Phase 1: Build URL manifest
// ---------------------------------------------------------------------------

async function fetchSitemap(baseUrl) {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  console.log(`  Fetching ${sitemapUrl}...`);

  try {
    const res = await fetch(sitemapUrl);
    if (!res.ok) {
      console.warn(`  ⚠ Sitemap returned ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const parsed = await parseStringPromise(xml);
    const urls = (parsed.urlset?.url || [])
      .map((u) => u.loc?.[0])
      .filter(Boolean);
    console.log(`  Found ${urls.length} URLs in sitemap`);
    return urls;
  } catch (e) {
    console.warn(`  ⚠ Failed to fetch sitemap: ${e.message}`);
    return [];
  }
}

async function buildManifest() {
  console.log('\n📋 Phase 1: Building URL manifest...');

  const sitemapUrls = await fetchSitemap(BASE_URL);

  // Normalize to paths
  const base = new URL(BASE_URL);
  const pathSet = new Set();

  for (const url of sitemapUrls) {
    try {
      const u = new URL(url);
      pathSet.add(u.pathname);
    } catch {
      // skip
    }
  }

  // Add extra static routes
  for (const route of EXTRA_ROUTES) {
    pathSet.add(route);
  }

  const paths = [...pathSet].sort();
  console.log(`  Total unique paths: ${paths.length}`);

  return paths;
}

// ---------------------------------------------------------------------------
// Phase 2: Page audit (screenshot, links, images, artifacts)
// ---------------------------------------------------------------------------

async function auditPage(page, urlPath, pageIndex, total) {
  const url = `${BASE_URL}${urlPath}`;
  const label = `[${pageIndex + 1}/${total}] ${urlPath}`;
  const result = {
    path: urlPath,
    url,
    title: '',
    status: 0,
    consoleErrors: [],
    links: [],
    images: [],
    artifacts: [],
    screenshotFile: null,
    error: null,
  };

  // Collect console errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });

    result.status = response?.status() ?? 0;
    result.title = await page.title();

    if (result.status >= 400) {
      console.log(`  ${label} → ${result.status} (error)`);
      result.consoleErrors = consoleErrors;
      return result;
    }

    // Screenshot
    if (!SKIP_SCREENSHOTS) {
      const screenshotFile = `${slugify(urlPath)}.png`;
      const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFile);
      await page.screenshot({fullPage: true, path: screenshotPath});
      result.screenshotFile = screenshotFile;
    }

    // Extract links
    result.links = await page.evaluate(() => {
      return [...document.querySelectorAll('a[href]')].map((a) => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim().slice(0, 100) || '',
        isBreadcrumb: !!a.closest('nav[aria-label="Breadcrumb"]'),
        isSidebar: !!a.closest('nav[aria-label*="sidebar"]'),
        isNav: !!a.closest('nav') || !!a.closest('header'),
      }));
    });

    // Extract images
    result.images = await page.evaluate(() => {
      return [...document.querySelectorAll('img')].map((img) => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        broken: img.complete && img.naturalWidth === 0 && img.src !== '',
      }));
    });

    // Detect artifacts — check visible text content
    const bodyText = await page.evaluate(() => {
      // Get text from main content area (or body if no article/main)
      const el =
        document.querySelector('article') ||
        document.querySelector('main') ||
        document.body;
      return el?.innerText || '';
    });

    const bodyHtml = await page.evaluate(() => {
      const el =
        document.querySelector('article') ||
        document.querySelector('main') ||
        document.body;
      return el?.innerHTML || '';
    });

    // Check content area size
    const articleText = await page.evaluate(() => {
      const el = document.querySelector('article');
      return el?.innerText?.trim() || '';
    });
    if (articleText !== '' && articleText.length < 50) {
      result.artifacts.push({
        type: 'empty-content',
        detail: `Article content only ${
          articleText.length
        } chars: "${articleText.slice(0, 80)}"`,
      });
    }

    // Check for broken images
    const brokenImages = result.images.filter((img) => img.broken);
    for (const img of brokenImages) {
      result.artifacts.push({
        type: 'broken-image',
        detail: `Broken image: ${img.src}`,
      });
    }

    // Pattern-based artifact detection
    for (const pattern of ARTIFACT_PATTERNS) {
      let source;
      if (pattern.target === 'text') source = bodyText;
      else if (pattern.target === 'html') source = bodyHtml;
      else if (pattern.target === 'href') {
        source = result.links.map((l) => l.href).join('\n');
      }
      if (source && pattern.regex.test(source)) {
        const match = source.match(pattern.regex);
        result.artifacts.push({
          type: pattern.name,
          detail: match?.[0]?.slice(0, 120) || '',
        });
      }
    }

    // Check for category links specifically
    for (const link of result.links) {
      if (link.href && /\/docs\/category\//.test(link.href)) {
        result.artifacts.push({
          type: 'docusaurus-category-link-in-href',
          detail: `Link text: "${link.text}" href: ${link.href}`,
        });
      }
    }

    result.consoleErrors = consoleErrors;

    const artifactCount = result.artifacts.length;
    const statusIcon = artifactCount > 0 ? '⚠' : '✓';
    console.log(
      `  ${statusIcon} ${label} → ${result.status} | ${
        result.links.length
      } links | ${result.images.length} imgs${
        artifactCount > 0 ? ` | ${artifactCount} artifacts` : ''
      }`,
    );
  } catch (e) {
    result.error = e.message;
    console.log(`  ✗ ${label} → ERROR: ${e.message.slice(0, 100)}`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Phase 3: Link checking
// ---------------------------------------------------------------------------

async function checkLink(url, isExternal) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      isExternal ? EXTERNAL_TIMEOUT : 15_000,
    );

    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'LZX-Site-Audit/1.0',
      },
    });
    clearTimeout(timeout);

    return {
      url,
      status: res.status,
      redirected: res.redirected,
      finalUrl: res.url,
      ok: res.ok,
      error: null,
    };
  } catch (e) {
    // Some servers reject HEAD, try GET
    if (e.name !== 'AbortError') {
      try {
        const controller2 = new AbortController();
        const timeout2 = setTimeout(
          () => controller2.abort(),
          isExternal ? EXTERNAL_TIMEOUT : 15_000,
        );
        const res = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller2.signal,
          headers: {
            'User-Agent': 'LZX-Site-Audit/1.0',
          },
        });
        clearTimeout(timeout2);
        // Read a small chunk and abort
        await res.text().catch(() => {});
        return {
          url,
          status: res.status,
          redirected: res.redirected,
          finalUrl: res.url,
          ok: res.ok,
          error: null,
        };
      } catch (e2) {
        return {url, status: 0, ok: false, error: e2.message};
      }
    }
    return {url, status: 0, ok: false, error: e.message};
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🔍 Site Audit: ${BASE_URL}`);
  console.log(`   Screenshots: ${SKIP_SCREENSHOTS ? 'disabled' : 'enabled'}`);
  console.log(`   External links: ${SKIP_EXTERNAL ? 'skipped' : 'checked'}`);

  // Ensure output directories
  fs.mkdirSync(SCREENSHOT_DIR, {recursive: true});

  // Phase 1: Build manifest
  const paths = await buildManifest();

  // Write manifest
  fs.writeFileSync(
    path.join(OUT_DIR, 'url-manifest.json'),
    JSON.stringify(paths, null, 2),
  );

  // Phase 2: Visit every page
  console.log('\n📸 Phase 2: Visiting pages...');
  const browser = await chromium.launch({headless: true});

  const pageResults = [];
  const allLinks = new Map(); // href → Set<source pages>
  const allImageSrcs = new Map(); // src → Set<source pages>

  // Process pages in batches
  const batches = [];
  for (let i = 0; i < paths.length; i += CONCURRENCY) {
    batches.push(paths.slice(i, i + CONCURRENCY));
  }

  for (const batch of batches) {
    const results = await Promise.all(
      batch.map(async (urlPath) => {
        const context = await browser.newContext({
          viewport: {width: 1280, height: 900},
          ignoreHTTPSErrors: true,
        });
        const page = await context.newPage();
        const result = await auditPage(
          page,
          urlPath,
          paths.indexOf(urlPath),
          paths.length,
        );
        await context.close();
        return result;
      }),
    );

    for (const result of results) {
      pageResults.push(result);

      // Collect links
      for (const link of result.links) {
        const normalized = normalizeUrl(link.href, result.url);
        if (!normalized) continue;
        if (!allLinks.has(normalized)) allLinks.set(normalized, new Set());
        allLinks.get(normalized).add(result.path);
      }

      // Collect image srcs
      for (const img of result.images) {
        const normalized = normalizeUrl(img.src, result.url);
        if (!normalized) continue;
        if (!allImageSrcs.has(normalized))
          allImageSrcs.set(normalized, new Set());
        allImageSrcs.get(normalized).add(result.path);
      }
    }
  }

  await browser.close();

  // Phase 3: Check links
  console.log('\n🔗 Phase 3: Checking links...');

  const internalLinks = [];
  const externalLinks = [];

  for (const [href] of allLinks) {
    if (isInternal(href)) {
      internalLinks.push(href);
    } else {
      externalLinks.push(href);
    }
  }

  console.log(`  Internal links: ${internalLinks.length}`);
  console.log(`  External links: ${externalLinks.length}`);

  // Check internal links
  console.log('  Checking internal links...');
  const internalResults = await limit(
    internalLinks.map((href) => () => checkLink(href, false)),
    LINK_CHECK_CONCURRENCY,
  );

  const brokenInternal = internalResults.filter((r) => !r.ok);
  console.log(
    `  ✓ Internal: ${internalResults.filter((r) => r.ok).length} ok, ${
      brokenInternal.length
    } broken`,
  );

  // Check external links
  let externalResults = [];
  if (!SKIP_EXTERNAL) {
    console.log('  Checking external links...');
    externalResults = await limit(
      externalLinks.map((href) => () => checkLink(href, true)),
      LINK_CHECK_CONCURRENCY,
    );

    const brokenExternal = externalResults.filter((r) => !r.ok);
    console.log(
      `  ✓ External: ${externalResults.filter((r) => r.ok).length} ok, ${
        brokenExternal.length
      } broken/timeout`,
    );
  }

  // ---------------------------------------------------------------------------
  // Generate reports
  // ---------------------------------------------------------------------------

  console.log('\n📊 Generating reports...');

  // Link report
  const linkReport = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalInternal: internalLinks.length,
      brokenInternal: brokenInternal.length,
      totalExternal: externalLinks.length,
      brokenExternal: externalResults.filter((r) => !r.ok).length,
    },
    brokenInternalLinks: brokenInternal.map((r) => ({
      ...r,
      foundOn: [...(allLinks.get(r.url) || [])],
    })),
    brokenExternalLinks: externalResults
      .filter((r) => !r.ok)
      .map((r) => ({
        ...r,
        foundOn: [...(allLinks.get(r.url) || [])],
      })),
    redirectedLinks: [...internalResults, ...externalResults]
      .filter((r) => r.redirected)
      .map((r) => ({
        url: r.url,
        finalUrl: r.finalUrl,
        foundOn: [...(allLinks.get(r.url) || [])],
      })),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, 'link-report.json'),
    JSON.stringify(linkReport, null, 2),
  );

  // Image report
  const allBrokenImages = [];
  for (const result of pageResults) {
    for (const img of result.images) {
      if (img.broken) {
        allBrokenImages.push({
          src: img.src,
          alt: img.alt,
          page: result.path,
        });
      }
    }
  }

  const imageReport = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalImages: allImageSrcs.size,
      brokenImages: allBrokenImages.length,
    },
    brokenImages: allBrokenImages,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, 'image-report.json'),
    JSON.stringify(imageReport, null, 2),
  );

  // Artifact report
  const pagesWithArtifacts = pageResults.filter((r) => r.artifacts.length > 0);
  const artifactReport = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      pagesScanned: pageResults.length,
      pagesWithArtifacts: pagesWithArtifacts.length,
      totalArtifacts: pagesWithArtifacts.reduce(
        (sum, p) => sum + p.artifacts.length,
        0,
      ),
      pagesWithErrors: pageResults.filter((r) => r.status >= 400 || r.error)
        .length,
      pagesWithConsoleErrors: pageResults.filter(
        (r) => r.consoleErrors.length > 0,
      ).length,
    },
    pages: pagesWithArtifacts.map((r) => ({
      path: r.path,
      status: r.status,
      title: r.title,
      artifacts: r.artifacts,
      consoleErrors: r.consoleErrors,
    })),
    errorPages: pageResults
      .filter((r) => r.status >= 400 || r.error)
      .map((r) => ({
        path: r.path,
        status: r.status,
        error: r.error,
        title: r.title,
      })),
    consoleErrorPages: pageResults
      .filter((r) => r.consoleErrors.length > 0)
      .map((r) => ({
        path: r.path,
        consoleErrors: r.consoleErrors,
      })),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, 'artifact-report.json'),
    JSON.stringify(artifactReport, null, 2),
  );

  // Full results
  fs.writeFileSync(
    path.join(OUT_DIR, 'full-results.json'),
    JSON.stringify(
      pageResults.map((r) => ({
        path: r.path,
        status: r.status,
        title: r.title,
        linkCount: r.links.length,
        imageCount: r.images.length,
        artifactCount: r.artifacts.length,
        consoleErrorCount: r.consoleErrors.length,
        screenshotFile: r.screenshotFile,
        error: r.error,
      })),
      null,
      2,
    ),
  );

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  console.log('\n' + '='.repeat(60));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Pages scanned:         ${pageResults.length}`);
  console.log(
    `Pages with errors:     ${artifactReport.summary.pagesWithErrors}`,
  );
  console.log(
    `Pages with artifacts:  ${artifactReport.summary.pagesWithArtifacts}`,
  );
  console.log(
    `Total artifacts:       ${artifactReport.summary.totalArtifacts}`,
  );
  console.log(`Broken internal links: ${linkReport.summary.brokenInternal}`);
  console.log(`Broken external links: ${linkReport.summary.brokenExternal}`);
  console.log(`Broken images:         ${imageReport.summary.brokenImages}`);
  console.log(`Redirected links:      ${linkReport.redirectedLinks.length}`);
  console.log(
    `Console errors:        ${artifactReport.summary.pagesWithConsoleErrors} pages`,
  );
  console.log('='.repeat(60));

  if (brokenInternal.length > 0) {
    console.log('\n❌ Broken internal links:');
    for (const r of brokenInternal) {
      console.log(`  ${r.status || 'ERR'} ${r.url}`);
      const pages = allLinks.get(r.url);
      if (pages) {
        for (const p of [...pages].slice(0, 3)) {
          console.log(`       found on: ${p}`);
        }
      }
    }
  }

  if (allBrokenImages.length > 0) {
    console.log('\n❌ Broken images:');
    for (const img of allBrokenImages.slice(0, 20)) {
      console.log(`  ${img.src}`);
      console.log(`       on page: ${img.page}`);
    }
  }

  if (pagesWithArtifacts.length > 0) {
    console.log('\n⚠ Pages with artifacts:');
    for (const p of pagesWithArtifacts) {
      console.log(`  ${p.path}`);
      for (const a of p.artifacts) {
        console.log(`    - ${a.type}: ${a.detail.slice(0, 80)}`);
      }
    }
  }

  const errorPages = pageResults.filter((r) => r.status >= 400 || r.error);
  if (errorPages.length > 0) {
    console.log('\n❌ Error pages:');
    for (const p of errorPages) {
      console.log(
        `  ${p.status || 'ERR'} ${p.path}${
          p.error ? ` (${p.error.slice(0, 60)})` : ''
        }`,
      );
    }
  }

  console.log(`\nReports written to: ${OUT_DIR}/`);
  console.log('  url-manifest.json');
  console.log('  link-report.json');
  console.log('  image-report.json');
  console.log('  artifact-report.json');
  console.log('  full-results.json');
  if (!SKIP_SCREENSHOTS) {
    console.log(
      `  screenshots/ (${
        pageResults.filter((r) => r.screenshotFile).length
      } files)`,
    );
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
