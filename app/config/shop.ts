/**
 * Local shop chrome — replaces the LAYOUT_QUERY/SHOP fetch from the
 * Shopify Storefront API. The site no longer reads shop name/brand
 * logo or header/footer menus from Shopify; they live here as canonical
 * config so the layout can render identically when Shopify is offline.
 *
 * Note: `primaryDomain.url` is intentionally derived per-request in
 * `app/root.tsx` so that previews and dev/local hosts work without
 * editing config. We expose `siteOrigin` as the *production* origin
 * for SEO/analytics consumers that want a stable URL.
 */

export const SHOP_NAME = 'LZX Industries';
export const SHOP_DESCRIPTION =
  'LZX Industries designs and builds modular hardware for analog and hybrid video synthesis.';
// Points at the in-repo SVG shipped under public/docs/img. The
// previous /assets/brand/logos/lzx-industries-logo.png path was
// referenced by JSON-LD / OG metadata but the PNG was never deployed,
// producing 404s across every page.
export const SHOP_BRAND_LOGO_URL = '/docs/img/logo.svg';
export const SITE_ORIGIN = 'https://lzxindustries.net';
