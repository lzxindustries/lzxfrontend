# P0 / P1 / P2 content priority

Use this with [`yarn audit:content`](../reports/product-content-audit.md) (generates `docs/reports/product-content-audit.md`).

## Automated tier (in the report)

| Tier   | Meaning                                                                                                                                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0** | Product is **active and visible** in the catalog, but has **no shippable Manual** in production: missing `content/docs/...` file or front matter is `draft: true`.                                                   |
| **P1** | Visible and has a manual, but **SEO fields are empty** in the catalog snapshot, **or** the plain-text description is **longer than 4,000 characters** (usually reference copy that belongs in Manual or metafields). |
| **P2** | Inactive, not visible, or in good shape for overview + discoverability.                                                                                                                                              |

## P3 / P4 — extended priority (repo convention)

These tiers are **not** emitted by `yarn audit:content`. Use them for maintenance above “script P1 = 0”.

| Tier   | Meaning |
| ------ | ------- |
| **P3** | **Catalog mirror hygiene** — every mirrored `catalog/shopify/products/<handle>/seo.json` has a non-empty title and description (run `node scripts/fill-missing-seo.mjs`, then `yarn catalog:bootstrap` and `yarn audit:content` until **SEO gaps = 0**). Keep typings and policy HTML siblings in sync when editing markdown sources. |
| **P4** | **Editorial + live commerce (Tier B/C)** per [`PRODUCT_CONTENT_FULL_COVERAGE_PLAN.md`](../reports/PRODUCT_CONTENT_FULL_COVERAGE_PLAN.md): on-voice manuals, authored support FAQs, overview copy, `yarn shopify:sync:*` apply, and open product-policy calls (e.g. legacy firmware index). |

**Naming collision:** [`CONTENT_REVIEW_2026-05-12.md`](../reports/CONTENT_REVIEW_2026-05-12.md) used **P0–P2** for _editorial severity_ on that pass. Say **“script P1”** vs **“review P1”** when both docs are in scope.

Re-run the audit after `yarn shopify:sync:pull` and `yarn catalog:bootstrap` so Shopify changes flow into the report.

## Business overrides (not in the script)

Adjust order using data only you have:

1. **Revenue or units** (Shopify reports): prioritize bestsellers in P0/P1.
2. **New or upcoming launches** (last ~12 months): treat as P0 for copy and manual readiness even if tier says P1.
3. **Support load** (tickets, forum volume): bump SKUs with repeated issues to the top of the support/FAQ work queue.
4. **accessories and legacy lines**: usually stay P2 unless you are actively restocking or promoting them.

Update this file when the team locks a **P0 sprint list** so marketing, support, and engineering share one queue.
