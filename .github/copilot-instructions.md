# LZX Frontend - AI Coding Agent Instructions

## Architecture Overview

This is a **Shopify Hydrogen 2024.4.7** e-commerce storefront built on **Remix 2.9.2**, deployed to **Cloudflare Workers** (Oxygen). The app combines Shopify product data with a custom MongoDB backend for video synthesis hardware (eurorack modules, patches, dealers).

### Dual Data Architecture

- **Shopify Storefront API**: Products, collections, cart, customer accounts via GraphQL (`context.storefront.query()`)
- **MongoDB Data API**: Custom LZX hardware catalog via REST (`getDataCollection()`, `getDataDocument()` in `app/lib/db.server.ts`)
  - Collections: Module, Patch, Dealer, Company, Video, etc. (see `db/lzxdb.*.json`)
  - Models in `app/models/` (raw MongoDB shapes) → Views in `app/views/` (transformed for UI)
  - Controllers in `app/controllers/` fetch/transform data (e.g., `get_all_modules.ts`)

### Key Components

- **`server.ts`**: Cloudflare Worker entry point, creates Storefront client, handles caching
- **`app/root.tsx`**: Layout wrapper, loads cart + shop config, handles errors
- **`app/routes/`**: File-based routing with `($lang)` prefix for i18n (e.g., `($lang).modules.tsx`)
- **Custom visualizations**: `Jack.tsx`, `Frontpanel.tsx` - SVG-based eurorack hardware rendering

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

**Environment Variables Required**: `SESSION_SECRET`, `PUBLIC_STOREFRONT_API_TOKEN`, `PRIVATE_STOREFRONT_API_TOKEN`, `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_ID`, `CLUSTER_NAME`, `DATA_API_BASE_URL`, `DATA_API_KEY`, `DATABASE_NAME`, `DATABASE_URL`

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

**MongoDB queries** (via controllers):
```tsx
import {getAllModules} from '~/controllers/get_all_modules';
const modules = await getAllModules(context); // Returns ModuleView[]
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
- Custom CSS: `frontpanel.css`, `jack.css` for SVG styling
- Icons from `react-icons` + custom icon components

### TypeScript Patterns

- Path alias: `~/*` maps to `app/*` (see `tsconfig.json`)
- Models (`app/models/`): Raw MongoDB/API shapes with `Interface` suffix
- Views (`app/views/`): Transformed UI-ready types with `View` suffix
- Always use `invariant()` from `tiny-invariant` for param validation in loaders

### Styling

- **Tailwind CSS** + **DaisyUI** components
- PostCSS with preset-env
- Custom base styles in `app/styles/app.css`
- Inline styles for dynamic SVG components (Frontpanel, Jack)

## Critical Integration Points

### Hydrogen/Shopify API
- Storefront API version: `2024-04` (configurable via env)
- Use fragments from `app/data/fragments.ts` (MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT)
- Cart managed via session storage (`getCartId()` in `app/lib/utils.ts`)

### MongoDB Data API
- REST endpoint: `{DATA_API_BASE_URL}/action/aggregate`
- Auth via `api-key` header
- Pipeline syntax: MongoDB aggregation arrays (see `getDataCollection()`)

### Worker Environment
- Cloudflare Workers runtime (not Node.js)
- Use `executionContext.waitUntil()` for background tasks
- Cache API via `caches.open('hydrogen')`

## Project-Specific Notes

- **Module data**: Hardware specs (HP width, power consumption, sync requirements) for eurorack synthesizer modules
- **Patch data**: User-submitted video synthesis patches with YouTube embeds or GIF clips
- **Legacy vs Active products**: `is_active_product` flag distinguishes current vs discontinued modules
- **External URLs**: Some modules link to third-party sites (check `external_url` field)

## Common Tasks

**Add a new route**: Create file in `app/routes/` with `($lang).` prefix, export loader/component
**Query Shopify**: Use `context.storefront.query()` with GraphQL string
**Query MongoDB**: Use controller pattern (`app/controllers/`) → call `getDataCollection()`
**Add environment variable**: Update `.env` + `server.ts` types + `README.md`
**Update GraphQL types**: Run `yarn run codegen` after schema changes
