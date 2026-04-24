# Product gallery remediation playbook

**Generated:** 2026-04-24T21:06:54.814Z  
**Source:** `audit-results/product-gallery-audit.json` and `audit-results/product-gallery-remediation.json`

Each operation carries concrete Shopify media GIDs and product GIDs so it can be executed either by hand in Shopify Admin or via `yarn shopify:sync:gallery-apply --apply` (subcommand of `scripts/shopify-sync.mjs`).

## Summary

- Total actionable operations: **1**
- delete: **0**
- replace: **0**
- reorder: **1**
- manual-review: **0**
- Suppressed (intentional per `audit/product-gallery-suppressions.json`): **11**

## By product

### `bridge` — Bridge

- Product: `gid://shopify/Product/8803159900183` — [Admin](https://lzx-industries.myshopify.com/admin/products/8803159900183)
- Runtime: **lfs** (customer-facing gallery uses LFS; these are mirror-side fixes)

- [ ] **Reorder**: move slot 1 to slot 0.
  - Evidence: hero is materially lower-resolution than a later slot. Slot 1 has 11× the pixel area of the hero (94,600 → 1,048,576)

## Suppressed (intentional)

These operations were previously actionable but have been marked intentional in `audit/product-gallery-suppressions.json`. They are excluded from the by-product list above. To re-surface, remove the matching entry from the suppressions file.

- `lzx-black-expedition-replacement-panel`
  - manual-review slot 1 _[merchandising-cross-reference]_: Pattern A: Alternate Frontpanel merchandising gallery intentionally reuses each compatible Black Expedition module's panel image.
- `passage`
  - manual-review slot 0 _[merchandising-cross-reference]_: Pattern A: Passage's hero panel is intentionally mirrored into the lzx-black-expedition-replacement-panel merchandising gallery.
- `pendulum`
  - manual-review slot 0 _[merchandising-cross-reference]_: Pattern A: Pendulum's hero panel is intentionally mirrored into the lzx-black-expedition-replacement-panel merchandising gallery.
- `sensory-translator`
  - manual-review slot 0 _[merchandising-cross-reference]_: Pattern A: Sensory Translator's hero panel is intentionally mirrored into the lzx-black-expedition-replacement-panel merchandising gallery.
- `staircase`
  - manual-review slot 0 _[merchandising-cross-reference]_: Pattern A: Staircase's hero panel is intentionally mirrored into the lzx-black-expedition-replacement-panel merchandising gallery.
- `tbc2`
  - manual-review slot 0 _[merchandising-cross-reference]_: Pattern C: TBC2 hero panel is intentionally mirrored into the tbc2-expander gallery for pair/context merchandising.
- `tbc2-expander`
  - manual-review slot 2 _[merchandising-cross-reference]_: Pattern C reciprocal: tbc2-expander's gallery intentionally shows the TBC2 main-module panel at slot 2 (pair/context merchandising). The tbc2 side is suppressed separately.
- `tbc2-mk1-fan-upgrade-kit`
  - replace slot 0 _[accepted-shared-asset-with-alt-disclosure]_: Pattern D: No separate Mk1 fan-kit photo exists. The Mk1 product reuses the Mk2 kit photo with explicit disclosure alt text ('image shown is the Mk2 version; Mk1 kit is visually similar'). Revisit if a Mk1 photograph is ever produced.
  - manual-review slot 0 _[accepted-shared-asset-with-alt-disclosure]_: Pattern D: No separate Mk1 fan-kit photo exists. The Mk1 product reuses the Mk2 kit photo with explicit disclosure alt text ('image shown is the Mk2 version; Mk1 kit is visually similar'). Revisit if a Mk1 photograph is ever produced.
- `tbc2-mk2-fan-upgrade-kit`
  - manual-review slot 0 _[accepted-shared-asset-with-alt-disclosure]_: Pattern D: Byte-identical flag against the Mk1 fan-kit product is accepted; the Mk2 product legitimately owns the image.
- `war-of-the-ants`
  - manual-review slot 0 _[merchandising-cross-reference]_: Pattern A: War Of The Ants' hero panel is intentionally mirrored into the lzx-black-expedition-replacement-panel merchandising gallery.

## How to apply

All execution goes through the repo Shopify CLI (`scripts/shopify-sync.mjs`), same auth path as every other store mutation in this codebase.

Dry-run (safe default):

```bash
yarn shopify:sync:gallery-apply
```

Execute a single product (requires admin credentials in `.env`):

```bash
yarn shopify:sync gallery-apply --handle <product-handle> --apply
```

Execute all auto-plannable ops (delete + reorder):

```bash
yarn shopify:sync gallery-apply --kinds delete,reorder --apply
```

After any apply, refresh the local mirror and regenerate the audit:

```bash
yarn shopify:sync:pull
yarn catalog:bootstrap
yarn audit:product-galleries
```

