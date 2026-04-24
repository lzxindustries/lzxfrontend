# Product content: full coverage (plan and definitions)

This document defines what “full coverage” means for the LZX product hub, how it is **measured**, and how it is **maintained** with scripts so editorial work is incremental rather than a one-off sprint.

## Scope

| Layer | What “covered” means | Source of truth |
|-------|----------------------|-----------------|
| **Hub registry** | Every row in the hub matrix from `db/lzxdb.Module.json` (minus accessories) plus instruments | `scripts/audit-product-content.mjs` (mirrors `app/data/product-slugs.ts` rules) |
| **Shopify mirror** | `catalog/shopify/products/<handle>/{product.json,seo.json,...}` | `yarn shopify:sync:pull` + authoring |
| **Generated catalog** | `app/data/generated/product-catalog.json` | `yarn catalog:bootstrap` after mirror edits |
| **Manual tab** | `content/docs/modules/<slug>.md` or `.../index.md` with `draft: false` in prod | `getDocPage` / `listDocsInSection` |
| **Support tab** | Optional `content/support/<slug>.md`; manifest in `SUPPORT_MANIFEST` | `loadSupportContent` |
| **SEO (store + hub)** | `seo.json` with non-null `title` and `description` for active products | `seo.json` per handle |
| **Learn (instruments only)** | `INSTRUMENT_LEARN_CARDS[slug]` with real destinations | `app/data/instrument-learn-cards.ts` |

**Out of scope for automated “coverage”:** copy quality, legal review, and live **Shopify Admin** unless you run `yarn shopify:sync:push` / `apply`. The repo mirror can be 100% filled while the live store lags.

## Tiers of completeness

1. **Tier A — System coverage (CI-friendly)**  
   Every hub slug has: shippable manual *or* explicit exception; `seo.json` not empty where the product is ACTIVE; `SUPPORT_MANIFEST` slugs either have a support file with navigational FAQ *or* are listed in the audit as “intentionally empty” (legacy-only products).  
   **Tooling:** `yarn audit:content`, `node scripts/fill-missing-seo.mjs`, `node scripts/generate-module-manual-stubs.mjs`, `node scripts/generate-support-nav-stubs.mjs`.

2. **Tier B — Editorial**  
   Manuals are technically accurate, on-voice per `content/docs/WRITING_STYLE_GUIDE.md`, and not redundant with Specs. Support FAQs answer *real* recurring questions.  
   **Tooling:** human + forum mining per `docs/content-audit/COMMUNITY_MINING_SOP.md`.

3. **Tier C — Commerce alignment**  
   Short Overview bodies, metafields, and live Shopify match the tab contract.  
   **Tooling:** Admin + `yarn shopify:sync:diff` / `apply`.

## Maintainer commands

| Command | Purpose |
|---------|---------|
| `yarn audit:content` | Regenerates `docs/reports/product-content-audit.md` (matrix + P0 + gaps) |
| `node scripts/fill-missing-seo.mjs` | Fills `seo.json` (and `product.seo`) when title/description are missing |
| `node scripts/generate-module-manual-stubs.mjs` | Creates **stub** module manuals from lzxdb + catalog (only if no file exists) |
| `node scripts/generate-support-nav-stubs.mjs` | Adds minimal support files for manifest slugs still missing a file (navigational FAQ) |
| `yarn catalog:bootstrap` | Refreshes `product-catalog.json` after mirror/SEO changes |
| `yarn search:index` | Rebuilds Pagefind (also runs at end of `yarn build`) |

## Stub vs. authored manuals

- **Stubs** (Tier A) exist so the Manual tab is never empty for catalog-backed modules: short overview, power/width when data exists, and a pointer to the **Specs** tab for lzxdb-backed connectors/controls.  
- **Authored** (Tier B) replace stubs over time; do not delete structural pointers until the long-form doc subsumes them.

## Re-running after pulls

1. `yarn shopify:sync:pull` (or your store sync)  
2. `node scripts/fill-missing-seo.mjs` (if new products lack SEO)  
3. `node scripts/generate-module-manual-stubs.mjs` (if new module slugs appear)  
4. `node scripts/generate-support-nav-stubs.mjs` (optional, idempotent)  
5. `yarn catalog:bootstrap`  
6. `yarn audit:content`  
7. `yarn search:index` (or `yarn build`)

## Success metrics (from audit)

- **P0 = 0** — no visible, active hub product without a shippable manual.  
- **SEO gaps = 0** — for products you care about in search, `seo.json` is fully populated.  
- **Support** — every manifest row either has a `.md` file *or* is explicitly deferred with product rationale (not silent drift).

The generated audit table is the single place to check regression.
