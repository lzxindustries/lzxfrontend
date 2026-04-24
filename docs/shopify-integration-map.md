# Shopify ↔ Site Integration Map

This document catalogs every coupling point between the LZX storefront
(Hydrogen / Remix on Cloudflare Workers) and Shopify. It is the reference
artifact for the local-first migration tracked in
[`/memories/session/plan.md`](../memories/session/plan.md).

The structure mirrors the migration plan: it inventories what Shopify
currently provides, what local data already exists, and what the
post-migration shape will be.

---

## Section A — Routes that call Shopify (Storefront API)

Every route below issues at least one `context.storefront.query()` or
`storefront.mutate()`. "After-state" describes the planned end state once
the migration is complete.

|   # | Route                                                                                                                             | Today                                                                                                                                                                                                                 | After                                                                                                                                                                       |
| --: | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | [app/root.tsx](../app/root.tsx)                                                                                                   | `LAYOUT_QUERY` (shop name/logo, header & footer menus), `CART_QUERY` (deferred)                                                                                                                                       | Cart query stays. Layout becomes local: shop chrome from `app/config/shop.ts`, menus from `app/data/navigation.ts`                                                          |
|   2 | [app/lib/category-listing/loader.ts](../app/lib/category-listing/loader.ts)                                                       | `CATEGORY_LISTING_BY_IDS_QUERY` + `CATEGORY_LISTING_BY_HANDLES_QUERY` (id, title, handle, availableForSale, featuredImage, variants[0]) — feeds `($lang).{modules,instruments,cases-and-power,legacy,systems}._index` | Replaced by `getCommerceByHandles()` returning only `{variantId, price, compareAtPrice, availableForSale, quantityAvailable}`. Title/handle/image come from `ProductRecord` |
|   3 | [app/data/hub-loaders.ts](../app/data/hub-loaders.ts)                                                                             | `HUB_PRODUCT_QUERY` + `HUB_PRODUCT_BY_ID_QUERY` (full product + media + variants + metafields) and `RECOMMENDED_PRODUCTS_QUERY` — feeds module/instrument hub pages                                                   | Hub product query deleted. Hub render assembles from `getProductRecord(slug)` + `getCommerceByHandles([handle])`. Recommendations come from `ProductRecord.related[]`       |
|   4 | [app/routes/($lang).products.$productHandle.tsx](<../app/routes/($lang).products.$productHandle.tsx>)                             | `PRODUCT_QUERY` + `RECOMMENDED_PRODUCTS_QUERY`                                                                                                                                                                        | Same shape as hubs                                                                                                                                                          |
|   5 | [app/routes/($lang).collections.$collectionHandle.tsx](<../app/routes/($lang).collections.$collectionHandle.tsx>)                 | `COLLECTION_QUERY` (collection + products + filters)                                                                                                                                                                  | Either route deprecated or re-implemented over `listProductRecords()` with local "tag" facets                                                                               |
|   6 | [app/routes/($lang).collections.\_index.tsx](<../app/routes/($lang).collections._index.tsx>)                                      | `COLLECTIONS_QUERY`                                                                                                                                                                                                   | Local list of curated category links; no Shopify query                                                                                                                      |
|   7 | [app/routes/($lang).products.\_index.tsx](<../app/routes/($lang).products._index.tsx>)                                            | `ALL_PRODUCTS_QUERY`                                                                                                                                                                                                  | Local enumeration via `listProductRecords()` (or deprecate)                                                                                                                 |
|   8 | [app/routes/($lang).catalog.tsx](<../app/routes/($lang).catalog.tsx>)                                                             | `COLLECTION_QUERY` (master catalog + sub-collections)                                                                                                                                                                 | Local enumeration; sub-collection structure moves to `ProductRecord.tags`                                                                                                   |
|   9 | [app/routes/($lang).b-stock.tsx](<../app/routes/($lang).b-stock.tsx>)                                                             | `COLLECTION_QUERY` (b-stock collection)                                                                                                                                                                               | Local list filtered by `ProductRecord.tags.includes('b-stock')` + commerce snippet                                                                                          |
|  10 | [app/routes/($lang).featured-products.tsx](<../app/routes/($lang).featured-products.tsx>)                                         | `FEATURED_QUERY` (collections + featured products)                                                                                                                                                                    | Local curated list + commerce snippet                                                                                                                                       |
|  11 | [app/routes/($lang).api.products.tsx](<../app/routes/($lang).api.products.tsx>)                                                   | `PRODUCTS_QUERY` (bulk fetch by ids)                                                                                                                                                                                  | API replays from `listProductRecords()` + `getCommerceByHandles()`; investigate whether any callers remain                                                                  |
|  12 | [app/routes/($lang).api.predictive-search.tsx](<../app/routes/($lang).api.predictive-search.tsx>)                                 | `PREDICTIVE_SEARCH_QUERY` (products, collections, pages, articles)                                                                                                                                                    | Local search index built by `scripts/build-search-index.mjs` over `ProductRecord` + `content/blog` + `content/docs`                                                         |
|  13 | [app/routes/($lang).pages.$pageHandle.tsx](<../app/routes/($lang).pages.$pageHandle.tsx>)                                         | `PAGE_QUERY`                                                                                                                                                                                                          | Markdown under `content/pages/*.md` via `app/lib/content.server.ts`                                                                                                         |
|  14 | [app/routes/($lang).policies.\_index.tsx](<../app/routes/($lang).policies._index.tsx>)                                            | `POLICIES_QUERY`                                                                                                                                                                                                      | Render index from `policies/*.md` (already committed)                                                                                                                       |
|  15 | [app/routes/($lang).policies.$policyHandle.tsx](<../app/routes/($lang).policies.$policyHandle.tsx>)                               | `POLICY_CONTENT_QUERY`                                                                                                                                                                                                | Render markdown directly from `policies/*.md`                                                                                                                               |
|  16 | [app/routes/[sitemap.xml].tsx](../app/routes/[sitemap.xml].tsx)                                                                   | `SITEMAP_QUERY` (products, collections, pages handles + updatedAt)                                                                                                                                                    | Enumerate from `listProductRecords()` + `content/` collections + `policies/`                                                                                                |
|  17 | [app/routes/($lang).cart.tsx](<../app/routes/($lang).cart.tsx>)                                                                   | All cart mutations (`cartCreate`, `cartLinesAdd`, `cartLinesRemove`, `cartLinesUpdate`, `cartBuyerIdentityUpdate`, `cartDiscountCodesUpdate`, `cartNoteUpdate`)                                                       | **Stays Shopify**                                                                                                                                                           |
|  18 | [app/routes/($lang).account.login.tsx](<../app/routes/($lang).account.login.tsx>)                                                 | `customerAccessTokenCreate` mutation                                                                                                                                                                                  | **Stays Shopify**                                                                                                                                                           |
|  19 | [app/routes/($lang).account.register.tsx](<../app/routes/($lang).account.register.tsx>)                                           | `customerCreate` mutation                                                                                                                                                                                             | **Stays Shopify**                                                                                                                                                           |
|  20 | [app/routes/($lang).account.activate.$id.$activationToken.tsx](<../app/routes/($lang).account.activate.$id.$activationToken.tsx>) | `customerActivateByUrl` mutation                                                                                                                                                                                      | **Stays Shopify**                                                                                                                                                           |
|  21 | [app/routes/($lang).account.recover.tsx](<../app/routes/($lang).account.recover.tsx>)                                             | `customerRecover` mutation                                                                                                                                                                                            | **Stays Shopify**                                                                                                                                                           |
|  22 | [app/routes/($lang).account.reset.$id.$resetToken.tsx](<../app/routes/($lang).account.reset.$id.$resetToken.tsx>)                 | `customerReset` mutation                                                                                                                                                                                              | **Stays Shopify**                                                                                                                                                           |
|  23 | [app/routes/($lang).account.edit.tsx](<../app/routes/($lang).account.edit.tsx>)                                                   | `customerUpdate` mutation                                                                                                                                                                                             | **Stays Shopify**                                                                                                                                                           |
|  24 | [app/routes/($lang).account.address.$id.tsx](<../app/routes/($lang).account.address.$id.tsx>)                                     | `customerAddressCreate/Update/Delete`, `customerDefaultAddressUpdate`                                                                                                                                                 | **Stays Shopify**                                                                                                                                                           |
|  25 | [app/routes/($lang).account.orders.\_index.tsx](<../app/routes/($lang).account.orders._index.tsx>)                                | `ORDERS_QUERY` (customer orders by access token)                                                                                                                                                                      | **Stays Shopify**                                                                                                                                                           |
|  26 | [app/routes/($lang).account.orders.$id.tsx](<../app/routes/($lang).account.orders.$id.tsx>)                                       | `ORDERS_QUERY` (single order)                                                                                                                                                                                         | **Stays Shopify**                                                                                                                                                           |

---

## Section B — Shopify GraphQL fragments and queries

| Source                                                                                                | Symbol                                                                                            | Field surface today                                                                                                               | Migration                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [app/data/fragments.ts](../app/data/fragments.ts)                                                     | `MEDIA_FRAGMENT`                                                                                  | Image, Video, Model3d, ExternalVideo with URLs/dims                                                                               | **Delete** in Phase 7. Media comes from `ProductRecord.gallery`                                                                                            |
| [app/data/fragments.ts](../app/data/fragments.ts)                                                     | `PRODUCT_CARD_FRAGMENT`                                                                           | id, title, handle, availableForSale, variants (price, compareAtPrice, quantityAvailable, image), metafield `descriptors:subtitle` | **Delete** in Phase 7                                                                                                                                      |
| [app/data/hub-loaders.ts](../app/data/hub-loaders.ts)                                                 | `HUB_PRODUCT_QUERY`, `HUB_PRODUCT_BY_ID_QUERY`                                                    | Full product + 20 media + 250 variants + metafields (specs, features, compatibility, subtitle) + shop info                        | **Delete** in Phase 7                                                                                                                                      |
| [app/data/hub-loaders.ts](../app/data/hub-loaders.ts)                                                 | `RECOMMENDED_PRODUCTS_QUERY`                                                                      | productRecommendations + best-selling fallback                                                                                    | **Delete** in Phase 7; `ProductRecord.related[]` replaces it                                                                                               |
| [app/lib/category-listing/queries.ts](../app/lib/category-listing/queries.ts)                         | `CATEGORY_LISTING_FRAGMENT`, `CATEGORY_LISTING_BY_IDS_QUERY`, `CATEGORY_LISTING_BY_HANDLES_QUERY` | id, title, handle, availableForSale, featuredImage, variants(first:1)                                                             | **Slim** in Phase 4 to just `{id, availableForSale, variants(first:1){id, price, compareAtPrice, quantityAvailable}}`, or move into `getCommerceByHandles` |
| [app/routes/($lang).products.$productHandle.tsx](<../app/routes/($lang).products.$productHandle.tsx>) | `PRODUCT_QUERY` (~L834)                                                                           | Same as hub query                                                                                                                 | **Delete** when route is migrated                                                                                                                          |
| [app/routes/($lang).cart.tsx](<../app/routes/($lang).cart.tsx>)                                       | All `cart*` mutations                                                                             | Cart line items, costs, checkoutUrl                                                                                               | **Stays**                                                                                                                                                  |
| [app/root.tsx](../app/root.tsx)                                                                       | `LAYOUT_QUERY`                                                                                    | shop.{name, description, primaryDomain, logo}, headerMenu, footerMenu                                                             | **Delete** in Phase 5; data moves local                                                                                                                    |
| [app/root.tsx](../app/root.tsx)                                                                       | `CART_QUERY`                                                                                      | Cart hydration                                                                                                                    | **Stays**                                                                                                                                                  |

After migration, the **only** Shopify GraphQL surface in the runtime app should be:

1. `CART_QUERY` and all cart mutations (storefront API)
2. `customer*` queries and mutations (storefront API)
3. `getCommerceByHandles` — a tiny new query in
   [app/data/shopify-live.server.ts](../app/data/shopify-live.server.ts)
   returning `{variantId, price, compareAtPrice, availableForSale,
quantityAvailable}`
4. The order-edit check in [app/lib/admin.server.ts](../app/lib/admin.server.ts)
   (Admin API, not Storefront)

---

## Section C — Components consuming Shopify types

| Component                                                                           | Shopify dependency today                                                                   | Migration                                                                                                                                |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [app/components/ProductCard.tsx](../app/components/ProductCard.tsx)                 | `Product` type, `MoneyV2`, `useMoney` hook, metafield `descriptors:subtitle`               | Switch props to `ProductRecord + CommerceSnippet?`                                                                                       |
| [app/components/ProductMediaGallery.tsx](../app/components/ProductMediaGallery.tsx) | Adapter for Shopify `Media` (Image/Video/ExternalVideo)                                    | Consume `ProductRecord.gallery` directly; drop adapter                                                                                   |
| [app/components/CategoryListing.tsx](../app/components/CategoryListing.tsx)         | `image.shopify` fallback (`<Image data=...>`)                                              | Drop Shopify image branch once `ProductRecord.gallery[0]` covers every entry; render price/sale/stock from `entry.commerce`              |
| [app/components/Cart.tsx](../app/components/Cart.tsx)                               | `Cart`, `CartLine`, `CartCost`, `CartCheckoutActions`, `<Money>`                           | **Stays Shopify** for cart costs / `checkoutUrl`. Per-line title/image looked up via `getProductRecord(line.merchandise.product.handle)` |
| `ProductForm` (in product/hub routes)                                               | `VariantSelector`, `<Money>`, hardcoded preorder GID `gid://shopify/Product/4319674761239` | Receives `CommerceSnippet`. Preorder flag moves to `ProductRecord.isPreorder`                                                            |
| [app/components/PredictiveSearch.tsx](../app/components/PredictiveSearch.tsx)       | `<Money>` for variant prices                                                               | Switch to results from local index + `getCommerceByHandles()` for price                                                                  |
| `AddToCartButton`, `ShopPayButton` (from `@shopify/hydrogen`)                       | Cart line input, store domain                                                              | **Stays Shopify**                                                                                                                        |
| `<Money>`, `useMoney` (from `@shopify/hydrogen`)                                    | `MoneyV2`                                                                                  | **Kept** — used for cart costs and for `CommerceSnippet` price rendering                                                                 |

---

## Section D — Mutations and session state

| Domain                 | Surface                                                                                                                                    | Status    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| Cart mutations         | `cartCreate`, `cartLinesAdd`, `cartLinesRemove`, `cartLinesUpdate`, `cartBuyerIdentityUpdate`, `cartDiscountCodesUpdate`, `cartNoteUpdate` | **Stays** |
| Checkout               | `cart.checkoutUrl` (Shopify-hosted)                                                                                                        | **Stays** |
| Customer auth          | `customerAccessTokenCreate`, `customerCreate`, `customerActivateByUrl`, `customerRecover`, `customerReset`, `customerUpdate`               | **Stays** |
| Customer addresses     | `customerAddressCreate/Update/Delete`, `customerDefaultAddressUpdate`                                                                      | **Stays** |
| Order history          | `ORDERS_QUERY` with access token                                                                                                           | **Stays** |
| Session storage        | Cart id + customer access token in Remix session cookie (no DB)                                                                            | **Stays** |
| Order edit (Admin API) | `order.fulfillmentOrders` via `app/lib/admin.server.ts`                                                                                    | **Stays** |

---

## Section E — Local data inventory (today)

### App-level data modules

| File                                                                        | Purpose                                                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [app/data/lfs-product-metadata.ts](../app/data/lfs-product-metadata.ts)     | Walks `lfs/library/products/**` via `import.meta.glob`. **Removed in migration**            |
| [app/data/product-slugs.ts](../app/data/product-slugs.ts)                   | Canonical slug ↔ doc path ↔ lzxdb id ↔ Shopify handle mapping                               |
| [app/data/lzxdb.ts](../app/data/lzxdb.ts)                                   | Loads `db/lzxdb.*.json` exports into lookup maps (modules, patches, videos, glossary, etc.) |
| [app/data/module-specs.ts](../app/data/module-specs.ts)                     | Module specifications for `/modules/specs`                                                  |
| [app/data/module-artwork.ts](../app/data/module-artwork.ts)                 | `getModuleArtworkPath(slug)`                                                                |
| [app/data/instrument-artwork.ts](../app/data/instrument-artwork.ts)         | `getInstrumentArtworkPath(slug)`                                                            |
| [app/data/legacy-module-docs.ts](../app/data/legacy-module-docs.ts)         | Synthetic legacy module hub content                                                         |
| [app/data/forum-archive.server.ts](../app/data/forum-archive.server.ts)     | Community forum archive (also `import.meta.glob('/lfs/library/scrape/...')`)                |
| [app/data/support-content.server.ts](../app/data/support-content.server.ts) | Static page content from markdown (about, getting-started, etc.)                            |
| [app/data/support-manifest.ts](../app/data/support-manifest.ts)             | Docs/support manifest                                                                       |
| [app/data/github-releases.ts](../app/data/github-releases.ts)               | GitHub release data                                                                         |
| [app/data/cache.ts](../app/data/cache.ts)                                   | `CACHE_SHORT/LONG/NONE` directives                                                          |
| [app/data/countries.ts](../app/data/countries.ts)                           | Country list for cart buyer identity                                                        |
| [app/data/hub-loaders.ts](../app/data/hub-loaders.ts)                       | Hub page loaders (Shopify + local merge)                                                    |
| [app/data/fragments.ts](../app/data/fragments.ts)                           | Shared GraphQL fragments                                                                    |
| [app/lib/category-listing/](../app/lib/category-listing/)                   | Shared category-listing infra (loader, queries, types)                                      |
| [app/data/category-pages/](../app/data/category-pages/)                     | Per-category configs (modules, instruments, cases-and-power, legacy, systems)               |

### Repo data sources

| Path                                                                 | Purpose                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `db/lzxdb.*.json`                                                    | 25 MongoDB exports (modules, patches, artists, videos, parts, etc.) |
| `content/docs/`                                                      | Markdown product/instrument documentation with frontmatter          |
| `content/blog/`                                                      | Markdown blog posts                                                 |
| `policies/*.md`                                                      | Legal policies (already authored, not yet wired into routes)        |
| `catalog/shopify/products/<handle>/`                                 | Per-handle Shopify mirror — JSON, description.html, media           |
| `catalog/shopify/catalog.json`                                       | 133-product Shopify index (handle/title/updatedAt)                  |
| `public/assets/`, `public/images/`, `public/icons/`, `public/media/` | Web-shipped static assets                                           |
| `lfs/library/products/`                                              | **Local-only ingest source**, NEVER deployed; requires processing   |
| `lfs/library/scrape/`, `lfs/library/brand/`, etc.                    | Other local-only ingest sources                                     |

### Runtime references to `lfs/` that must be removed

| File                                                                    | Pattern                                                                                               |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [app/data/lfs-product-metadata.ts](../app/data/lfs-product-metadata.ts) | `import.meta.glob('../../lfs/library/products/**/*.json')` and 4 more globs                           |
| [app/data/forum-archive.server.ts](../app/data/forum-archive.server.ts) | `import.meta.glob('../../lfs/library/scrape/community/topics/*.json')`                                |
| [app/data/module-specs.ts](../app/data/module-specs.ts)                 | `import.meta.glob('../../lfs/library/products/eurorack-modules/visionary/*/modulargrid/metadata.md')` |

These three files all need build-time ingest replacements.

---

## Section F — Stay-Shopify surface (post-migration)

After all phases complete, the `lzxfrontend` app's only Shopify dependencies are:

1. **Cart** ([app/routes/($lang).cart.tsx](<../app/routes/($lang).cart.tsx>),
   [app/components/Cart.tsx](../app/components/Cart.tsx),
   `CART_QUERY` in [app/root.tsx](../app/root.tsx))
   — all cart mutations + `cart.checkoutUrl`.

2. **Customer accounts**
   ([app/routes/($lang).account.\*](../app/routes)) — login, register,
   activate, recover, reset, edit, addresses, orders.

3. **Live commerce data** — `getCommerceByHandles(handles[])` in
   [app/data/shopify-live.server.ts](../app/data/shopify-live.server.ts)
   (a single tiny Storefront API query) returning
   `{variantId, price, compareAtPrice, availableForSale, quantityAvailable, stockState}`
   per handle. Cached `s-maxage=60, stale-while-revalidate=300`.

4. **Admin API order edit check**
   ([app/lib/admin.server.ts](../app/lib/admin.server.ts)) — current
   order-fulfillment query for the address-edit flow.

5. **Notify Me** ([app/routes/($lang).api.notify-me.tsx](<../app/routes/($lang).api.notify-me.tsx>))
   — Klaviyo integration (not Shopify, but commerce-adjacent).

Everything else (titles, descriptions, media, specs, metafields, menus,
pages, policies, predictive search, sitemap, recommendations, listings,
collection facets) renders from local data.

---

## Section G — Move-local surface (post-migration target)

| Domain                                   | New local source                                                                                      | Replaces                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Product titles, subtitles, descriptions  | `app/data/generated/product-catalog.json` (built from `lfs/library/products/`) → `getProductRecord()` | Shopify `product.title`, `product.descriptionHtml`, metafield `descriptors:subtitle` |
| Product gallery media                    | `public/assets/products/<category>/<slug>/...`                                                        | Shopify `product.media`                                                              |
| Product downloads                        | `public/downloads/products/<slug>/...`                                                                | (was `lfs/.../downloads/` via runtime glob)                                          |
| Product specs / features / compatibility | `ProductRecord.specs` / `.features` / `.compatibility`                                                | Shopify metafields                                                                   |
| Recommended / related products           | `ProductRecord.related[]`                                                                             | `RECOMMENDED_PRODUCTS_QUERY`                                                         |
| Listing page enumeration                 | `listProductRecords({category, series})`                                                              | `CATEGORY_LISTING_BY_IDS/HANDLES_QUERY` content fields                               |
| Header / footer menus                    | `app/data/navigation.ts`                                                                              | `LAYOUT_QUERY` menus                                                                 |
| Shop name / logo                         | `app/config/shop.ts`                                                                                  | `LAYOUT_QUERY` shop fields                                                           |
| Static pages                             | `content/pages/*.md`                                                                                  | `PAGE_QUERY`                                                                         |
| Legal policies                           | `policies/*.md`                                                                                       | `POLICIES_QUERY` / `POLICY_CONTENT_QUERY`                                            |
| Predictive search                        | Local index from `scripts/build-search-index.mjs`                                                     | `PREDICTIVE_SEARCH_QUERY`                                                            |
| Sitemap                                  | Local enumeration                                                                                     | `SITEMAP_QUERY`                                                                      |
| Pricing (catalog input only)             | `app/data/pricing.json` (committed) → pushed via `shopify-sync`                                       | (Shopify is the live read source at runtime)                                         |

---

## Section H — Build-time ingest pipeline (planned)

1. **`scripts/ingest-lfs-assets.mjs`** — walks `lfs/library/products/**`,
   copies web-publishable images into `public/assets/products/`, copies
   downloads into `public/downloads/products/`, emits
   `app/data/generated/product-catalog.json` (content only) and a
   sha256 manifest.
2. **`scripts/seed-local-from-pulled.mjs`** — one-shot bootstrap. Reads
   the existing `catalog/shopify/products/<handle>/` mirror (already
   produced by `yarn shopify:sync:pull`) and emits the initial
   `app/data/generated/product-catalog.json` + `app/data/pricing.json`.
   Run once at start of Phase 1; never run again after that.
3. **Existing `scripts/shopify-sync.mjs`** — extended `seed` step now
   reads `app/data/generated/product-catalog.json` + `app/data/pricing.json`
   and writes the per-handle directories that `push --apply` consumes.
4. **`yarn catalog:build`** = `ingest:lfs && shopify:sync:seed && shopify:sync:diff`
   — runs at build time and gives authors a quick local feedback loop.
5. **`yarn catalog:push`** = `shopify:sync:push --apply` — operator
   action only, never part of the build.

### What gets committed

- `app/data/generated/product-catalog.json` (content snapshot, build artifact)
- `app/data/generated/product-catalog.manifest.json` (sha256 per ingested file)
- `app/data/pricing.json` (human-edited price authoring source)
- `public/assets/products/**` (ingested images)
- `public/downloads/products/**` (ingested downloads)
- `catalog/shopify/products/<handle>/**` (Shopify-facing mirror, kept in sync by `shopify-sync seed`)

### What stays gitignored

- `lfs/` (entire mount; ingest source only)
- The runtime cache produced by Cloudflare Workers

---

## Section I — Per-route after-state matrix

Legend: **L** = local data, **S** = Shopify (live), **C** = `CommerceSnippet`
(price + stock from Shopify, never stored).

| Route                                                                         |   Title / desc / media    |     Price     | Stock | Add-to-cart | Other                                                   |
| ----------------------------------------------------------------------------- | :-----------------------: | :-----------: | :---: | :---------: | ------------------------------------------------------- |
| `/products/$handle`                                                           |             L             |       C       |   C   |      S      | Specs/downloads/related from L                          |
| `/modules/$slug._index`                                                       |             L             |       C       |   C   |      S      | Patches/videos from L                                   |
| `/modules/_index`                                                             |             L             |       C       |   C   |      —      | Sections/groups from L config                           |
| `/instruments/$slug._index`                                                   |             L             |       C       |   C   |      S      | Same as modules                                         |
| `/instruments/_index`                                                         |             L             |       C       |   C   |      —      | Same as modules                                         |
| `/cases-and-power`                                                            |             L             |       C       |   C   |      —      | Same as modules                                         |
| `/systems`                                                                    |             L             |       C       |   C   |      —      | Same as modules                                         |
| `/systems/$slug`                                                              |             L             |       C       |   C   |      S      | Same as modules                                         |
| `/legacy`                                                                     |             L             |       —       |   —   |      —      | Discontinued — no commerce call                         |
| `/featured-products`                                                          |             L             |       C       |   C   |      —      | Curated list from L                                     |
| `/b-stock`                                                                    |             L             |       C       |   C   |      S      | Filtered by `tags.includes('b-stock')`                  |
| `/catalog`, `/products/_index`, `/collections/_index`, `/collections/$handle` |      L (or removed)       |       C       |   C   |      —      | Investigate during Phase 4                              |
| `/cart`, `/cart/$lines`                                                       | L (line title/img lookup) | S (cart cost) |   —   |      S      | All mutations stay Shopify                              |
| `/account.*`                                                                  |             —             |       —       |   —   |      —      | All Shopify (auth, addresses, orders)                   |
| `/pages/$handle`                                                              |       L (markdown)        |       —       |   —   |      —      | `PAGE_QUERY` removed                                    |
| `/policies`, `/policies/$handle`                                              |    L (`policies/*.md`)    |       —       |   —   |      —      | `POLICIES_QUERY` removed                                |
| `/blog/*`, `/docs/*`                                                          |             L             |       —       |   —   |      —      | Already local                                           |
| `/api/predictive-search`                                                      |      L (local index)      | C (optional)  |   —   |      —      | `PREDICTIVE_SEARCH_QUERY` removed                       |
| `/api/products`                                                               |           L + C           |       C       |   C   |      —      | Investigate callers; possibly removable                 |
| `/sitemap.xml`                                                                |             L             |       —       |   —   |      —      | `SITEMAP_QUERY` removed                                 |
| `/` (root layout)                                                             |  L (menus, shop chrome)   |       —       |   —   |      —      | `LAYOUT_QUERY` removed (or trimmed); `CART_QUERY` stays |

---

## Admin API token & required scopes

The site uses a Shopify custom app authenticated via the
`client_credentials` flow with `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET`.
Existing code paths imply the following scopes are already granted; the
operator should verify in **Shopify Admin → Settings → Apps and sales
channels → Develop apps → [your custom app] → Configuration → Admin API
access scopes**:

| Scope                                                 | Used by                                               |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `read_products`, `write_products`                     | `productSet`, `productUpdate`, `metafieldsSet` (push) |
| `write_files`                                         | `stagedUploadsCreate` (media uploads in push)         |
| `read_publications`, `write_publications`             | `publishablePublish` (push to Online Store)           |
| `read_legal_policies`, `write_legal_policies`         | `shopPolicyUpdate` (store-sync)                       |
| `read_online_store_pages`, `write_online_store_pages` | `pageCreate` / `pageUpdate` (store-sync)              |
| `read_orders`                                         | runtime order-edit check in `app/lib/admin.server.ts` |

**No additional scopes are required for the migration.** The Storefront
API token (`PUBLIC_STOREFRONT_API_TOKEN`) needs no changes —
`{price, compareAtPrice, availableForSale, quantityAvailable}` are all
already returned. `quantityAvailable` only requires that "Track quantity"
is enabled on each variant in Shopify.

---

## Cross-references

- Migration plan: [`/memories/session/plan.md`](../memories/session/plan.md)
- Existing LFS audit: [docs/lfs-products-integration-audit.md](lfs-products-integration-audit.md)
- LFS backlog: [docs/lfs-products-integration-backlog.md](lfs-products-integration-backlog.md)
- Sync CLI README section: [README.md](../README.md) — "Shopify Catalog Sync"
- Repo deploy notes: [`/memories/repo/deploy-notes.md`](../memories/repo/deploy-notes.md)
