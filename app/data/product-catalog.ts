/**
 * Product catalog accessor.
 *
 * The local content snapshot is built by `scripts/seed-local-from-pulled.mjs`
 * (one-shot bootstrap) and refreshed via `yarn shopify:sync:pull` +
 * `yarn catalog:bootstrap` thereafter. This module is the single import
 * point for the rest of the app — every page should consume `ProductRecord`
 * (content) and pair it with `CommerceSnippet` (live price + stock from
 * `~/data/shopify-live.server`).
 *
 * NEVER read price, compareAtPrice, availableForSale, or quantityAvailable
 * from `ProductRecord.variants[*]`. Those fields are intentionally absent
 * here — Shopify is the source of truth for live commerce data.
 */

import catalogJson from './generated/product-catalog.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductGalleryItem {
  /** "image" | "video" | "model_3d" | "external_video" (lower-case Shopify type) */
  type: string;
  alt: string;
  width: number | null;
  height: number | null;
  /** Shopify CDN URL (kept as fallback; not preferred at render time). */
  shopifyUrl: string | null;
  /**
   * Path under `catalog/shopify/products/<handle>/media/...` — the
   * Shopify mirror snapshot. Used as a content-side fallback when no
   * lfs-managed asset is available. NOT a runtime-served path.
   */
  localPath: string | null;
  position: number;
  embeddedUrl?: string;
  host?: string;
  sources?: unknown[];
}

export interface ProductOption {
  id?: string;
  name: string;
  position?: number;
  values: string[];
}

export interface ProductSelectedOption {
  name: string;
  value: string;
}

/**
 * Variant content (no price, no inventory). Pair with `CommerceSnippet`
 * to render anything money-related.
 */
export interface ProductVariantRecord {
  shopifyVariantId: string;
  sku: string | null;
  title: string;
  position: number;
  selectedOptions: ProductSelectedOption[];
  barcode: string | null;
  inventoryPolicy: string | null;
  taxable: boolean;
}

export interface ProductMetafieldValue {
  type: string;
  value: string;
}

/** Map keyed by `${namespace}:${key}` */
export type ProductMetafieldMap = Record<string, ProductMetafieldValue>;

export interface ProductSeo {
  title: string | null;
  description: string | null;
}

/**
 * Canonical local product record. Built from
 * `catalog/shopify/products/<handle>/{product,variants,metafields,media,seo}.json`
 * + `description.html` by the bootstrap script. Should be the only
 * Shopify-shaped data the app reads at runtime apart from cart/account.
 */
export interface ProductRecord {
  handle: string;
  shopifyProductId: string;
  title: string;
  vendor: string;
  productType: string;
  status: string;
  tags: string[];
  isActive: boolean;
  isVisible: boolean;
  isBStock: boolean;
  subtitle: string | null;
  descriptionHtml: string;
  descriptionPlain: string;
  seo: ProductSeo | null;
  options: ProductOption[];
  gallery: ProductGalleryItem[];
  variants: ProductVariantRecord[];
  metafields: ProductMetafieldMap;
  onlineStoreUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProductCatalog {
  version: number;
  generatedAt: string;
  source: string;
  productCount: number;
  products: Record<string, ProductRecord>;
}

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

const CATALOG = catalogJson as unknown as ProductCatalog;

export function getProductCatalog(): ProductCatalog {
  return CATALOG;
}

/**
 * Product handles that exist in the Shopify catalog but should be
 * hidden from the storefront entirely (unreleased, embargoed, etc.).
 *
 * The product detail route returns 404 for these, `listProductRecords`
 * excludes them, and recommended-products surfaces drop them.
 */
const HIDDEN_PRODUCT_HANDLES: ReadonlySet<string> = new Set([
  // Unreleased — keep hidden until launch.
  'vessel-84',
]);

export function isHiddenProductHandle(handle: string): boolean {
  return HIDDEN_PRODUCT_HANDLES.has(handle);
}

export function getProductRecord(handle: string): ProductRecord | null {
  return CATALOG.products[handle] ?? null;
}

/**
 * True when the Shopify product carries the "AI" tag (matched case-insensitively).
 * Used to omit such products from product category (overview) pages.
 */
export function productHasAiTag(
  record: ProductRecord | null | undefined,
): boolean {
  if (!record?.tags?.length) return false;
  return record.tags.some((t) => t.toLowerCase() === 'ai');
}

export function hasProductRecord(handle: string): boolean {
  return Object.prototype.hasOwnProperty.call(CATALOG.products, handle);
}

export interface ListProductRecordsOptions {
  /** Restrict to active products (default: true). */
  activeOnly?: boolean;
  /** Restrict to products tagged "Visible" (default: false — no filter). */
  visibleOnly?: boolean;
  /** Restrict to products tagged "B-Stock" (default: false — no filter). */
  bStockOnly?: boolean;
  /** Filter by Shopify productType (case-insensitive substring match). */
  productType?: string;
  /** Custom predicate for arbitrary filtering. */
  filter?: (record: ProductRecord) => boolean;
}

export function listProductRecords(
  opts: ListProductRecordsOptions = {},
): ProductRecord[] {
  const {
    activeOnly = true,
    visibleOnly = false,
    bStockOnly = false,
    productType,
    filter,
  } = opts;

  const productTypeNeedle = productType?.toLowerCase();

  const out: ProductRecord[] = [];
  for (const record of Object.values(CATALOG.products)) {
    if (HIDDEN_PRODUCT_HANDLES.has(record.handle)) continue;
    if (activeOnly && !record.isActive) continue;
    if (visibleOnly && !record.isVisible) continue;
    if (bStockOnly && !record.isBStock) continue;
    if (
      productTypeNeedle &&
      !(record.productType ?? '').toLowerCase().includes(productTypeNeedle)
    ) {
      continue;
    }
    if (filter && !filter(record)) continue;
    out.push(record);
  }
  return out;
}

/** Look up a record by Shopify product GID (slow — O(n)). */
export function getProductRecordByGid(gid: string): ProductRecord | null {
  for (const record of Object.values(CATALOG.products)) {
    if (record.shopifyProductId === gid) return record;
  }
  return null;
}

/** Convenience: subtitle with fallback to the `descriptors:subtitle` metafield. */
export function getProductSubtitle(record: ProductRecord): string | null {
  return (
    record.subtitle ?? record.metafields['descriptors:subtitle']?.value ?? null
  );
}

/**
 * Default variant for a product (first by `position`).
 * Returns null for products with zero variants.
 */
export function getDefaultVariant(
  record: ProductRecord,
): ProductVariantRecord | null {
  if (!record.variants.length) return null;
  return [...record.variants].sort((a, b) => a.position - b.position)[0];
}
