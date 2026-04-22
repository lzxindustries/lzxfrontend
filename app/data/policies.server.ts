/**
 * Loads store policies from the local `policies/*.html` directory.
 *
 * The HTML files in `/policies/` are the canonical source of policy
 * text and are also pasted into the corresponding Shopify policy
 * slots (Settings → Policies). Reading them locally lets the
 * `/policies` and `/policies/:handle` routes render without a
 * Storefront API round-trip.
 *
 * Only the four "standard" Shopify policy handles are exposed here.
 * Pages like `contact-information` and `legal-notice` are served
 * elsewhere even though their HTML lives in the same directory.
 */

const policyHtml = import.meta.glob<string>('../../policies/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export interface LocalPolicy {
  id: string;
  handle: string;
  title: string;
  body: string;
  url: string;
}

/**
 * Standard Shopify policy slots in display order. Maps the
 * camelCase shop-policy field name (used by the route param
 * conversion) to the kebab-case file/handle.
 */
const STANDARD_POLICIES: Array<{
  shopField: string;
  handle: string;
  title: string;
}> = [
  {shopField: 'shippingPolicy', handle: 'shipping-policy', title: 'Shipping Policy'},
  {shopField: 'refundPolicy', handle: 'refund-policy', title: 'Refund Policy'},
  {shopField: 'termsOfService', handle: 'terms-of-service', title: 'Terms of Service'},
  {shopField: 'privacyPolicy', handle: 'privacy-policy', title: 'Privacy Policy'},
];

function htmlFor(handle: string): string | null {
  const key = `../../policies/${handle}.html`;
  return policyHtml[key] ?? null;
}

function buildPolicy(handle: string, title: string): LocalPolicy | null {
  const body = htmlFor(handle);
  if (body == null) return null;
  return {
    id: `local-policy:${handle}`,
    handle,
    title,
    body,
    url: `/policies/${handle}`,
  };
}

export function listLocalPolicies(): LocalPolicy[] {
  return STANDARD_POLICIES.map(({handle, title}) =>
    buildPolicy(handle, title),
  ).filter((p): p is LocalPolicy => p !== null);
}

export function getLocalPolicyByHandle(
  handle: string,
): LocalPolicy | null {
  const entry = STANDARD_POLICIES.find((p) => p.handle === handle);
  if (!entry) return null;
  return buildPolicy(entry.handle, entry.title);
}

/**
 * Look up a policy using the camelCase Shopify field name
 * (e.g. `shippingPolicy` → `shipping-policy`). Used by the
 * `/policies/:policyHandle` route which derives the field name from
 * the URL handle.
 */
export function getLocalPolicyByShopField(
  shopField: string,
): LocalPolicy | null {
  const entry = STANDARD_POLICIES.find((p) => p.shopField === shopField);
  if (!entry) return null;
  return buildPolicy(entry.handle, entry.title);
}

// --- Generic pages (Shopify "Pages") served from the same directory ---

/**
 * Pages whose canonical body lives alongside the policies in
 * `/policies/*.html`. These are content pages (not buy-flow) that
 * should render without a Storefront API roundtrip.
 */
const LOCAL_PAGES: Array<{handle: string; title: string}> = [
  {handle: 'contact-information', title: 'Contact Information'},
  {handle: 'legal-notice', title: 'Legal Notice'},
];

export interface LocalPage {
  id: string;
  handle: string;
  title: string;
  /** Rendered HTML body. */
  body: string;
}

export function getLocalPageByHandle(handle: string): LocalPage | null {
  const entry = LOCAL_PAGES.find((p) => p.handle === handle);
  if (!entry) return null;
  const body = htmlFor(handle);
  if (body == null) return null;
  return {
    id: `local-page:${handle}`,
    handle: entry.handle,
    title: entry.title,
    body,
  };
}
