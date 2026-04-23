# LZX Frontend — AI Coding Agent Instructions

This file is the canonical context document for GitHub Copilot. Cursor uses the rule files in `.cursor/rules/` with the same facts. Keep this file and the Cursor rules in sync when project conventions change.

## Project

- Shopify Hydrogen storefront on Remix, deployed to Shopify Oxygen (Cloudflare Workers).
- React 18 + TypeScript, Vite 5, Tailwind CSS + DaisyUI, GraphQL via Storefront API.
- Tests: Vitest (unit) + Playwright (E2E).

## Toolchain

- Node `>=18.19`, Yarn `4.5.3` (Corepack-managed).
- TypeScript path alias `~/*` maps to `app/*`.
- ESLint + Prettier govern style; do not fight the formatter.

## Commands

- `yarn dev` / `yarn preview` / `yarn build`
- `yarn codegen` after GraphQL changes
- `yarn typecheck` / `yarn lint` / `yarn format`
- `yarn test` / `yarn test:e2e`
- `yarn shopify:sync:*` / `yarn shopify:store-sync:*` for catalog and store mirroring

## Environment

Required at runtime:

- `SESSION_SECRET`
- `PUBLIC_STOREFRONT_API_TOKEN`
- `PRIVATE_STOREFRONT_API_TOKEN`
- `PUBLIC_STORE_DOMAIN`
- `PUBLIC_STOREFRONT_ID`

Optional:

- `PUBLIC_STOREFRONT_API_VERSION` (defaults to `2025-04`)
- `KLAVIYO_PUBLIC_API_KEY`, `KLAVIYO_PRIVATE_API_KEY`
- `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` (admin sync scripts)

When adding a new env var, update `.env.example`, `env.d.ts`, and `README.md` together.

## Architecture

- `server.ts` — Cloudflare Worker entry point. Creates the Storefront client, opens the `hydrogen` worker cache, initializes sessions, and sets default cache headers on public responses.
- `app/root.tsx` — Global layout, shop/cart bootstrapping, error handling.
- `app/routes/` — Remix file-based routes; locale-aware routes use the `($lang)` prefix (e.g. `($lang).products.$productHandle.tsx`).
- `app/data/` — Shared data helpers and GraphQL fragments (`fragments.ts`, `cache.ts`).
- `app/lib/` — Request, session, and utility helpers (including `getCartId`, locale helpers).
- `app/components/` — Shared UI components; domain components live alongside them.

## Route Conventions

- Use typed loader/action args:
  - `export async function loader({params, request, context}: LoaderFunctionArgs)`
  - `export async function action({request, context}: ActionFunctionArgs)`
- Destructure only what is needed from `context`: `storefront`, `session`, `env`, `waitUntil`.
- Validate required params with `invariant()` from `tiny-invariant`.
- Query Shopify through `context.storefront.query()` with `#graphql`-tagged template literals.
- Pass locale via `country: context.storefront.i18n.country` where variant or pricing data is involved.
- Reuse fragments from `app/data/fragments.ts` before introducing new shapes.

Example:

```ts
const {product} = await context.storefront.query<{product: ProductType}>(
  PRODUCT_QUERY,
  {
    variables: {
      handle,
      country: context.storefront.i18n.country,
    },
  },
);
invariant(product, 'Product not found');
```

## Caching

- Cache primitives live in `app/data/cache.ts`: `CACHE_SHORT`, `CACHE_LONG`, `CACHE_NONE`, and `routeHeaders`.
- `server.ts` applies default cache headers to public responses and skips cart/account routes.
- Export `headers = routeHeaders` in routes that should propagate loader cache policy to the document response.
- Use the `CACHE_*` constants; do not hand-author `Cache-Control` strings.
- Never cache cart, checkout, or authenticated account responses.

## Worker Runtime

- Server code runs on Cloudflare Workers via Oxygen; assume Workers APIs, not Node APIs.
- Use `context.waitUntil()` for background work.
- Reuse the existing `caches.open('hydrogen')` cache; do not open additional named caches.

## Styling

- Tailwind CSS with DaisyUI; global styles in `app/styles/app.css`.
- Follow existing component patterns before adding new abstractions.

## Testing

- Unit tests colocate with source where practical and run via Vitest.
- E2E specs live in `e2e/` and run via Playwright; visual regression uses snapshot-based checks.

## Documentation Voice

Docs under `content/docs/` follow `content/docs/WRITING_STYLE_GUIDE.md`. Practitioner-expert voice, no marketing language, no first-person singular, present tense and active voice.

## Repo-Local Assets

- A symlink `lfs -> /mnt/e/lfs` may provide large, local-only assets; it is gitignored and optional.
- Shopify catalog/store mirrors live under `catalog/shopify/` and are managed by scripts in `scripts/`.

## Avoid

- Node-only APIs in server paths.
- New env vars without updating `.env.example`, `env.d.ts`, and `README.md`.
- GraphQL changes without running `yarn codegen`.
- Caching user-specific responses.
- Introducing architecture patterns that diverge from existing routes, data helpers, and components.
