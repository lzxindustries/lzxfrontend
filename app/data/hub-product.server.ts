/**
 * Synthesizes a Shopify Storefront-API-shaped `Product` from local data
 * (ProductRecord + LfsAssetEntry) plus a live commerce snippet
 * (price/stock/availableForSale).
 *
 * This is the bridge that lets every existing route consumer (which
 * expects a Hydrogen `ProductType`) keep working while we route content
 * through the local catalog and commerce through `getCommerceByHandles`.
 *
 * Pricing and availability MUST come from the `commerce` argument — they
 * are never sourced from the local catalog.
 */

import type {
  Product as ProductType,
  ProductVariant,
  Shop,
} from '@shopify/hydrogen/storefront-api-types';

import type {ProductRecord, ProductVariantRecord} from './product-catalog';
import type {LfsAssetEntry} from './lfs-assets';
import type {
  CommerceSnippet,
  CommerceVariantSnippet,
  MoneyAmount,
} from './shopify-live.server';

const FALLBACK_CURRENCY = 'USD';
const ZERO_MONEY: MoneyAmount = {
  amount: '0.00',
  currencyCode: FALLBACK_CURRENCY,
};

function hasContent(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildMediaNodes(record: ProductRecord, lfs: LfsAssetEntry | null) {
  // Prefer lfs gallery (served from /assets/products/...) and fall back
  // to whatever Shopify-mirror URLs the bootstrap captured.
  const lfsNodes = (lfs?.gallery ?? []).map((item, index) => ({
    id: `lfs-media:${record.handle}:${index}`,
    alt: record.title,
    mediaContentType: 'IMAGE' as const,
    image: {
      id: `lfs-image:${record.handle}:${index}`,
      url: item.publicPath,
      altText: record.title,
      width: item.width,
      height: item.height,
    },
    previewImage: {
      url: item.publicPath,
      altText: record.title,
      width: item.width,
      height: item.height,
    },
  }));

  if (lfsNodes.length > 0) return lfsNodes;

  return record.gallery
    .filter((item) => item.shopifyUrl)
    .map((item, index) => ({
      id: `catalog-media:${record.handle}:${index}`,
      alt: item.alt || record.title,
      mediaContentType: (item.type || 'image').toUpperCase() as 'IMAGE',
      image: {
        id: `catalog-image:${record.handle}:${index}`,
        url: item.shopifyUrl as string,
        altText: item.alt || record.title,
        width: item.width,
        height: item.height,
      },
      previewImage: {
        url: item.shopifyUrl as string,
        altText: item.alt || record.title,
        width: item.width,
        height: item.height,
      },
    }));
}

function variantNodeFromCommerceSnippet(
  recordVariant: ProductVariantRecord,
  commerce: CommerceVariantSnippet | null,
  fallbackImage: {
    url: string;
    altText: string;
    width: number | null;
    height: number | null;
  } | null,
  productTitle: string,
  productHandle: string,
) {
  const price = commerce?.price ?? ZERO_MONEY;
  const compareAtPrice = commerce?.compareAtPrice ?? null;

  return {
    id: recordVariant.shopifyVariantId,
    availableForSale: commerce?.availableForSale ?? false,
    quantityAvailable: commerce?.quantityAvailable ?? null,
    selectedOptions: recordVariant.selectedOptions,
    image: fallbackImage
      ? {
          id: `variant-image:${recordVariant.shopifyVariantId}`,
          url: fallbackImage.url,
          altText: fallbackImage.altText,
          width: fallbackImage.width,
          height: fallbackImage.height,
        }
      : null,
    price,
    compareAtPrice,
    sku: recordVariant.sku,
    title: recordVariant.title,
    unitPrice: null,
    product: {
      title: productTitle,
      handle: productHandle,
    },
  };
}

function flattenMetafields(record: ProductRecord) {
  return Object.entries(record.metafields).map(([key, mf]) => {
    const [namespace, fieldKey] = key.split(':');
    return {
      namespace,
      key: fieldKey,
      value: mf.value,
      type: mf.type,
    };
  });
}

function pickSelectedVariant(
  variants: ReturnType<typeof variantNodeFromCommerceSnippet>[],
  selectedOptions: {name: string; value: string}[],
): ReturnType<typeof variantNodeFromCommerceSnippet> | null {
  if (variants.length === 0) return null;
  if (selectedOptions.length === 0) return variants[0];

  for (const variant of variants) {
    const matches = selectedOptions.every((opt) =>
      variant.selectedOptions.some(
        (vo) => vo.name === opt.name && vo.value === opt.value,
      ),
    );
    if (matches) return variant;
  }
  return variants[0];
}

export interface BuildHubProductInput {
  record: ProductRecord;
  commerce: CommerceSnippet | null;
  lfs: LfsAssetEntry | null;
  selectedOptions: {name: string; value: string}[];
}

/**
 * Returns a Storefront-API-shaped ProductType built entirely from local
 * data + the live commerce snippet. The shape matches what the legacy
 * `HUB_PRODUCT_QUERY` returned closely enough for every current route
 * consumer.
 */
export function buildHubProductFromLocal(
  input: BuildHubProductInput,
): ProductType & {selectedVariant?: ProductVariant} {
  const {record, commerce, lfs, selectedOptions} = input;
  const mediaNodes = buildMediaNodes(record, lfs);
  const descriptionHtml =
    commerce && hasContent(commerce.descriptionHtml)
      ? commerce.descriptionHtml
      : record.descriptionHtml;
  const description =
    commerce && hasContent(commerce.description)
      ? commerce.description
      : record.descriptionPlain;
  const fallbackImage = mediaNodes[0]?.image
    ? {
        url: mediaNodes[0].image.url,
        altText: mediaNodes[0].image.altText ?? record.title,
        width: mediaNodes[0].image.width ?? null,
        height: mediaNodes[0].image.height ?? null,
      }
    : null;

  const commerceByVariantId = new Map<string, CommerceVariantSnippet>();
  for (const variant of commerce?.variants ?? []) {
    commerceByVariantId.set(variant.variantId, variant);
  }

  const variantNodes = [...record.variants]
    .sort((a, b) => a.position - b.position)
    .map((rv) =>
      variantNodeFromCommerceSnippet(
        rv,
        commerceByVariantId.get(rv.shopifyVariantId) ?? null,
        fallbackImage,
        record.title,
        record.handle,
      ),
    );

  const selectedVariant = pickSelectedVariant(variantNodes, selectedOptions);

  return {
    id: record.shopifyProductId,
    title: record.title,
    vendor: record.vendor,
    handle: record.handle,
    description,
    descriptionHtml,
    productType: record.productType,
    tags: record.tags,
    options: record.options.map((o) => ({
      id: o.id ?? null,
      name: o.name,
      values: o.values,
    })),
    media: {nodes: mediaNodes},
    variants: {nodes: variantNodes},
    selectedVariant,
    seo: {
      title: record.seo?.title ?? record.title,
      description: record.seo?.description ?? description,
    },
    metafields: flattenMetafields(record),
  } as unknown as ProductType & {selectedVariant?: ProductVariant};
}

/**
 * Stub `Shop` object built from request origin. Replaces the
 * Shopify `shop { ... }` selection in the old hub query — we no longer
 * surface Shopify shipping/refund policy bodies via this loader.
 */
export function buildHubShop(request: Request): Shop {
  const url = new URL(request.url);
  return {
    name: 'LZX Industries',
    primaryDomain: {url: url.origin},
    shippingPolicy: null,
    refundPolicy: null,
  } as Shop;
}
