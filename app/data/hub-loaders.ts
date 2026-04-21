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
  getLfsProductMetadataBySlug,
  getLfsProductContentBySlug,
  getLegacyProductContentBySlug,
  getLegacyVisionaryModuleMetadataBySlug,
} from '~/data/lfs-product-metadata';
import type {LfsProductAsset} from '~/data/lfs-product-metadata';
import {
  getSlugEntry,
  getModuleIdForSlug,
  getDocPathForSlug,
} from '~/data/product-slugs';
import type {SlugEntry} from '~/data/product-slugs';
import {getMarkdownToHTML} from '~/lib/markdown';
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
  hasShopifyProduct: boolean;
  isLegacy: boolean;
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
  archiveAssets: LfsProductAsset[];
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
  patches: LzxPatch[];
  videos: LzxVideo[];
  connectors: LzxModuleConnector[];
  controls: LzxModuleControl[];
  features: LzxModuleFeature[];
  assets: LzxModuleAsset[];
  archiveAssets: LfsProductAsset[];
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

const HUB_PRODUCT_BY_ID_QUERY = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  query HubProductById(
    $country: CountryCode
    $language: LanguageCode
    $id: ID!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    node(id: $id) {
      ... on Product {
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
  shopifyGid?: string | null,
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

  if (product?.id || !shopifyGid) {
    return {product, shop};
  }

  const fallback = await context.storefront.query<{
    node: (ProductType & {selectedVariant?: ProductVariant}) | null;
    shop: Shop;
  }>(HUB_PRODUCT_BY_ID_QUERY, {
    variables: {
      id: shopifyGid,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  return {product: fallback.node ?? product, shop: fallback.shop};
}

function buildFallbackShop(request: Request): Shop {
  const url = new URL(request.url);

  return {
    name: 'LZX Industries',
    primaryDomain: {url: url.origin},
    shippingPolicy: null,
    refundPolicy: null,
  } as Shop;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasContent(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildLegacyMediaNodes(slug: string) {
  const legacyContent = getLfsProductContentBySlug(slug);
  if (!legacyContent) return [];

  return legacyContent.galleryImages.map((image, index) => ({
    id: `lfs-media:${slug}:${index}`,
    alt: image.alt,
    mediaContentType: 'IMAGE',
    image: {
      url: image.src,
      altText: image.alt,
      width: null,
      height: null,
    },
    previewImage: {
      url: image.src,
      altText: image.alt,
      width: null,
      height: null,
    },
  }));
}

function mergeLegacyAssets(
  assets: LzxModuleAsset[],
  slug: string,
): LzxModuleAsset[] {
  const legacyContent = getLfsProductContentBySlug(slug);
  if (!legacyContent || legacyContent.downloads.length === 0) {
    return assets;
  }

  const existingFileNames = new Set(
    assets
      .map((asset) => asset.fileName?.toLowerCase())
      .filter((fileName): fileName is string => Boolean(fileName)),
  );

  const appended = legacyContent.downloads
    .filter((download) => !existingFileNames.has(download.fileName.toLowerCase()))
    .map(
      (download) =>
        ({
          id: download.id,
          moduleId: slug,
          assetId: download.id,
          name: download.name,
          fileName: download.fileName,
          fileType: download.fileType,
          description: download.description,
          version: download.version,
          platform: download.platform,
          releaseDate: download.releaseDate,
          href: download.href,
        }) as LzxModuleAsset,
    );

  return [...assets, ...appended];
}

function mergeLegacyProductData(
  product: ProductType & {selectedVariant?: ProductVariant},
  slug: string,
): ProductType & {selectedVariant?: ProductVariant} {
  const legacyContent = getLfsProductContentBySlug(slug);
  if (!legacyContent) return product;

  const existingMediaNodes = product.media?.nodes ?? [];
  const existingImageUrls = new Set(
    existingMediaNodes
      .map((item: any) => item?.image?.url)
      .filter((url: unknown): url is string => typeof url === 'string'),
  );
  const legacyMediaNodes = buildLegacyMediaNodes(slug).filter(
    (item: any) => !existingImageUrls.has(item.image.url),
  );

  const metafields = [
    ...((((product as any).metafields as Array<Record<string, unknown> | null>) ??
      []).filter(Boolean) as Array<Record<string, unknown>>),
  ];

  if (
    legacyContent.subtitle &&
    !metafields.some(
      (field) =>
        field.namespace === 'descriptors' && field.key === 'subtitle',
    )
  ) {
    metafields.push({
      key: 'subtitle',
      namespace: 'descriptors',
      value: legacyContent.subtitle,
      type: 'single_line_text_field',
    });
  }

  if (
    legacyContent.specsHtml &&
    !metafields.some(
      (field) => field.namespace === 'custom' && field.key === 'specs',
    )
  ) {
    metafields.push({
      key: 'specs',
      namespace: 'custom',
      value: legacyContent.specsHtml,
      type: 'multi_line_text_field',
    });
  }

  return {
    ...product,
    descriptionHtml:
      hasContent(product.descriptionHtml) || !legacyContent.descriptionHtml
        ? product.descriptionHtml
        : legacyContent.descriptionHtml,
    description:
      hasContent(product.description) || !legacyContent.descriptionText
        ? product.description
        : legacyContent.descriptionText,
    media: {
      ...(product.media ?? {nodes: []}),
      nodes: [...existingMediaNodes, ...legacyMediaNodes],
    },
    seo: {
      ...product.seo,
      description:
        hasContent(product.seo?.description)
          ? product.seo?.description
          : legacyContent.descriptionText ??
            legacyContent.subtitle ??
            product.seo?.description,
    },
    metafields,
  } as ProductType & {selectedVariant?: ProductVariant};
}

function buildFallbackModuleProduct(
  slugEntry: SlugEntry,
  lzxModule: LzxModule | null,
): ProductType & {selectedVariant?: ProductVariant} {
  const lfsProduct = getLfsProductMetadataBySlug(slugEntry.canonical);
  const legacyProductContent = getLegacyProductContentBySlug(slugEntry.canonical);

  const subtitle =
    legacyProductContent?.subtitle ??
    lzxModule?.subtitle ??
    lfsProduct?.subtitle ??
    null;

  const descriptionHtml =
    legacyProductContent?.descriptionHtml ??
    (lfsProduct?.description ? getMarkdownToHTML(lfsProduct.description) : '');
  const description =
    legacyProductContent?.descriptionText ??
    lfsProduct?.description ??
    subtitle ??
    '';
  const specsHtml = legacyProductContent?.specsHtml ?? null;
  const seoDescription =
    stripHtml(descriptionHtml || '') || description || subtitle || '';

  const metafields = [
    subtitle
      ? {
          key: 'subtitle',
          namespace: 'descriptors',
          value: subtitle,
          type: 'single_line_text_field',
        }
      : null,
    specsHtml
      ? {
          key: 'specs',
          namespace: 'custom',
          value: specsHtml,
          type: 'multi_line_text_field',
        }
      : null,
  ].filter(Boolean);

  return {
    id: `legacy-module:${slugEntry.canonical}`,
    title: slugEntry.name,
    vendor: 'LZX Industries',
    handle: slugEntry.canonical,
    description,
    descriptionHtml,
    options: [],
    media: {nodes: buildLegacyMediaNodes(slugEntry.canonical)},
    variants: {nodes: []},
    seo: {
      title: slugEntry.name,
      description: seoDescription,
    },
    metafields,
  } as unknown as ProductType & {selectedVariant?: ProductVariant};
}

function isLegacyModuleState(
  slugEntry: SlugEntry,
  lzxModule: LzxModule | null,
): boolean {
  const lfsProduct = getLfsProductMetadataBySlug(slugEntry.canonical);
  if (lfsProduct) {
    return !lfsProduct.isActive;
  }

  if (getLegacyVisionaryModuleMetadataBySlug(slugEntry.canonical)) {
    return true;
  }

  if (typeof lzxModule?.isActiveProduct === 'boolean') {
    return !lzxModule.isActiveProduct;
  }

  if (typeof lzxModule?.isHidden === 'boolean') {
    return lzxModule.isHidden;
  }

  return slugEntry.isHidden;
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

  // Local DB lookups
  const moduleId = getModuleIdForSlug(slug);
  const lzxModule = moduleId ? getModuleById(moduleId) ?? null : null;
  const isLegacy = isLegacyModuleState(slugEntry, lzxModule);

  const patches = moduleId ? getPatchesForModule(moduleId) : [];
  const videos = moduleId ? getVideosForModule(moduleId) : [];
  const connectors = moduleId ? getModuleConnectors(moduleId) : [];
  const controls = moduleId ? getModuleControls(moduleId) : [];
  const features = moduleId ? getModuleFeatures(moduleId) : [];
  const assets = mergeLegacyAssets(
    moduleId ? getModuleAssets(moduleId) : [],
    slugEntry.canonical,
  );
  const archiveAssets =
    getLfsProductContentBySlug(slugEntry.canonical)?.archiveAssets.filter(
      (asset) => !asset.isDownload,
    ) ?? [];

  // Doc metadata
  const docPath = getDocPathForSlug(slug);
  const hasManual = docPath ? hasDocPagePath(docPath) : false;
  const docFrontmatter = docPath ? getDocFrontmatter(docPath) : null;

  // Build sidebar for cross-module navigation
  const sidebar = buildSidebar('modules');

  // Fetch Shopify product
  const {product, shop} = await fetchShopifyProduct(
    context,
    handle,
    selectedOptions,
    slugEntry.shopifyGid,
  );

  const hasShopifyProduct = Boolean(product?.id);
  if (!hasShopifyProduct && !isLegacy) {
    return null;
  }

  const resolvedProduct = mergeLegacyProductData(
    hasShopifyProduct ? product : buildFallbackModuleProduct(slugEntry, lzxModule),
    slugEntry.canonical,
  );
  const resolvedShop = hasShopifyProduct ? shop : buildFallbackShop(request);

  return {
    slug: slugEntry.canonical,
    slugEntry,
    product: resolvedProduct,
    hasShopifyProduct,
    isLegacy,
    shop: resolvedShop,
    lzxModule,
    docFrontmatter,
    hasManual,
    patches,
    videos,
    connectors,
    controls,
    features,
    assets,
    archiveAssets,
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
    slugEntry.shopifyGid,
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
  const assets = mergeLegacyAssets(
    moduleId ? getModuleAssets(moduleId) : [],
    slugEntry.canonical,
  );
  const archiveAssets =
    getLfsProductContentBySlug(slugEntry.canonical)?.archiveAssets.filter(
      (asset) => !asset.isDownload,
    ) ?? [];

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
    product: mergeLegacyProductData(product, slugEntry.canonical),
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
    archiveAssets,
    sidebar,
    docPages,
  };
}
