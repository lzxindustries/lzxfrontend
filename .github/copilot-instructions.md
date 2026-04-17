# LZX Frontend - AI Coding Agent Instructions

## Architecture Overview

This is a **Shopify Hydrogen 2024.4.7** e-commerce storefront built on **Remix 2.9.2**, deployed to **Cloudflare Workers** (Oxygen).

### Data Architecture

- **Shopify Storefront API**: Products, collections, cart, customer accounts via GraphQL (`context.storefront.query()`)

### Key Components

- **`server.ts`**: Cloudflare Worker entry point, creates Storefront client, handles caching
- **`app/root.tsx`**: Layout wrapper, loads cart + shop config, handles errors
- **`app/routes/`**: File-based routing with `($lang)` prefix for i18n

## Development Workflow

### Setup & Running

```bash
yarn install
yarn run dev              # Dev server with codegen
yarn run dev --host       # Expose on local network
yarn run preview          # Production preview build
yarn run codegen          # Regenerate GraphQL types
yarn run typecheck        # Type checking only
```

**Environment Variables Required**: `SESSION_SECRET`, `PUBLIC_STOREFRONT_API_TOKEN`, `PRIVATE_STOREFRONT_API_TOKEN`, `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_ID`

### Build System

- Vite 5 with Hydrogen/Oxygen plugins
- SSR optimizeDeps for CJS/ESM compatibility (see `vite.config.ts`)
- GraphQL codegen via `@shopify/hydrogen-codegen`
- No inline assets (`assetsInlineLimit: 0`) for strict CSP

## Code Conventions

### Route Patterns

File names like `($lang).products.$productHandle.tsx` create routes like `/en-us/products/some-product`
- Loaders: `export async function loader({params, request, context}: LoaderFunctionArgs)`
- Actions: `export async function action({request, context}: ActionFunctionArgs)`
- Always destructure `context.storefront`, `context.session`, `context.env`

### Data Fetching Patterns

**Shopify queries** (in route loaders):
```tsx
const {product} = await context.storefront.query<{product: ProductType}>(
  PRODUCT_QUERY,
  {variables: {handle, country: context.storefront.i18n.country}}
);
```

GraphQL queries use template literals with `#graphql` tag (see `PRODUCT_QUERY`, `ARTICLE_QUERY` in routes).

### Caching Strategy

- `CACHE_SHORT`, `CACHE_LONG`, `CACHE_NONE` from `app/data/cache.ts`
- Custom cache headers in `server.ts` for non-cart/account pages:
  ```tsx
  response.headers.set('Cache-Control', CACHE_SHORT);
  response.headers.set('Oxygen-Cache-Control', 'public, max-age=3600, stale-while-revalidate=259200');
  ```
- Use `routeHeaders` export in routes for consistent behavior

### Component Organization

- UI components: `app/components/` (Button, Grid, Text, Modal, etc.)
- Domain components: `ModuleDetails.tsx`, `ProductCard.tsx`, `Cart.tsx`
- Icons from `react-icons` + custom icon components

### TypeScript Patterns

- Path alias: `~/*` maps to `app/*` (see `tsconfig.json`)
- Always use `invariant()` from `tiny-invariant` for param validation in loaders

### Styling

- **Tailwind CSS** + **DaisyUI** components
- PostCSS with preset-env
- Custom base styles in `app/styles/app.css`
- Inline styles for dynamic SVG components (Frontpanel, Jack)

## Critical Integration Points

### Hydrogen/Shopify API
- Storefront API version: `2025-04` (configurable via env)
- Use fragments from `app/data/fragments.ts` (MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT)
- Cart managed via session storage (`getCartId()` in `app/lib/utils.ts`)

### Worker Environment
- Cloudflare Workers runtime (not Node.js)
- Use `executionContext.waitUntil()` for background tasks
- Cache API via `caches.open('hydrogen')`

## LFS Asset Library (`lfs/library/`)

A symlink at repo root (`lfs → /mnt/e/lfs`) provides access to the binary asset library. This is **local-only** (gitignored, not deployed). Contents are organized as:

| Directory | Contents |
|-----------|----------|
| `brand/logos/` | AI vector sources + 79 PNG exports. Regenerate: `python3 lfs/library/brand/logos/generate_brand_logos.py` |
| `brand/color-swatches/` | 16 PNG brand palette swatches |
| `brand/fonts/` | ~140 OTF/TTF font files (Goldplay, Lato, TeX Gyre, etc.) |
| `brand/panel-components/` | AI files for knobs, jacks, LEDs, connectors |
| `brand/panel-icons/` | SVG schematic icons |
| `products/` | Per-product assets organized by category → series → product slug → asset type |
| `products/product-catalog.json` | Machine-readable index of all 121 products (slug, name, sku, type, active/hidden flags, folder) |
| `stock/` | Third-party stock assets: footage, photos, textures, test-images, test-patterns, music, sound-effects |
| `scrape/` | Archived community/web content: wayback pages, YouTube subtitles, Reddit, Discord, ModWiggler, etc. |

### Product asset structure
```
products/
├── accessories/<slug>/website/      Website images
├── eurorack-cases/<slug>/website/   Website images
├── eurorack-modules/<series>/<slug>/  Panel art, logos, packaging, photos, downloads
│   Series: cadet, castle, expedition, gen3, orion, visionary
├── instruments/<slug>/              brand/, merchandise/, panel-art/, website/, downloads/
│   Instruments: bitvision, chromagnon, videomancer, vidiot
```

### Generated files
Key generated assets (see `lfs/library/GENERATED_FILES.md` for full list):
- **Brand logos**: `brand/logos/generate_brand_logos.py`
- **Video bumpers**: `video/bumpers/generate_video_bumpers.sh`
- **Source clips**: `video/source-clips/generate_video_source_clips.py`
- **Social templates**: `templates/social/generate_templates_social.py`

## Project-Specific Notes

- **Legacy vs Active products**: `is_active_product` flag distinguishes current vs discontinued modules
- **External URLs**: Some modules link to third-party sites (check `external_url` field)

## Common Tasks

**Add a new route**: Create file in `app/routes/` with `($lang).` prefix, export loader/component
**Query Shopify**: Use `context.storefront.query()` with GraphQL string
**Add environment variable**: Update `.env` + `env.d.ts` + `README.md`
**Update GraphQL types**: Run `yarn run codegen` after schema changes
