# Generated reports

Operator workflows for Shopify mirrors and catalog maintenance are documented in the repo root [README.md](../../README.md) (sections **Shopify CLIs** and **Shopify Catalog Sync** / **Shopify Store Sync**). Customer-facing documentation source lives under [`content/docs/`](../../content/docs/), not in this folder.

| Report                                                                         | How to refresh                                                                                                                                             |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [product-content-audit.md](product-content-audit.md)                           | `yarn audit:content` from the repo root                                                                                                                    |
| [PRODUCT_CONTENT_FULL_COVERAGE_PLAN.md](PRODUCT_CONTENT_FULL_COVERAGE_PLAN.md) | Authoring: tier definitions, `yarn content:coverage`, `yarn content:apply-overviews` (short Shopify bodies), and live `shopify:sync:pull` / `push --apply` |
| [STATIC_PAGES_DRIFT.md](STATIC_PAGES_DRIFT.md)                                 | Process note for Online Store page vs. app (re-run when legal/marketing copy changes)                                                                      |
| [SHOPIFY_CHECKOUT_COMPLETION_RUNBOOK.md](SHOPIFY_CHECKOUT_COMPLETION_RUNBOOK.md) | Weekly operator runbook for checkout-completion optimization with existing site/creative                                                                     |
| [MARKDOWN_PARITY_AUDIT.md](MARKDOWN_PARITY_AUDIT.md)                           | Start `yarn dev --port 3456`, then `node scripts/audit-markdown-parity.mjs` (set `LIVE_BASE=https://lzxindustries.net` to audit production)                |
| [RESPONSIVE_AUDIT.md](RESPONSIVE_AUDIT.md)                                     | Start `yarn dev`, then `yarn audit:responsive`; review `audit-results/responsive-report.json` and `e2e/responsive.spec.ts` output                          |
| [PRODUCT_GALLERY_MEDIA_AUDIT.md](PRODUCT_GALLERY_MEDIA_AUDIT.md)                 | `yarn audit:product-galleries` (sha256 + 8x8 dHash + token + placement signals); machine output at `audit-results/product-gallery-audit.json`              |
| [PRODUCT_GALLERY_REMEDIATION.md](PRODUCT_GALLERY_REMEDIATION.md)                 | Generated alongside the audit; apply with `yarn shopify:sync:gallery-apply` (dry-run default, `--apply` for live Shopify Admin via `scripts/shopify-sync.mjs`) |

See [docs/content-audit/P0_CRITERIA.md](../content-audit/P0_CRITERIA.md) for what P0 / P1 / P2 mean in the audit.

**Shopify:** Product bodies and `seo.json` under `catalog/shopify/products/<handle>/` are the local mirror. After a `shopify:sync:pull`, if `push --apply` fails on variant position for single-SKU products, run `yarn catalog:normalize-variants`. After editing them, run `yarn catalog:bootstrap` to refresh `app/data/generated/product-catalog.json`, then use your normal `yarn shopify:sync:diff` / `shopify:sync:apply` workflow when you are ready to push the same text to the live store.
