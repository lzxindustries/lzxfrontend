# LFS Product Integration Backlog

Status: Completed for the current `lfs/library/products` audit scope. The latest regenerated audit now reports full website surfacing coverage and full Shopify gallery candidate coverage.

## Delivery Model

The website now uses a hybrid integration model for product-library assets:

- Web-publishable assets are linked directly when the file format is appropriate for the storefront: images, PDFs, ZIPs, UF2 firmware, CSV, SHA256, and SVG.
- Heavy source assets remain visible on product pages as indexed archive inventory when publishing the raw file would add excessive deploy weight or does not make sense for a storefront download flow: AI, PSD, Procreate, and similar source formats.
- Product-library inventory is no longer limited to legacy products. Active modules, instruments, accessories, and cases now share the same manifest-backed archive pipeline.

## Completed Work

- Fixed broken legacy download links by resolving real emitted asset URLs instead of falling back to `/assets/<filename>`.
- Broadened manifest ingestion to include `panel_art`, `brand`, `editions`, `packaging`, and other nested `file_manifest` categories.
- Added archive inventory support for all products, not just legacy products.
- Included orphaned website images discovered by the audit in product archive listings.
- Added targeted overrides for the remaining root-level orphan source files:
  - `cadet-series-embroidered-patch/lzx_video_cadet_patch_9color_3_x3.ai`
  - `cadet-series-embroidered-patch/lzx_video_cadet_patch_9color_photo.psd`
  - `cadet-series-vinyl-sticker/lzx_video_cadet_sticker_3_x3.ai`
- Surfaced archive inventory on module, instrument, and generic product pages.
- Kept downloads navigation visible for archive-only products.
- Broadened Shopify seed candidate discovery beyond modules to include instruments, accessories, and Eurorack cases.
- Broadened Shopify seed gallery media discovery to include `website/`, `photos/`, and nested photo-set images.
- Expanded forum archive compilation to include full thread posts and related discussions, including manual fallbacks when no official `all about` topic exists.

## Remaining Gaps

- None in the current audit scope. The regenerated report at [docs/lfs-products-integration-audit.md](/home/lars/lzxfrontend/docs/lfs-products-integration-audit.md) now shows:
- `Files not surfaced anywhere on the website: 0`
- `Shopify gallery candidate misses: 0`

## Verification

- Focused tests now cover published download URLs, archive-only source assets, orphaned website images, hub-loader archive surfacing, and forum archive/manual fallbacks from both official and related threads.
- The regenerated product-library audit now reports zero residual website misses and zero residual Shopify gallery misses.
- Editor diagnostics are clean on all changed files.

## Follow-Up Trigger

If new files are added under `lfs/library/products`, rerun the audit and extend the archive normalization only where new file patterns fall outside `file_manifest` or the existing orphan overrides.
