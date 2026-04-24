# Product gallery media audit

**Generated:** 2026-04-24T21:06:54.814Z  
**Inputs:** `app/data/generated/product-catalog.json` (132 products, 208 media items), `app/data/generated/lfs-asset-manifest.json` (104 products with runtime LFS media), `catalog/shopify/products`.

This report is produced by `node scripts/audit-product-galleries.mjs`. It layers four independent signals for each gallery slot: **exact identity** (Shopify CDN pathname + sha256 bytes), **near-duplicate** (8x8 dHash Hamming distance ≤ 6), **token contradictions** (handle/title vs filename), and **placement quality** (illustration-in-hero, higher-resolution-later). Each flagged row carries concrete evidence.

Findings here are translated into concrete Shopify Admin operations in [`PRODUCT_GALLERY_REMEDIATION.md`](PRODUCT_GALLERY_REMEDIATION.md). Run `yarn shopify:sync:gallery-apply` (dry-run by default) to preview the fixes and add `--apply` to execute them via the repo Shopify CLI (`scripts/shopify-sync.mjs`).

## Summary

- Media items scanned: **208**
- Products (catalog.json): **132**
- Runtime gallery source: LFS preferred for **104** products (see `app/data/hub-product.server.ts` `buildMediaNodes`); remainder served from catalog Shopify URLs.
- Media items currently served from catalog (customer-visible now): **47**
- Flagged runtime-visible items: **11**

- P0: **1** item(s)
- P1: **16** item(s)
- P2: **50** item(s)
- P3: **9** item(s)

## Tier definitions

- **P0** — Almost certainly the wrong media (version or handle token contradiction).
- **P1** — Same file or same handle reference across unrelated products; needs merchant decision.
- **P2** — Duplicate within one product (remove a slot), or byte-identical across products.
- **P3** — Near-duplicate clusters and ordering/hero-quality opportunities.

A row may carry multiple signals; the listed tier is the highest-severity signal for that row.

## P0

| Handle | Slot | Runtime | Score | Actions | Evidence |
|--------|-----:|---------|------:|---------|----------|
| `tbc2-mk1-fan-upgrade-kit` | 0 | lfs-masked | 81 | replace, manual-review | cross-product same-URL (2 products); cross-product same-bytes (3 products); version mismatch: handle mk1 vs asset mk2 |

## P1

| Handle | Slot | Runtime | Score | Actions | Evidence |
|--------|-----:|---------|------:|---------|----------|
| `tbc2-mk2-fan-upgrade-kit` | 0 | lfs-masked | 41 | manual-review | cross-product same-URL (2 products); cross-product same-bytes (3 products) |
| `lzx-black-expedition-replacement-panel` | 4 | catalog | 37 | manual-review | cross-product same-bytes (2 products); near-dup across 3 products (dHash≤6); generic alt |
| `lzx-black-expedition-replacement-panel` | 5 | catalog | 37 | manual-review | cross-product same-bytes (2 products); near-dup across 3 products (dHash≤6); generic alt |
| `tbc2` | 0 | lfs-masked | 37 | manual-review | cross-product same-bytes (2 products); near-dup across 2 products (dHash≤6); generic alt |
| `tbc2-expander` | 2 | lfs-masked | 32 | manual-review | cross-product same-bytes (2 products); near-dup across 2 products (dHash≤6); generic alt |
| `passage` | 0 | lfs-masked | 30 | manual-review | cross-product same-bytes (2 products); near-dup across 3 products (dHash≤6) |
| `pendulum` | 0 | lfs-masked | 30 | manual-review | cross-product same-bytes (2 products); near-dup across 3 products (dHash≤6) |
| `lzx-black-expedition-replacement-panel` | 1 | catalog | 25 | manual-review | cross-product same-bytes (2 products); generic alt |
| `lzx-black-expedition-replacement-panel` | 2 | catalog | 25 | manual-review | cross-product same-bytes (2 products); generic alt |
| `lzx-black-expedition-replacement-panel` | 6 | catalog | 25 | manual-review | cross-product same-bytes (2 products); generic alt |
| `lzx-black-expedition-replacement-panel` | 8 | catalog | 25 | manual-review | cross-product same-bytes (2 products); generic alt |
| `tbc2-expander` | 6 | lfs-masked | 20 | manual-review | cross-product same-bytes (2 products); generic alt |
| `tbc2-expander` | 7 | lfs-masked | 20 | manual-review | cross-product same-bytes (3 products); generic alt |
| `sensory-translator` | 0 | lfs-masked | 18 | manual-review | cross-product same-bytes (2 products) |
| `staircase` | 0 | lfs-masked | 18 | manual-review | cross-product same-bytes (2 products) |
| `war-of-the-ants` | 0 | lfs-masked | 18 | manual-review | cross-product same-bytes (2 products) |

## P2

| Handle | Slot | Runtime | Score | Actions | Evidence |
|--------|-----:|---------|------:|---------|----------|
| `sumdist` | 0 | catalog | 24 | manual-review | near-dup across 7 products (dHash≤6); generic alt |
| `angles` | 0 | lfs-masked | 19 | manual-review | near-dup across 7 products (dHash≤6); generic alt |
| `castle-000-adc` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `castle-001-dac` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `castle-010-clock-vco` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `castle-011-shift-register` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `castle-100-multi-gate` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `castle-101-quad-gate` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `castle-110-counter` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `castle-111-d-flip-flops` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `contour` | 0 | lfs-masked | 19 | manual-review | near-dup across 8 products (dHash≤6); generic alt |
| `dc-distro` | 0 | catalog | 19 | manual-review | near-dup across 10 products (dHash≤6); generic alt |
| `dc-distro` | 1 | catalog | 19 | manual-review | near-dup across 10 products (dHash≤6); generic alt |
| `dc-distro-3a` | 0 | lfs-masked | 19 | manual-review | near-dup across 3 products (dHash≤6); generic alt |
| `dsg3` | 0 | lfs-masked | 19 | manual-review | near-dup across 7 products (dHash≤6); generic alt |
| `dwo3` | 0 | lfs-masked | 19 | manual-review | near-dup across 7 products (dHash≤6); generic alt |
| `esg3` | 0 | lfs-masked | 19 | manual-review | near-dup across 7 products (dHash≤6); generic alt |
| `factors` | 0 | lfs-masked | 19 | manual-review | near-dup across 8 products (dHash≤6); generic alt |
| `keychain` | 0 | lfs-masked | 19 | manual-review | near-dup across 8 products (dHash≤6); generic alt |
| `lnk` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `matte` | 0 | lfs-masked | 19 | manual-review | near-dup across 8 products (dHash≤6); generic alt |
| `pab` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `pgo` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `prm` | 0 | lfs-masked | 19 | manual-review | near-dup across 12 products (dHash≤6); generic alt |
| `proc` | 0 | lfs-masked | 19 | manual-review | near-dup across 8 products (dHash≤6); generic alt |
| `ribbons` | 0 | lfs-masked | 19 | manual-review | near-dup across 8 products (dHash≤6); generic alt |
| `scrolls` | 0 | lfs-masked | 19 | manual-review | near-dup across 7 products (dHash≤6); generic alt |
| `smx3` | 0 | lfs-masked | 19 | manual-review | near-dup across 7 products (dHash≤6); generic alt |
| `stacker` | 0 | lfs-masked | 19 | manual-review | near-dup across 8 products (dHash≤6); generic alt |
| `stairs` | 0 | lfs-masked | 19 | manual-review | near-dup across 8 products (dHash≤6); generic alt |
| `swatch` | 0 | lfs-masked | 19 | manual-review | near-dup across 3 products (dHash≤6); generic alt |
| `color-chords` | 0 | lfs-masked | 14 | manual-review | near-dup across 2 products (dHash≤6); generic alt |
| `color-chords` | 2 | lfs-masked | 14 | manual-review | near-dup across 2 products (dHash≤6); generic alt |
| `prismatic-ray` | 0 | lfs-masked | 14 | manual-review | near-dup across 2 products (dHash≤6); generic alt |
| `prismatic-ray` | 1 | lfs-masked | 14 | manual-review | near-dup across 2 products (dHash≤6); generic alt |
| `tbc2-expander` | 1 | lfs-masked | 14 | manual-review | near-dup across 2 products (dHash≤6); generic alt |
| `arch` | 1 | lfs-masked | 12 | manual-review | near-dup across 2 products (dHash≤6) |
| `bridge` | 1 | lfs-masked | 12 | manual-review | near-dup across 2 products (dHash≤6) |
| `cadet-i-sync-generator` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `cadet-ii-rgb-encoder` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `cadet-iii-video-input` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `cadet-iv-dual-ramp-generator` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `cadet-ix-vco` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `cadet-v-scaler` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `cadet-vii-processor` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `cadet-viii-hard-key-generator` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `cadet-x-multiplier` | 0 | lfs-masked | 12 | manual-review | near-dup across 10 products (dHash≤6) |
| `curtain` | 0 | lfs-masked | 12 | manual-review | near-dup across 2 products (dHash≤6) |
| `dc-distro-5a` | 0 | lfs-masked | 12 | manual-review | near-dup across 3 products (dHash≤6) |
| `doorway` | 0 | lfs-masked | 12 | manual-review | near-dup across 2 products (dHash≤6) |

## P3

| Handle | Slot | Runtime | Score | Actions | Evidence |
|--------|-----:|---------|------:|---------|----------|
| `cyclops` | 0 | catalog | 13 | remove | within-product near-dup (dHash≤6); generic alt |
| `cyclops` | 1 | catalog | 13 | remove | within-product near-dup (dHash≤6); generic alt |
| `video-knob` | 0 | lfs-masked | 13 | remove | within-product near-dup (dHash≤6); generic alt |
| `videomancer-tee` | 0 | lfs-masked | 13 | remove | within-product near-dup (dHash≤6); generic alt |
| `bridge` | 0 | lfs-masked | 8 | reorder | generic alt; hero is small; slot 1 is much larger |
| `dsg3` | 4 | lfs-masked | 8 | remove | within-product near-dup (dHash≤6); generic alt |
| `dsg3` | 10 | lfs-masked | 8 | remove | within-product near-dup (dHash≤6); generic alt |
| `video-knob` | 1 | lfs-masked | 8 | remove | within-product near-dup (dHash≤6); generic alt |
| `videomancer-tee` | 1 | lfs-masked | 8 | remove | within-product near-dup (dHash≤6); generic alt |

## Duplicate clusters (informational)

- Exact-bytes clusters: **8**, exact-URL clusters: **1**, near-duplicate clusters: **19**.

### Byte-identical groups

- `9eb4cdd160…` (2):
  - `lzx-black-expedition-replacement-panel` slot 1: `catalog/shopify/products/lzx-black-expedition-replacement-panel/media/02-lzx-black-expedition-replacement-panel.png`
  - `war-of-the-ants` slot 0: `catalog/shopify/products/war-of-the-ants/media/01-war-of-the-ants.png`
- `366c49990d…` (2):
  - `lzx-black-expedition-replacement-panel` slot 2: `catalog/shopify/products/lzx-black-expedition-replacement-panel/media/03-lzx-black-expedition-replacement-panel.png`
  - `sensory-translator` slot 0: `catalog/shopify/products/sensory-translator/media/01-sensory-translator.png`
- `3b073af0ac…` (2):
  - `lzx-black-expedition-replacement-panel` slot 4: `catalog/shopify/products/lzx-black-expedition-replacement-panel/media/05-lzx-black-expedition-replacement-panel.png`
  - `passage` slot 0: `catalog/shopify/products/passage/media/01-passage.png`
- `df3e1e8ff9…` (2):
  - `lzx-black-expedition-replacement-panel` slot 5: `catalog/shopify/products/lzx-black-expedition-replacement-panel/media/06-lzx-black-expedition-replacement-panel.png`
  - `pendulum` slot 0: `catalog/shopify/products/pendulum/media/01-pendulum.png`
- `09f6f82fb8…` (2):
  - `lzx-black-expedition-replacement-panel` slot 6: `catalog/shopify/products/lzx-black-expedition-replacement-panel/media/07-lzx-black-expedition-replacement-panel.png`
  - `staircase` slot 0: `catalog/shopify/products/staircase/media/01-staircase.png`
- `ac73dc35cc…` (2):
  - `lzx-black-expedition-replacement-panel` slot 8: `catalog/shopify/products/lzx-black-expedition-replacement-panel/media/09-lzx-black-expedition-replacement-panel.png`
  - `tbc2-expander` slot 6: `catalog/shopify/products/tbc2-expander/media/07-tbc2-expander-image-7.png`
- `22b9d3cd9c…` (2):
  - `tbc2` slot 0: `catalog/shopify/products/tbc2/media/01-tbc2.png`
  - `tbc2-expander` slot 2: `catalog/shopify/products/tbc2-expander/media/03-tbc2-expander-image-3.png`
- `e140cadbcd…` (3):
  - `tbc2-expander` slot 7: `catalog/shopify/products/tbc2-expander/media/08-tbc2-expander-image-8.png`
  - `tbc2-mk1-fan-upgrade-kit` slot 0: `catalog/shopify/products/tbc2-mk1-fan-upgrade-kit/media/01-fan-upgrade-kit-contents-image-shown-is-the-mk2-version-mk1-kit-is-visually-similar.png`
  - `tbc2-mk2-fan-upgrade-kit` slot 0: `catalog/shopify/products/tbc2-mk2-fan-upgrade-kit/media/01-fan-upgrade-kit-contents-image-shown-is-the-mk2-version-mk1-kit-is-visually-similar.png`

## How to re-run

```bash
yarn shopify:sync:pull         # refresh catalog/shopify/products/*
yarn catalog:bootstrap         # rebuild app/data/generated/product-catalog.json
yarn audit:product-galleries   # regenerate this report + audit-results/product-gallery-audit.json
```

Skip perceptual hashing (faster, fewer near-dup results) with `node scripts/audit-product-galleries.mjs --skip-perceptual`.

