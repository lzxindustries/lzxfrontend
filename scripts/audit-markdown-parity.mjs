#!/usr/bin/env node
/**
 * Markdown rendering parity audit: compares every URL in the
 * Docusaurus sitemap at docs.lzxindustries.net against the Hydrogen
 * storefront. Reports content similarity, broken media, markdown
 * artifacts, and unresolved URL mappings.
 *
 * Usage:
 *   # Against local dev server (default):
 *   yarn dev --port 3456 &
 *   node scripts/audit-markdown-parity.mjs
 *
 *   # Against production:
 *   LIVE_BASE=https://lzxindustries.net node scripts/audit-markdown-parity.mjs
 *
 *   # Write JSON snapshot:
 *   node scripts/audit-markdown-parity.mjs --json=tmp/markdown-audit.json
 *
 * Findings + remediation live in
 * docs/reports/MARKDOWN_PARITY_AUDIT.md.
 */

import {writeFileSync} from 'node:fs';

const DOCS_BASE = process.env.DOCS_BASE ?? 'https://docs.lzxindustries.net';
const LIVE_BASE = process.env.LIVE_BASE ?? 'http://localhost:3456';
const jsonFlag = process.argv.find((a) => a.startsWith('--json='));
const JSON_OUT = jsonFlag ? jsonFlag.slice('--json='.length) : null;

const UA = {
  'User-Agent':
    'Mozilla/5.0 (lzxindustries markdown-parity-audit; contact: ops@lzxindustries.com)',
};

/** Fetch helper with a single retry. */
async function fetchText(url, opts = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {headers: UA, ...opts});
      const text = await response.text();
      return {status: response.status, finalUrl: response.url, text};
    } catch (error) {
      if (attempt === 1) throw error;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return {status: 'ERR', finalUrl: url, text: ''};
}

/** Strip boilerplate and return text + media references for a rendered page. */
function extractContent(html, isDocusaurus) {
  const containerMatch = isDocusaurus
    ? html.match(
        /<(article|main)[^>]*class="[^"]*theme-doc-markdown[^"]*"[^>]*>([\s\S]*?)<\/\1>/,
      ) ||
      html.match(/<article[\s\S]*?<\/article>/) ||
      html.match(/<main[\s\S]*?<\/main>/)
    : html.match(
        /<(article|main)[^>]*class="[^"]*docs-content[^"]*"[^>]*>([\s\S]*?)<\/\1>/,
      ) ||
      html.match(/<article[\s\S]*?<\/article>/) ||
      html.match(/<main[\s\S]*?<\/main>/);
  const inner = containerMatch ? containerMatch[0] : html;
  const media = [];
  for (const match of inner.matchAll(
    /<(?:img|video|source|audio|iframe)[^>]*\s(?:src)="([^"#?]+)[^"]*"/gi,
  )) {
    media.push(match[1]);
  }
  const text = inner
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return {text, media};
}

/** Similarity ratio based on Jaccard of 5-grams — resilient to markup
 * differences and faster than a full edit-distance comparison. */
function similarity(a, b) {
  if (!a || !b) return 0;
  const shingle = (s) => {
    const out = new Set();
    const limited = s.slice(0, 40000);
    for (let i = 0; i < limited.length - 5; i++) {
      out.add(limited.slice(i, i + 5));
    }
    return out;
  };
  const sa = shingle(a);
  const sb = shingle(b);
  let intersect = 0;
  for (const x of sa) if (sb.has(x)) intersect++;
  const union = sa.size + sb.size - intersect;
  return union > 0 ? intersect / union : 0;
}

/** Candidate live URL variants for a Docusaurus path, in priority order. */
function candidateLiveUrls(path) {
  const candidates = [];
  const moduleMatch = path.match(/^\/docs\/modules\/([^/]+)$/);
  if (moduleMatch) {
    const slug = moduleMatch[1];
    if (slug === 'module-list') {
      candidates.push(`${LIVE_BASE}/modules/specs`);
    }
    candidates.push(`${LIVE_BASE}/modules/${slug}/manual`);
    candidates.push(`${LIVE_BASE}/modules/${slug}`);
  }
  const instrumentMatch = path.match(
    /^\/docs\/instruments\/([^/]+)\/([^/]+)$/,
  );
  if (instrumentMatch) {
    const [, instrument, slug] = instrumentMatch;
    candidates.push(
      `${LIVE_BASE}/instruments/${instrument}/manual/${slug}`,
      `${LIVE_BASE}/instruments/${instrument}/manual`,
    );
  }
  candidates.push(LIVE_BASE + path);
  return [...new Set(candidates)];
}

function detectArtifacts(text) {
  const patterns = [
    [/!\[[^\]]*\]\([^)]+\)/, 'raw-image-markdown'],
    [/(?<!\w)\[[^\]]+\]\([^)]+\)/, 'raw-link-markdown'],
    [/(?:^|\n)\s*```/, 'fenced-code-leak'],
    [/(?:^|\n)\s{0,3}#{1,6}\s+\S/, 'heading-markup-leak'],
  ];
  return patterns.filter(([pattern]) => pattern.test(text)).map(([, name]) => name);
}

async function main() {
  console.log(`Auditing ${DOCS_BASE} → ${LIVE_BASE}`);
  const sitemapRes = await fetchText(`${DOCS_BASE}/sitemap.xml`);
  if (sitemapRes.status !== 200) {
    throw new Error(
      `Could not fetch ${DOCS_BASE}/sitemap.xml (${sitemapRes.status})`,
    );
  }
  const paths = [];
  for (const match of sitemapRes.text.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      paths.push(new URL(match[1].trim()).pathname);
    } catch {
      // ignore malformed entries
    }
  }

  const rows = [];
  let processed = 0;
  for (const path of paths) {
    processed++;
    if (processed % 20 === 0) {
      process.stderr.write(`  ${processed}/${paths.length}\n`);
    }
    const docs = await fetchText(DOCS_BASE + path);
    if (docs.status !== 200) continue;
    const docsContent = extractContent(docs.text, true);

    let best = null;
    for (const liveUrl of candidateLiveUrls(path)) {
      const live = await fetchText(liveUrl);
      const liveContent =
        live.status === 200 ? extractContent(live.text, false) : {text: '', media: []};
      const sim = similarity(docsContent.text, liveContent.text);
      const probe = docsContent.text.slice(0, 200).replace(/[^a-z0-9 ]/g, '');
      const contains = probe.length > 40 && liveContent.text.includes(probe.slice(0, 120));
      const score = sim + (contains ? 0.3 : 0) + (live.status === 200 ? 0.05 : 0);
      const candidate = {
        path,
        live: liveUrl,
        liveStatus: live.status,
        liveFinal: live.finalUrl,
        sim,
        contains,
        score,
        docsMedia: docsContent.media.length,
        liveMedia: liveContent.media.length,
        artifacts: liveContent.text ? detectArtifacts(liveContent.text) : [],
      };
      if (!best || candidate.score > best.score) best = candidate;
    }
    rows.push(best);
  }

  const missing = rows.filter((r) => r.liveStatus !== 200);
  const ok = rows.filter(
    (r) => r.liveStatus === 200 && (r.sim >= 0.75 || r.contains),
  );
  const risk = rows.filter(
    (r) => r.liveStatus === 200 && !(r.sim >= 0.75 || r.contains),
  );
  const artifacts = rows.filter((r) => r.artifacts.length > 0);
  const mediaLess = rows.filter(
    (r) => r.liveStatus === 200 && r.docsMedia > r.liveMedia,
  );

  console.log('\n=== Summary ===');
  console.log(`Total docs URLs:       ${rows.length}`);
  console.log(`Live OK (matching):    ${ok.length}`);
  console.log(`Live OK (risk):        ${risk.length}`);
  console.log(`Live non-200:          ${missing.length}`);
  console.log(`Artifact pages:        ${artifacts.length}`);
  console.log(`Live media < docs:     ${mediaLess.length}`);

  if (missing.length) {
    console.log('\nNon-200:');
    for (const row of missing) {
      console.log(`  ${row.liveStatus} ${row.path} → ${row.liveFinal}`);
    }
  }
  if (risk.length) {
    console.log('\nLow similarity (inspect manually):');
    for (const row of risk.sort((a, b) => a.sim - b.sim).slice(0, 40)) {
      console.log(
        `  ${row.path}  sim=${row.sim.toFixed(3)}  contains=${row.contains}  live=${row.live}`,
      );
    }
  }
  if (artifacts.length) {
    console.log('\nPotential markdown artifacts in rendered output:');
    for (const row of artifacts) {
      console.log(`  ${row.path}  ${row.artifacts.join(',')}`);
    }
  }

  if (JSON_OUT) {
    writeFileSync(
      JSON_OUT,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          docsBase: DOCS_BASE,
          liveBase: LIVE_BASE,
          summary: {
            total: rows.length,
            ok: ok.length,
            risk: risk.length,
            missing: missing.length,
            artifacts: artifacts.length,
            mediaLess: mediaLess.length,
          },
          rows,
        },
        null,
        2,
      ),
    );
    console.log(`\nJSON snapshot written to ${JSON_OUT}`);
  }

  if (missing.length > 2 || artifacts.length > 0) {
    // Keep exit code non-zero when regressions appear beyond the two known
    // Docusaurus-only paths (`/blog/archive`, `/blog/authors`), so CI can
    // surface new breakage.
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
