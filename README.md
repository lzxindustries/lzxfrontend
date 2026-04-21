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

### Shopify Catalog Sync

Bootstrap a local Shopify product mirror into JSON, HTML, and media files:

```
yarn shopify:sync:doctor
yarn shopify:sync:pull
```

The sync CLI writes to `catalog/shopify` by default and creates one folder per product handle under `catalog/shopify/products/<handle>/`.

Current implementation:

- `doctor` validates Node version, output directory access, and required Shopify Admin env vars.
- `pull` exports product core fields, description HTML, SEO, variants, metafields, and media manifests.
- Product images are downloaded locally by default. Use `--no-media-download` to skip binary downloads.

Examples:

```
yarn shopify:sync:doctor --offline
yarn shopify:sync:pull --handle chromagnon
yarn shopify:sync:pull --query "status:active"
```

Build and run preview server:

```
yarn run preview
```
