/**
 * Shared rewriter for legacy Docusaurus-era docs links that still appear in
 * Shopify product HTML and similar migrated content.
 *
 * Canonical mappings:
 *   docs.lzxindustries.net/docs/category/program-guides → /instruments/videomancer/manual/programs
 *   lzxindustries.net/docs/docs/category/program-guides → /instruments/videomancer/manual/programs
 *   *://lzxindustries.net/docs/docs/instruments/<slug>[/<sub>] → /instruments/<slug>/manual[/<sub>]
 *   *://lzxindustries.net/docs/docs/modules/<slug>[/<sub>]     → /modules/<slug>/manual[/<sub>]
 *   *://lzxindustries.net/docs/docs/<other>                    → /docs/<other>
 *   *://docs.lzxindustries.net/docs/instruments/<slug>[/<sub>] → /instruments/<slug>/manual[/<sub>]
 *   *://docs.lzxindustries.net/docs/modules/<slug>[/<sub>]     → /modules/<slug>/manual[/<sub>]
 *   *://docs.lzxindustries.net/docs/<other>                    → /docs/<other>
 *   href="/docs/category/<x>"                                  → href="/docs"
 *   href="/docs/docs/instruments/<slug>[/<sub>]"               → href="/instruments/<slug>/manual[/<sub>]"
 *   href="/docs/docs/modules/<slug>[/<sub>]"                   → href="/modules/<slug>/manual[/<sub>]"
 *   href="/docs/docs/<other>"                                  → href="/docs/<other>"
 *
 * Important: the slug/subpath mappings MUST split the first path segment
 * (the product slug) from anything that follows, so that `/manual` is
 * injected AFTER the slug and BEFORE the subpath (e.g.
 * `/docs/docs/instruments/videomancer/quick-start` must become
 * `/instruments/videomancer/manual/quick-start`, NOT
 * `/instruments/videomancer/quick-start/manual`).
 */
export function rewriteLegacyDocsLinks(html: string): string {
  let rewritten = html;

  // --- Category → Videomancer programs (exact target, no subpath) ---
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net\/docs\/category\/program-guides/gi,
    '/instruments/videomancer/manual/programs',
  );
  rewritten = rewritten.replace(
    /https?:\/\/lzxindustries\.net\/docs\/docs\/category\/program-guides/gi,
    '/instruments/videomancer/manual/programs',
  );

  // --- Absolute URLs with /docs/docs/ prefix (main domain) ---
  // Split <slug> from optional /<subpath> so /manual lands BETWEEN them.
  rewritten = rewritten.replace(
    /https?:\/\/lzxindustries\.net\/docs\/docs\/instruments\/([^"'\s<\/]+)((?:\/[^"'\s<]*)?)/gi,
    '/instruments/$1/manual$2',
  );
  rewritten = rewritten.replace(
    /https?:\/\/lzxindustries\.net\/docs\/docs\/modules\/([^"'\s<\/]+)((?:\/[^"'\s<]*)?)/gi,
    '/modules/$1/manual$2',
  );
  rewritten = rewritten.replace(
    /https?:\/\/lzxindustries\.net\/docs\/docs\/(?!instruments\/|modules\/)([^"'\s<]*)/gi,
    '/docs/$1',
  );

  // --- Absolute URLs on docs.lzxindustries.net subdomain ---
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net\/docs\/instruments\/([^"'\s<\/]+)((?:\/[^"'\s<]*)?)/gi,
    '/instruments/$1/manual$2',
  );
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net\/docs\/modules\/([^"'\s<\/]+)((?:\/[^"'\s<]*)?)/gi,
    '/modules/$1/manual$2',
  );
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net(\/docs\/[^"'\s<]*)/gi,
    '$1',
  );

  // --- Same-origin href="/docs/docs/*" and href="/docs/category/*" forms ---
  rewritten = rewritten.replace(
    /(href=["'])\/docs\/category\/[^"']+(["'])/gi,
    '$1/docs$2',
  );
  rewritten = rewritten.replace(
    /(href=["'])\/docs\/docs\/instruments\/([^"'\/]+)((?:\/[^"']*)?)(["'])/gi,
    '$1/instruments/$2/manual$3$4',
  );
  rewritten = rewritten.replace(
    /(href=["'])\/docs\/docs\/modules\/([^"'\/]+)((?:\/[^"']*)?)(["'])/gi,
    '$1/modules/$2/manual$3$4',
  );
  rewritten = rewritten.replace(
    /(href=["'])\/docs\/docs\/([^"']+)(["'])/gi,
    '$1/docs/$2$3',
  );

  return rewritten;
}
