import type {LfsProductAsset} from '~/data/lfs-product-metadata';
import type {CommerceSnippet} from '~/data/shopify-live.server';

// NOTE: The legacy `CategoryListingProduct` type and the
// `CATEGORY_LISTING_*_QUERY` GraphQL queries were removed when category
// listings switched to the local product catalog + on-demand
// `getCommerceByHandles()` snippet. See `loader.ts`.

export type CategoryAspectRatio = '1/1' | '16/9';
export type CategoryImageFit = 'contain' | 'cover';

/**
 * A raw category entry as supplied by a category config (before Shopify
 * enrichment / resolver application by the loader).
 *
 * Most categories source these from `~/data/product-slugs` (`SlugEntry`),
 * but configs may also produce synthetic entries (e.g. external/community
 * links such as VH.S modules or the BitVision legacy entry).
 */
export type CategorySourceEntry = {
  canonical: string;
  name: string;
  isHidden?: boolean;
  shopifyGid?: string | null;
  externalUrl?: string | null;
  // Extra metadata may be carried through for resolver use.
  moduleId?: string | null;
  [extra: string]: unknown;
};

export type CategoryRawGroup = {
  key: string;
  entries: CategorySourceEntry[];
};

export type CategoryRawSection = {
  key: string;
  groups: CategoryRawGroup[];
};

/**
 * Ctx passed to per-entry resolvers so configs can vary behavior by section
 * (e.g. apply a "Legacy" badge only inside the legacy section).
 */
export type CategoryEntryContext = {
  sectionKey: string;
  groupKey: string;
};

export type CategoryArtworkResolution = {
  path: string;
  aspectRatio?: CategoryAspectRatio;
  fit?: CategoryImageFit;
};

/**
 * Declarative configuration for a category overview page. Consumed by
 * `createCategoryListingLoader` and rendered by `<CategoryListing/>`.
 */
export type CategoryListingConfig = {
  /** Stable identifier — used as collection id for SEO payload. */
  key: string;

  /** Page-level chrome. */
  pageTitle: string;
  pageSubtitle?: string;
  rightSlot?: {label: string; to: string};

  /** SEO. */
  seoTitle: string;
  seoDescription: string;

  /** Section-level labels (e.g. {active:'Active', legacy:'Legacy'}). */
  sectionLabels?: Record<string, string>;

  /** Card layout knobs. */
  gridColsClassName?: string;
  cardSize?: 'sm' | 'md';
  defaultArtworkAspectRatio?: CategoryAspectRatio;
  defaultArtworkFit?: CategoryImageFit;

  /**
   * When true, the loader fetches a live `CommerceSnippet` (price + stock)
   * for every entry via `getCommerceByHandles`. Cards that don't render
   * money or stock indicators should leave this off to skip the
   * Storefront-API round-trip entirely.
   */
  includeCommerce?: boolean;

  /** Source: returns sections of groups of raw entries. */
  getRawSections: () => CategoryRawSection[];

  /** Resolve internal href for entries that have an internal page. */
  detailHref: (entry: CategorySourceEntry, ctx: CategoryEntryContext) => string;

  /** Optional resolvers — all default to no-op. */
  resolveSubtitle?: (entry: CategorySourceEntry) => string | null | undefined;
  resolveArtwork?: (
    entry: CategorySourceEntry,
    ctx: CategoryEntryContext,
  ) => CategoryArtworkResolution | null | undefined;
  resolveBadge?: (
    entry: CategorySourceEntry,
    ctx: CategoryEntryContext,
  ) => string | null | undefined;
  /** Whether the entry has an internal detail page (vs. external link only). */
  resolveHasInternalPage?: (entry: CategorySourceEntry) => boolean;
  /** Optional final filter — return false to drop after enrichment. */
  filterEntry?: (
    entry: CategorySourceEntry & {hasManual: boolean},
    ctx: CategoryEntryContext,
  ) => boolean;
  /** Optional sort comparator within a group. Defaults to name asc. */
  sortEntries?: (
    a: CategorySourceEntry,
    b: CategorySourceEntry,
  ) => number;

  /** Group-level enrichment. */
  resolveGroupLabel?: (groupKey: string) => string | undefined;
  resolveGroupSubtitle?: (groupKey: string) => string | undefined;
  resolveGroupArchive?: (
    groupKey: string,
  ) => {assets: LfsProductAsset[]; title?: string} | null | undefined;
};

/* ----------------------- Serializable loader payload ---------------------- */

export type CategoryEntryImage = {
  localPath?: string | null;
  shopify?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  aspectRatio: CategoryAspectRatio;
  fit: CategoryImageFit;
};

export type CategoryListingEntry = {
  key: string;
  name: string;
  subtitle?: string | null;
  href: string;
  externalUrl?: string | null;
  isExternal: boolean;
  badge?: string | null;
  image: CategoryEntryImage;
  /**
   * Live commerce snippet (price + stock) when the config opted in via
   * `includeCommerce`. Always `null` otherwise.
   */
  commerce?: CommerceSnippet | null;
};

export type CategoryListingGroup = {
  key: string;
  label?: string;
  subtitle?: string;
  entries: CategoryListingEntry[];
  archive?: {assets: LfsProductAsset[]; title?: string} | null;
};

export type CategoryListingSection = {
  key: string;
  label?: string;
  groups: CategoryListingGroup[];
};

export type CategoryListingData = {
  pageTitle: string;
  pageSubtitle?: string;
  rightSlot?: {label: string; to: string};
  cardSize: 'sm' | 'md';
  gridColsClassName: string;
  sections: CategoryListingSection[];
  // SEO is built separately — kept loose to avoid SeoConfig type churn here.
  seo?: unknown;
};
