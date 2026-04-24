# Responsive audit — findings and fix plan

Comprehensive audit of desktop vs mobile responsiveness across every route in the Hydrogen/Remix storefront. Findings combine a static code scan with a runtime Playwright pass at 375 / 768 / 1280 (see `scripts/site-audit.mjs --responsive`). Severity tags map to tiers in the fix plan: **P0 = Tier 1** (global chrome), **P1 = Tier 2** (commerce), **P2 = Tier 3** (content, account, docs).

## Breakpoints in use

From [tailwind.config.js](../../tailwind.config.js):

| Token    | Min width         | Typical device               |
| -------- | ----------------- | ---------------------------- |
| (base)   | 0                 | small phone (320–511 px)     |
| `sm`     | 32em / 512 px     | large phone / small tablet   |
| `md`     | 48em / 768 px     | tablet portrait              |
| `lg`     | 64em / 1024 px    | tablet landscape / laptop    |
| `xl`     | 80em / 1280 px    | desktop                      |
| `2xl`    | 96em / 1536 px    | large desktop                |

Custom range variants `sm-max`, `sm-only`, `md-only`, `lg-only`, `xl-only`, `2xl-only` are also defined. Dynamic-viewport height utilities `h-screen-dynamic` / `--screen-height-dynamic` resolve to `100dvh` on supporting browsers.

## Test harness in place

- [playwright.config.ts](../../playwright.config.ts) ships `mobile-chrome` (Pixel 5), `mobile-safari` (iPhone 13), `tablet` (iPad gen 7), and exact-pixel projects `viewport-sm`/`md`/`lg`/`xl`/`2xl`.
- [e2e/responsive.spec.ts](../../e2e/responsive.spec.ts) exercises header/footer/overflow at six viewports. It currently tolerates a ~152 px overflow at 768 via `Math.max(OVERFLOW_TOLERANCE, diff <= 200 ? diff : 0)`; that bypass is removed in Phase C once Tier 1 lands.
- [scripts/site-audit.mjs](../../scripts/site-audit.mjs) crawls the sitemap + `EXTRA_ROUTES` and emits `audit-results/url-manifest.json` (279 URLs). The new `--responsive` flag runs the 3-viewport measurement pass and writes `audit-results/responsive-report.json`.

---

## Tier 1 — Global chrome (P0)

Issues here affect every page. Fix first so the regression-test net in Phase C can be tightened before everything else.

### Global overflow band-aid

- [app/styles/app.css](../../app/styles/app.css) L16–20 — `html, body { overflow-x: hidden }`. Hides every horizontal overflow bug instead of surfacing it; blocks the `scrollWidth - clientWidth` assertion in [e2e/responsive.spec.ts](../../e2e/responsive.spec.ts). **Remove last**, after the downstream overflows below are fixed.

### Footer

- [app/components/Footer.tsx](../../app/components/Footer.tsx) L153–211 — social icon row uses `grid grid-flow-col gap-4` (non-wrapping) inside a footer with `p-10` padding. At 320 px viewport width the eight 24 px icons clip under the right edge; the global overflow hack masks the clip.
- [app/styles/app.css](../../app/styles/app.css) L10–14 — existing `md`-only `grid-auto-flow: row` override for DaisyUI footer stays; it fixes the separate 5-column overflow at tablet width.

### Header and navigation drawer

- [app/components/Header.tsx](../../app/components/Header.tsx) L26–99 — icon graphics are 16 px (`iconSize = 16`); tap targets are below the 44 px guideline even with `menu` padding.
- [app/components/Header.tsx](../../app/components/Header.tsx) L106–107 — drawer offset hard-coded as `top-[64px]`. Use the `top-nav` token that already tracks `--height-nav: 4rem`.
- [app/components/Header.tsx](../../app/components/Header.tsx) L127–132 — search close `btn btn-ghost btn-sm btn-circle` is below 44 px.

### DocsSearch results panel

- [app/components/DocsSearch.tsx](../../app/components/DocsSearch.tsx) L166 — `absolute ... w-96` (384 px). Wider than the viewport on phones below ~400 px and wider than the header-search modal's `max-w-lg - mx-4` inner column. Clamp with `w-[min(24rem,calc(100vw-2rem))]` and anchor `left-0 right-0 mx-auto`.
- [app/components/DocsSearch.tsx](../../app/components/DocsSearch.tsx) L140 — "⌘K" placeholder is Mac-specific.

### Fixed bottom bars without safe-area padding

On notched iOS devices these sit under the home indicator:

- [app/components/CookieConsent.tsx](../../app/components/CookieConsent.tsx) (full-width `fixed bottom-0`)
- [app/routes/($lang).products.$productHandle.tsx](../../app/routes/($lang).products.$productHandle.tsx) L682–711 (mobile sticky add-to-cart)
- [app/routes/($lang).modules.$slug._index.tsx](../../app/routes/($lang).modules.$slug._index.tsx) L186 area (same pattern)
- [app/routes/($lang).instruments.$slug._index.tsx](../../app/routes/($lang).instruments.$slug._index.tsx) L200 area (same pattern)
- [app/routes/($lang).account.tsx](../../app/routes/($lang).account.tsx) L161–172 — toast `fixed top-4 right-4`, no horizontal safe inset on narrow screens.

All need `pb-[env(safe-area-inset-bottom)]` (or equivalent top/left/right inset) through a shared utility.

### Modal

- [app/components/Modal.tsx](../../app/components/Modal.tsx) L21–33 — `sm:max-w-sm` (24 rem) is cramped for the account/address forms inside it; close link is `hidden sm:block`, so mobile users can only dismiss via backdrop click. Widen panel and always show the close control.

### HubNavBar scroll affordance

- [app/components/HubNavBar.tsx](../../app/components/HubNavBar.tsx) L24–38 — `overflow-x-auto scrollbar-none` with `whitespace-nowrap` labels gives no visual cue that the row scrolls. Add left/right fade masks; verify `scrollbar-none` resolves (the current Tailwind config has no scrollbar plugin, so the utility may be a no-op).

### Cookie consent

- [app/components/CookieConsent.tsx](../../app/components/CookieConsent.tsx) L41 — `whitespace-nowrap` on the privacy policy link forbids a line break. L48–55 buttons use `btn-sm`; verify touch height ≥ 44 px after the safe-area fix.

---

## Tier 2 — Commerce (P1)

High-traffic conversion paths. Revenue-critical.

### Product grid density

- [app/components/Grid.tsx](../../app/components/Grid.tsx) L24 — `layout="products"` expands to `sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8`. Three columns from 512 px onward squeezes cards; eight columns at 1024 px is aggressively dense for the current card design.
- [app/components/FeaturedProducts.tsx](../../app/components/FeaturedProducts.tsx) L64–68 — page layout uses `sm:grid-cols-4 md:grid-cols-4`. Same density problem.
- Replacement cadence: `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`. Update `sizes` hints on [app/components/ProductCard.tsx](../../app/components/ProductCard.tsx) L114 and [app/components/FeaturedCollections.tsx](../../app/components/FeaturedCollections.tsx) L34 to reflect the new math.

### ProductCard title truncation

- [app/components/ProductCard.tsx](../../app/components/ProductCard.tsx) L119–174 — `whitespace-nowrap text-ellipsis` hides long titles entirely on narrow cards. Swap for `line-clamp-2` so the full product name can breathe in a 2-up grid.

### Cart drawer + cart page

- [app/components/Cart.tsx](../../app/components/Cart.tsx) L120–129 — discount input squeezed by `whitespace-nowrap shrink-0` apply button. Add `min-w-0` to the input wrapper and stack on narrow drawers.
- [app/components/Cart.tsx](../../app/components/Cart.tsx) L462–467 — qty/remove buttons are `w-10 h-10`. Raise to `w-11 h-11` for the 44 px touch guideline.
- [app/components/Cart.tsx](../../app/components/Cart.tsx) L103 — inline `style={{height: 18, marginRight: 4}}` on cart icon; move to utility classes.
- [app/components/Cart.tsx](../../app/components/Cart.tsx) L441–471 — long single-token product titles have no `break-words`; low probability but visible on test data.

### SortFilter

- [app/components/SortFilter.tsx](../../app/components/SortFilter.tsx) L55–62 — filter toggle is `w-8 h-8` (32 px). Raise to `w-11 h-11`.
- L66–71 — mobile open state is an in-flow accordion, not a drawer/overlay; long filter lists push main content down and steal the viewport. Convert to a Headless UI `Dialog` overlay.
- L380–407 — sort `Menu.Items` is `absolute right-0` with no `max-h`; on short phones it extends below the viewport.
- L287–311 — raw price `<input>` has only `text-black`; needs `w-full text-base` for mobile usability.

### ProductMediaGallery

- [app/components/ProductMediaGallery.tsx](../../app/components/ProductMediaGallery.tsx) L119–184 — chevron buttons rely on SVG `h-12 w-8` (48 × 32). Width must reach 44 px.
- L150–157 — video path sits inside `relative inset-y-[25%]` wrapper that fights the parent flex row; mobile width collapses the video frame awkwardly. Replace with a clean `aspect-video w-full` stage and drop the negative inset.

### Product / module / instrument sticky bars

Covered under Tier 1 safe-area item, but also verify vertical stacking: the product page stacks three CTAs (compare, add, buy-now on some variants) at 320 px width. Ensure `flex-wrap` or `flex-col` fallback.

---

## Tier 3 — Content, docs, account (P2)

Touches the most files, least user-visible per-page impact.

### Prose width

- [tailwind.config.js](../../tailwind.config.js) L66–68 — `max-w-prose-wide: 120ch`. At 1600 px monitors that produces line lengths well past the comfortable 60–75 character range for blog/docs/manual content. Reduce to `90ch`.

### MarkdownArticle padding

- [app/components/MarkdownArticle.tsx](../../app/components/MarkdownArticle.tsx) L14 — flat `px-8` (32 px on every breakpoint) stacks on top of route-level `px-6`. On `about.tsx` the content column is 96 px narrower than it should be on a 320 px viewport. Change to `px-4 sm:px-6 md:px-8`.

### Docs prose tables

- [app/styles/app.css](../../app/styles/app.css) L586–639 — `.docs-content table { @apply w-full ... }`. Wide tables overflow; the global `overflow-x: hidden` (slated for removal) was the only thing hiding it. Affected content:
  - 19 module docs in [content/docs/modules/](../../content/docs/modules/) contain raw `<table>` markup (`tbc2`, `swatch`, `sumdist`, `stairs`, `smx3`, `ribbons`, `proc`, `matte`, `keychain`, `fkg3`, `dwo3`, `dsg3`, `contour`, `angles`, `scrolls`, `stacker`, `switcher`, `esg3`, and others).
- Fix at the CSS layer: make `.docs-content table` a scrollable container (either wrap via rehype plugin or apply `display: block; overflow-x: auto` to the table itself with `width: max-content` on an inner wrapper).

### Blog MDX iframes

- Multiple posts in [content/blog/](../../content/blog/) use fixed `<iframe width="560" height="315">`: `2026-04-14-videomancer-demo-reel`, `arcs-and-anvils`, `light-at-the-end`, `chromagnon-testing-w3`, among others (22 files contain `<iframe` total).
- Add a rehype plugin (or post-ingest transform) that rewrites to `style="width:100%;aspect-ratio:16/9;border:0"`.

### DocLayout sidebar and viewport height

- [app/components/DocLayout.tsx](../../app/components/DocLayout.tsx) L27, L148 — `max-h-[calc(100vh-6rem)]`. Replace with a `--screen-height-dynamic` variant so mobile browsers with retractable URL bars don't clip the sidebar.
- L211–247 — mobile `MobileSidebar` is an in-flow toggle; long nav trees push the article down. Convert to a Headless UI `Dialog` drawer with focus trap.

### BlogLayout pagination

- [app/components/BlogLayout.tsx](../../app/components/BlogLayout.tsx) L135–159 — one button per page. With many pages the row wraps across 3-4 lines on phones. Condense to `« 1 … 5 6 7 … 42 »`.

### Account

- [app/routes/($lang).account.tsx](../../app/routes/($lang).account.tsx) L185–218 — stats grid is `grid-cols-2 md:grid-cols-4`. Stack to single column on the smallest phones: `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`.
- [app/routes/($lang).account.tsx](../../app/routes/($lang).account.tsx) L161–172 — toast has no horizontal insets on narrow screens; adjust to `inset-x-4 top-4 md:left-auto md:right-4 md:w-auto`.
- [app/routes/($lang).account.tsx](../../app/routes/($lang).account.tsx) L323 and [app/routes/($lang).account.orders._index.tsx](../../app/routes/($lang).account.orders._index.tsx) L142 — `sm:grid-cols-3` for order cards is too dense at 512–767 px. Raise the breakpoint: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- [app/routes/($lang).account.orders.$id.tsx](../../app/routes/($lang).account.orders.$id.tsx) L570, L620, L641 — raw `grid-cols-2` at base. Add `grid-cols-1 md:grid-cols-2`.
- L768 — `text-[9px]`; raise to `text-xs`.

### Misc

- [app/components/ForumArchiveSupportSection.tsx](../../app/components/ForumArchiveSupportSection.tsx) L103–111 — topic text column has no `min-w-0`; long titles push the `badge` off-screen on narrow layouts.
- [app/components/VideomancyLandingSections.tsx](../../app/components/VideomancyLandingSections.tsx) L204–213 — two CTA `<Link>` elements with `text-xs`. Bump to `text-sm min-h-11`.
- [app/components/CountrySelector.tsx](../../app/components/CountrySelector.tsx) L55–57 — `<summary>` has no `truncate` safety; localized labels can overflow the footer column. Add `truncate`.

---

## How to refresh this report

```bash
yarn dev &            # start local server on :3000
yarn audit:responsive # writes audit-results/responsive-report.json + screenshots
yarn test:e2e:responsive
```

Compare `audit-results/responsive-report.json` before/after. The acceptance bar is:

- `scrollWidth - clientWidth <= 20` at every viewport for every URL.
- Zero images wider than the viewport at 375 px.
- `e2e/responsive.spec.ts` passes without the tolerance bypass.
