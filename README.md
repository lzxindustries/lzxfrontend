# LZX Frontend

## Development

### Requirements

- Node >=18.19 (https://nodejs.org)
- Yarn 4.5.3 (https://yarnpkg.com/)

### Getting Started

Set required environment variables:

- `SESSION_SECRET`
- `PUBLIC_STOREFRONT_API_TOKEN`
- `PRIVATE_STOREFRONT_API_TOKEN`
- `PUBLIC_STORE_DOMAIN`
- `PUBLIC_STOREFRONT_ID`

Optional environment variables:

- `KLAVIYO_PRIVATE_API_KEY` (enables back-in-stock Notify Me submissions)
- `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` (required for Shopify Admin sync scripts)

Install dependencies:

```
yarn install
```

Run development server:

```
yarn run dev
```

Run development server on local network:

```
yarn run dev --host
```

### Documentation layout

- **Customer-facing docs** (published on the site) live under [`content/docs/`](content/docs/) and related `content/` trees.
- **Internal notes and audits** (operators, migration plans, reports) live under [`docs/`](docs/)—for example [`docs/reports/`](docs/reports/) for generated or maintained reports.

### Shopify CLIs (which command do I use?)

- **Product catalog** (products, variants, media, product metafields): use `yarn shopify:sync:*`. Output defaults to `catalog/shopify/products/<handle>/`.
- **Store-owned content** (shop policies and configured Online Store pages): use `yarn shopify:store-sync:*`. Output defaults to `catalog/shopify/store/`.

### Shopify Catalog Sync

Bootstrap a local Shopify product mirror into JSON, HTML, and media files:

```
yarn shopify:sync:doctor
yarn shopify:sync:seed
yarn shopify:sync:pull
yarn shopify:sync:diff
yarn shopify:sync:push
```

The sync CLI writes to `catalog/shopify` by default and creates one folder per product handle under `catalog/shopify/products/<handle>/`.

Current implementation:

- `doctor` validates Node version, output directory access, and required Shopify Admin env vars.
- `seed` builds missing local product entries from `lfs/library/products`, including website images and basic lifecycle-aware defaults for legacy versus active modules.
- `pull` exports product core fields, description HTML, SEO, variants, metafields, and media manifests.
- `diff` compares local catalog files against the latest Shopify export and exits nonzero when drift is detected.
- `push` plans Shopify mutations from local files and only writes when `--apply` is provided.
- `sync` runs `doctor` and then `push`, so there is a single operator-facing entry point for dry runs or apply mode.
- Product images are downloaded locally by default. Use `--no-media-download` to skip binary downloads.

Examples:

```
yarn shopify:sync:doctor --offline
yarn shopify:sync:seed --handle arch
yarn shopify:sync:pull --handle chromagnon
yarn shopify:sync:diff --handle chromagnon
yarn shopify:sync:push --handle chromagnon
yarn shopify:sync:apply --handle chromagnon
yarn shopify:sync:pull --query "status:active"
```

Current push scope:

- Product core fields, description HTML, SEO, options, variants, pricing, and product metafields.
- Online Store publication sync for `ACTIVE` products. The CLI publishes active products and unpublishes non-active products when the app has Shopify `read_publications` and `write_publications` scopes.
- Additive media sync for images, external videos, videos, and 3D models when a source URL or `localPath` is available.
- Media deletions and remote alt-text edits are reported as warnings in v1 and are not applied automatically.

Publication sync note:

- The current app must be re-authorized with Shopify `read_publications` and `write_publications` scopes before `--apply` can manage Online Store visibility.
- If the publication id is already known, set `SHOPIFY_ONLINE_STORE_PUBLICATION_ID` to bypass automatic publication lookup.

### Shopify Store Sync

Mirror store-owned Shopify resources such as shop policies and non-product pages into local files:

```
yarn shopify:store-sync:doctor
yarn shopify:store-sync:seed
yarn shopify:store-sync:pull
yarn shopify:store-sync:diff
yarn shopify:store-sync:push
```

The store sync CLI writes to `catalog/shopify/store` by default and currently manages Shopify policy slots plus the existing `contact-information` and `legal-notice` pages.

Current Admin access note:

- Policy sync is active with the current app credentials.
- Page sync requires Shopify Admin page scopes (`read_content` or `read_online_store_pages`, plus matching write scope for push). When those scopes are unavailable, the CLI warns and skips page pull, diff, and push instead of failing the entire run.

Current implementation:

- `doctor` validates Node version, output directory access, the seed source directory, and required Shopify Admin env vars.
- `seed` imports the existing `policies/*.html` and `policies/*.md` files into the canonical local store mirror.
- `pull` exports Shopify store policies and the configured store pages into local JSON and HTML files.
- `diff` compares local store files against the latest Shopify store data and exits nonzero when drift is detected.
- `push` plans Shopify policy/page mutations from local files and only writes when `--apply` is provided.
- `sync` runs `doctor` and then `push`, so there is a single operator-facing entry point for dry runs or apply mode.

Examples:

```
yarn shopify:store-sync:doctor --offline
yarn shopify:store-sync:seed
yarn shopify:store-sync:pull
yarn shopify:store-sync:diff
yarn shopify:store-sync:push
yarn shopify:store-sync:apply --handle privacy-policy
```

Build and run preview server:

```
yarn run preview
```
