# Generated reports

Operator workflows for Shopify mirrors and catalog maintenance are documented in the repo root [README.md](../../README.md) (sections **Shopify CLIs** and **Shopify Catalog Sync** / **Shopify Store Sync**). Customer-facing documentation source lives under [`content/docs/`](../../content/docs/), not in this folder.

| Report                                                                         | How to refresh                                                                                                                                             |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [product-content-audit.md](product-content-audit.md)                           | `yarn audit:content` from the repo root                                                                                                                    |
| [PRODUCT_CONTENT_FULL_COVERAGE_PLAN.md](PRODUCT_CONTENT_FULL_COVERAGE_PLAN.md) | Authoring: tier definitions, `yarn content:coverage`, `yarn content:apply-overviews` (short Shopify bodies), and live `shopify:sync:pull` / `push --apply` |
| [STATIC_PAGES_DRIFT.md](STATIC_PAGES_DRIFT.md)                                 | Process note for Online Store page vs. app (re-run when legal/marketing copy changes)                                                                      |

See [docs/content-audit/P0_CRITERIA.md](../content-audit/P0_CRITERIA.md) for what P0 / P1 / P2 mean in the audit.

**Shopify:** Product bodies and `seo.json` under `catalog/shopify/products/<handle>/` are the local mirror. After a `shopify:sync:pull`, if `push --apply` fails on variant position for single-SKU products, run `yarn catalog:normalize-variants`. After editing them, run `yarn catalog:bootstrap` to refresh `app/data/generated/product-catalog.json`, then use your normal `yarn shopify:sync:diff` / `shopify:sync:apply` workflow when you are ready to push the same text to the live store.
