# Markdown rendering parity audit

Compares every URL in the Docusaurus sitemap at
`https://docs.lzxindustries.net/sitemap.xml` against the Hydrogen
storefront. Focuses on three failure modes the legacy platform
survives but a mis-ported site can regress:

- **Content parity** — does the live URL render the same (or a
  deliberately updated) version of the source markdown?
- **Media parity** — do images, video, and embed references still
  resolve?
- **Rendering artifacts** — does any raw markdown (`![]()`,
  fenced code, heading markers) leak into rendered output?

## How to rerun

1. Start the dev server: `yarn dev --port 3456`
2. From any shell with Python + `requests` + `beautifulsoup4`, run
   the audit script in
   [`scripts/audit-markdown-parity.mjs`](../../scripts/audit-markdown-parity.mjs)
   (or the inline variant used to produce the summary below).
3. Against production, swap the `LIVE` base in the script to
   `https://lzxindustries.net`.

## Findings — 2026-04-24 (post-remediation)

| Bucket                                          | Count |
| ----------------------------------------------- | ----- |
| Docusaurus URLs audited                         | 131   |
| Live `HTTP 200` with matching content           | 103   |
| Live `HTTP 200` with expected structural drift  | 26    |
| Live non-200 (`/blog/archive`, `/blog/authors`) | 2     |
| Markdown rendering artifacts detected           | 0     |
| Pages with live media count < docs media count  | 52    |

### Remediated in this pass

- **Videomancer program pages** (23 URLs): frontmatter `slug:` values
  like `/instruments/videomancer/bitcullis` were being ignored. The
  files live under `content/docs/instruments/videomancer/programs/`
  but render at flat URLs per frontmatter. `getDocPage` and
  `hasDocPagePath` in
  [`app/lib/content.server.ts`](../../app/lib/content.server.ts) now
  consult a slug alias index; sidebar items carry a `urlPath` so
  `linkBuilder` and `getPrevNext` match the canonical URL.
- **Blog slug swap**: the `2023-12-22-the-year-in-review/` and
  `2023-12-30-the-molten-core/` folders had their contents swapped
  relative to their date prefixes, which made
  `/blog/the-year-in-review` 301 to `/blog/the-molten-core`. The
  folders are now dated to match their content
  ([`content/blog/2023-12-22-the-molten-core/`](../../content/blog/2023-12-22-the-molten-core/),
  [`content/blog/2023-12-30-the-year-in-review/`](../../content/blog/2023-12-30-the-year-in-review/)).
- **Docusaurus category URLs**:
  `/docs/category/program-guides` → `/docs` and
  `/docs/category/videomancer` → `/instruments/videomancer/manual/quick-start`
  now 301 at the apex as well as at
  `docs.lzxindustries.net`. Implemented in
  [`app/routes/($lang).docs.$.tsx`](../../app/routes/($lang).docs.$.tsx)
  with coverage in
  [`app/__tests__/routes/canonical-redirects.test.ts`](../../app/__tests__/routes/canonical-redirects.test.ts).

### Remaining drift (expected, not regressions)

- `/blog/archive`, `/blog/authors` — Docusaurus-only listings with
  no corresponding content on the new site. Legacy host traffic is
  already 301'd to `/blog` in
  [`server.ts`](../../server.ts); apex direct hits remain 404 on
  purpose.
- **Home, about-lzx, what-is-a-video-synthesizer, module-list**:
  intentional rewrites or layout changes
  (`/docs/modules/module-list` is served by the new
  `/modules/specs` interactive table).
- **Blog tag / listing pages** (`/blog`, `/blog/tags/*`): Docusaurus
  renders excerpts inline; the Hydrogen listing is card-based. The
  underlying posts are present.
- **Media count deltas**: every delta traced back to the Docusaurus
  author-avatar image (`https://github.com/creatorlars.png`) that
  the Docusaurus author block embeds but the Remix `BlogPostView`
  renders as a styled byline without an avatar. Not content loss.

### Safeguards

Regression tests covering the above live in:

- [`app/__tests__/lib/content.server.test.ts`](../../app/__tests__/lib/content.server.test.ts)
  — slug alias resolves Videomancer program pages; year-in-review
  blog post resolves to its own content; sidebar nav matches URL
  path.
- [`app/__tests__/routes/canonical-redirects.test.ts`](../../app/__tests__/routes/canonical-redirects.test.ts)
  — legacy Docusaurus category URLs 301 to canonical targets.
