# Committed LFS library mirror (metadata + curated assets)

Hydrogen and Vitest read product metadata and forum archive JSON from this tree.
Nothing under `app/` imports `../../lfs/` at build time.

## Refreshing from a full LFS mount

When you have the private asset library mounted at `lfs/` (or elsewhere):

```bash
yarn catalog:sync-lfs-library
# or
node scripts/sync-lfs-library.mjs --source /path/to/lfs
```

That copies:

- all `*.json` and `**/modulargrid/metadata.md` under `library/products/`
- supplemental module folders and series shared asset roots (see `scripts/sync-lfs-library.mjs`)
- a filtered subset of forum topic JSON (handles + `all-about-*` topics)

Commit the resulting changes so CI and Oxygen builds do not need `lfs/`.

## Ingest and Shopify seed

- `yarn catalog:ingest` reads **this** directory by default (set `LFS_PRODUCTS_SOURCE=mount` to use `lfs/library/products` instead).
- `yarn shopify:sync:seed` defaults to `--source-dir data/lfs-library/products`.
