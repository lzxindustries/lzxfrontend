import type {
  Product as ProductType,
  ProductVariant,
  Shop,
} from '@shopify/hydrogen/storefront-api-types';
import type {AppLoadContext} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {
  getModuleById,
  getModuleConnectors,
  getModuleControls,
  getModuleFeatures,
  getModuleAssets,
  getPatchesForModule,
  getVideosForModule,
} from '~/data/lzxdb';
import type {
  LzxModule,
  LzxModuleConnector,
  LzxModuleControl,
  LzxModuleFeature,
  LzxModuleAsset,
  LzxPatch,
  LzxVideo,
} from '~/data/lzxdb';
import {
  getSlugEntry,
  getModuleIdForSlug,
  getDocPathForSlug,
} from '~/data/product-slugs';
import type {SlugEntry} from '~/data/product-slugs';
import {
  hasDocPagePath,
  buildSidebar,
  listDocsInSection,
} from '~/lib/content.server';
import type {SidebarItem, DocPage} from '~/lib/content.server';
import type {ContentFrontmatter} from '~/lib/markdown.server';
import matter from 'gray-matter';

// --- Types ---

export interface ModuleHubData {
  slug: string;
  slugEntry: SlugEntry;
  product: ProductType & {selectedVariant?: ProductVariant};
  shop: Shop;
  lzxModule: LzxModule | null;
  docFrontmatter: ContentFrontmatter | null;
  hasManual: boolean;
  patches: LzxPatch[];
  videos: LzxVideo[];
  connectors: LzxModuleConnector[];
  controls: LzxModuleControl[];
  features: LzxModuleFeature[];
  assets: LzxModuleAsset[];
  sidebar: SidebarItem[];
}

export interface InstrumentHubData {
  slug: string;
  slugEntry: SlugEntry;
  product: ProductType & {selectedVariant?: ProductVariant};
  shop: Shop;
  lzxModule: LzxModule | null;
  docFrontmatter: ContentFrontmatter | null;
  hasManual: boolean;
  videos: LzxVideo[];
  assets: LzxModuleAsset[];
  sidebar: SidebarItem[];
  /** Doc pages within the instrument folder, for determining available sub-sections */
  docPages: DocPage[];
}

// --- GraphQL ---

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment HubProductVariantFragment on ProductVariant {
    id
    availableForSale
    quantityAvailable
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const HUB_PRODUCT_QUERY = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  query HubProduct(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      options {
        name
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...HubProductVariantFragment
      }
      media(first: 20) {
        nodes {
          ...Media
        }
      }
      variants(first: 250) {
        nodes {
          ...HubProductVariantFragment
        }
      }
      seo {
        description
        title
      }
      metafields(identifiers: [
        {namespace: "custom", key: "specs"},
        {namespace: "custom", key: "features"},
        {namespace: "custom", key: "compatibility"},
        {namespace: "descriptors", key: "subtitle"},
      ]) {
        key
        namespace
        value
        type
      }
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query hubProductRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// --- Doc frontmatter loading ---

const moduleDocFiles = import.meta.glob<string>(
  '../../content/docs/modules/*.md',
  {query: '?raw', import: 'default', eager: true},
);

const instrumentDocFiles = import.meta.glob<string>(
  '../../content/docs/instruments/**/*.md',
  {query: '?raw', import: 'default', eager: true},
);

function getDocFrontmatter(docPath: string): ContentFrontmatter | null {
  // Try direct file, then index
  const candidates = [
    `../../content/docs/${docPath}.md`,
    `../../content/docs/${docPath}/index.md`,
  ];

  const allFiles = {...moduleDocFiles, ...instrumentDocFiles};

  for (const candidate of candidates) {
    const raw = allFiles[candidate];
    if (!raw) continue;
    try {
      const parsed = matter(raw);
      return parsed.data as ContentFrontmatter;
    } catch {
      return null;
    }
  }
  return null;
}

// --- Shopify query helper ---

async function fetchShopifyProduct(
  context: AppLoadContext,
  handle: string,
  selectedOptions: {name: string; value: string}[],
) {
  const {product, shop} = await context.storefront.query<{
    product: ProductType & {selectedVariant?: ProductVariant};
    shop: Shop;
  }>(HUB_PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  return {product, shop};
}

export async function getRecommendedProducts(
  context: AppLoadContext,
  productId: string,
) {
  const products = await context.storefront.query<{
    recommended: ProductType[];
    additional: {nodes: ProductType[]};
  }>(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts: ProductType[] = products.recommended
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((v2) => v2.id === value.id) === index,
    );

  const idx = mergedProducts.findIndex((item) => item.id === productId);
  if (idx >= 0) mergedProducts.splice(idx, 1);

  return mergedProducts;
}

// --- Module hub loader ---

export async function loadModuleHubData(
  slug: string,
  context: AppLoadContext,
  request: Request,
): Promise<ModuleHubData | null> {
  const slugEntry = getSlugEntry(slug);
  if (!slugEntry || slugEntry.hubType !== 'module') return null;

  // Determine Shopify handle — try canonical slug first, fall back to the lzxdb slugified name
  const handle = slugEntry.canonical;

  // Parse variant selection from URL
  const searchParams = new URL(request.url).searchParams;
  const selectedOptions: {name: string; value: string}[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  // Fetch Shopify product
  const {product, shop} = await fetchShopifyProduct(
    context,
    handle,
    selectedOptions,
  );

  if (!product?.id) return null;

  // Local DB lookups
  const moduleId = getModuleIdForSlug(slug);
  const lzxModule = moduleId ? getModuleById(moduleId) ?? null : null;

  const patches = moduleId ? getPatchesForModule(moduleId) : [];
  const videos = moduleId ? getVideosForModule(moduleId) : [];
  const connectors = moduleId ? getModuleConnectors(moduleId) : [];
  const controls = moduleId ? getModuleControls(moduleId) : [];
  const features = moduleId ? getModuleFeatures(moduleId) : [];
  const assets = moduleId ? getModuleAssets(moduleId) : [];

  // Doc metadata
  const docPath = getDocPathForSlug(slug);
  const hasManual = docPath ? hasDocPagePath(docPath) : false;
  const docFrontmatter = docPath ? getDocFrontmatter(docPath) : null;

  // Build sidebar for cross-module navigation
  const sidebar = buildSidebar('modules');

  return {
    slug: slugEntry.canonical,
    slugEntry,
    product,
    shop,
    lzxModule,
    docFrontmatter,
    hasManual,
    patches,
    videos,
    connectors,
    controls,
    features,
    assets,
    sidebar,
  };
}

// --- Instrument hub loader ---

export async function loadInstrumentHubData(
  slug: string,
  context: AppLoadContext,
  request: Request,
): Promise<InstrumentHubData | null> {
  const slugEntry = getSlugEntry(slug);
  if (!slugEntry || slugEntry.hubType !== 'instrument') return null;

  const handle = slugEntry.canonical;

  // Parse variant selection from URL
  const searchParams = new URL(request.url).searchParams;
  const selectedOptions: {name: string; value: string}[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  // Fetch Shopify product
  const {product, shop} = await fetchShopifyProduct(
    context,
    handle,
    selectedOptions,
  );

  if (!product?.id) return null;

  // Local DB lookups
  const moduleId = getModuleIdForSlug(slug);
  const lzxModule = moduleId ? getModuleById(moduleId) ?? null : null;

  const videos = moduleId ? getVideosForModule(moduleId) : [];
  const assets = moduleId ? getModuleAssets(moduleId) : [];

  // Doc metadata
  const docPath = getDocPathForSlug(slug);
  const hasManual = docPath ? hasDocPagePath(docPath) : false;
  const docFrontmatter = docPath ? getDocFrontmatter(docPath) : null;

  // Get the instrument's section of the doc tree
  const instrumentSection = `instruments/${slugEntry.canonical}`;
  const sidebar = hasManual ? buildSidebar(instrumentSection) : [];

  // Get all doc pages within this instrument's folder (for content availability checks)
  const docPages = hasManual ? listDocsInSection(instrumentSection) : [];

  return {
    slug: slugEntry.canonical,
    slugEntry,
    product,
    shop,
    lzxModule,
    docFrontmatter,
    hasManual,
    videos,
    assets,
    sidebar,
    docPages,
  };
}
