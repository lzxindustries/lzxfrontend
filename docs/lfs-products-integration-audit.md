# LFS Product Integration Audit

Generated: 2026-04-21T23:15:49.030Z

## Scope

This report reflects the current product-library runtime and Shopify seed logic in the repository.

Counted as site integrated:

- Files surfaced directly with a published URL.
- Files surfaced as indexed archive inventory on product pages.

Counted as Shopify gallery covered:

- Local images discoverable by the current seed path from frontpanel, `website/`, and `photos/` locations, including nested edition photo sets.

## Executive Summary

- Product JSON files scanned: 122
- Non-JSON product-library files audited: 913
- Files surfaced somewhere on the website: 914
- Files with direct published links: 567
- Files surfaced as indexed-only archive entries: 346
- Files not surfaced anywhere on the website: 0
- Shopify gallery candidate files: 311
- Shopify gallery candidate files covered by current seed path: 311
- Shopify gallery candidate misses: 0

## Readiness

- Site coverage: all audited product-library files are now surfaced either as direct links or indexed archive entries.
- Shopify gallery seed coverage: all local gallery-candidate product images are covered by the current seed path.
- Indexed-only assets are intentionally not emitted as web downloads when they are source formats or otherwise unsuitable for storefront delivery.

## Indexed-Only Categories

- eurorack-modules: 269
- instruments: 72
- eurorack-cases: 5

## Residual Website Misses

- None.

## Residual Shopify Gallery Misses

- None.
