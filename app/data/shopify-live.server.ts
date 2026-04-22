/**
 * Live commerce data loader.
 *
 * The local product catalog (`~/data/product-catalog`) holds all
 * **content**: titles, descriptions, gallery, specs. This module owns the
 * **commerce snippet** — the thin slice of per-variant data Shopify is
 * the source of truth for at runtime:
 *
 *   - `price`, `compareAtPrice`
 *   - `availableForSale`, `quantityAvailable`
 *   - derived `stockState` enum used by the buy-box UI
 *
 * Pages should ALWAYS pair `getProductRecord(handle)` with
 * `getCommerceByHandles([handle])` and then merge the two server-side.
 * Never display price or stock from anywhere except the snippet returned
 * here. If the live query fails, callers get an empty map — render the
 * "pricing/availability temporarily unavailable" affordance and disable
 * Add-to-Cart.
 */

import type {Storefront} from '@shopify/hydrogen';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StockState =
  | 'in_stock'        // availableForSale && quantityAvailable > 0
  | 'low_stock'       // availableForSale && 0 < quantityAvailable <= LOW_STOCK_THRESHOLD
  | 'preorder'        // availableForSale && quantityAvailable === 0 && inventoryPolicy = CONTINUE
  | 'backorder'       // !availableForSale && inventoryPolicy = CONTINUE (Shopify allows oversell)
  | 'out_of_stock'    // !availableForSale
  | 'unknown';        // Shopify didn't return tracked inventory

export interface MoneyAmount {
  amount: string;
  currencyCode: string;
}

export interface CommerceVariantSnippet {
  variantId: string;
  /** SKU is denormalized into the snippet so call sites can correlate without a second lookup. */
  sku: string | null;
  title: string;
  selectedOptions: {name: string; value: string}[];
  price: MoneyAmount;
  compareAtPrice: MoneyAmount | null;
  availableForSale: boolean;
  /** May be null when the variant has tracked-inventory disabled. */
  quantityAvailable: number | null;
  /** Raw Shopify enum: "DENY" | "CONTINUE". */
  inventoryPolicy: 'DENY' | 'CONTINUE' | null;
  stockState: StockState;
}

export interface CommerceSnippet {
  handle: string;
  productId: string;
  /** First variant by `position` — the buy-box default. */
  defaultVariant: CommerceVariantSnippet | null;
  variants: CommerceVariantSnippet[];
  /** Product-level rollup: true if any variant is available. */
  availableForSale: boolean;
  currencyCode: string;
}

export type CommerceByHandle = Map<string, CommerceSnippet>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Threshold (inclusive) for the "low stock" affordance. */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Shopify Storefront API limit on `?ids=` / `?handles` style lookups.
 * Most of our category pages stay well under this.
 */
const MAX_HANDLES_PER_QUERY = 250;

// ---------------------------------------------------------------------------
// GraphQL
// ---------------------------------------------------------------------------

const COMMERCE_FRAGMENT = `#graphql
  fragment CommerceProductFields on Product {
    id
    handle
    availableForSale
    variants(first: 100) {
      nodes {
        id
        sku
        title
        availableForSale
        quantityAvailable
        currentlyNotInStock
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

const COMMERCE_BY_HANDLES_QUERY = `#graphql
  ${COMMERCE_FRAGMENT}
  query CommerceByHandles(
    $first: Int!
    $query: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        ...CommerceProductFields
      }
    }
  }
`;

// Shopify Storefront returns variant inventoryPolicy via the `currentlyNotInStock`
// + `availableForSale` combination; the explicit `inventoryPolicy` field is
// only available via the Admin API. We infer below.

interface RawVariantNode {
  id: string;
  sku: string | null;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  currentlyNotInStock: boolean | null;
  selectedOptions: {name: string; value: string}[];
  price: MoneyAmount;
  compareAtPrice: MoneyAmount | null;
}

interface RawProductNode {
  id: string;
  handle: string;
  availableForSale: boolean;
  variants: {nodes: RawVariantNode[]};
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildHandleFilterQuery(handles: string[]): string {
  return handles.map((h) => `handle:${h}`).join(' OR ');
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function deriveStockState(v: RawVariantNode): StockState {
  // Inventory not tracked → we cannot tell the difference between
  // "in stock unlimited" and "out of stock"; Shopify returns
  // quantityAvailable === null. Trust availableForSale as the binary signal.
  if (v.quantityAvailable === null) {
    return v.availableForSale ? 'in_stock' : 'out_of_stock';
  }

  if (v.availableForSale) {
    if (v.quantityAvailable <= 0) {
      // Available but zero quantity → preorder (inventoryPolicy = CONTINUE
      // with currentlyNotInStock = true).
      return 'preorder';
    }
    if (v.quantityAvailable <= LOW_STOCK_THRESHOLD) return 'low_stock';
    return 'in_stock';
  }

  // !availableForSale. If Shopify still considers it "currentlyNotInStock"
  // but flagged not-for-sale, it's just out of stock. There's no Storefront
  // API signal that distinguishes a hard "out of stock" from a soft
  // "backorder" once availableForSale is false, so we treat as out_of_stock.
  return 'out_of_stock';
}

function inferInventoryPolicy(v: RawVariantNode): 'DENY' | 'CONTINUE' | null {
  // If a variant reports `availableForSale: true` while
  // `currentlyNotInStock: true`, Shopify is allowing oversell → CONTINUE.
  if (v.availableForSale && v.currentlyNotInStock === true) return 'CONTINUE';
  // If a variant reports out of stock AND not available → DENY.
  if (!v.availableForSale && v.currentlyNotInStock === true) return 'DENY';
  return null;
}

function toVariantSnippet(v: RawVariantNode): CommerceVariantSnippet {
  return {
    variantId: v.id,
    sku: v.sku ?? null,
    title: v.title,
    selectedOptions: v.selectedOptions ?? [],
    price: v.price,
    compareAtPrice: v.compareAtPrice ?? null,
    availableForSale: v.availableForSale,
    quantityAvailable: v.quantityAvailable,
    inventoryPolicy: inferInventoryPolicy(v),
    stockState: deriveStockState(v),
  };
}

function toSnippet(p: RawProductNode): CommerceSnippet {
  const variants = (p.variants.nodes ?? []).map(toVariantSnippet);
  // Default = lowest-position variant; the storefront API doesn't return
  // `position`, so we trust the order Shopify sends (which is by position).
  const defaultVariant = variants[0] ?? null;
  return {
    handle: p.handle,
    productId: p.id,
    defaultVariant,
    variants,
    availableForSale: p.availableForSale,
    currencyCode: defaultVariant?.price.currencyCode ?? 'USD',
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GetCommerceByHandlesOptions {
  /** Fail-soft (default): on error, return an empty map and log. */
  swallowErrors?: boolean;
}

/**
 * Look up live commerce data for one or more product handles.
 *
 * - Handles are de-duped before sending.
 * - Requests larger than `MAX_HANDLES_PER_QUERY` are chunked transparently.
 * - Cached at the Hydrogen edge for 60 s with 5-min SWR — the buy-box
 *   stays current within a minute, while traffic spikes don't hammer
 *   Shopify.
 * - On failure: returns an empty map by default. Callers should treat
 *   missing handles as "live data unavailable" and render a degraded
 *   buy box.
 */
export async function getCommerceByHandles(
  storefront: Storefront,
  handles: string[],
  opts: GetCommerceByHandlesOptions = {},
): Promise<CommerceByHandle> {
  const out: CommerceByHandle = new Map();
  const dedup = Array.from(new Set(handles.filter(Boolean)));
  if (!dedup.length) return out;

  const cache = storefront.CacheCustom({
    mode: 'public',
    maxAge: 60,
    staleWhileRevalidate: 300,
  });

  const batches = chunk(dedup, MAX_HANDLES_PER_QUERY);

  for (const batch of batches) {
    try {
      const {products} = await storefront.query<{
        products: {nodes: RawProductNode[]};
      }>(COMMERCE_BY_HANDLES_QUERY, {
        variables: {
          first: batch.length,
          query: buildHandleFilterQuery(batch),
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
        cache,
      });

      for (const node of products.nodes ?? []) {
        out.set(node.handle, toSnippet(node));
      }
    } catch (err) {
      const swallow = opts.swallowErrors ?? true;
      console.error(
        `[shopify-live] getCommerceByHandles failed for ${batch.length} handles:`,
        err,
      );
      if (!swallow) throw err;
    }
  }

  return out;
}

/** Convenience wrapper for a single handle. */
export async function getCommerceByHandle(
  storefront: Storefront,
  handle: string,
  opts?: GetCommerceByHandlesOptions,
): Promise<CommerceSnippet | null> {
  const map = await getCommerceByHandles(storefront, [handle], opts);
  return map.get(handle) ?? null;
}
