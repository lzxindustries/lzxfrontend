import {
  Await,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import type {
  SeoConfig,
  ShopifyAnalyticsProduct,
  Storefront,
} from '@shopify/hydrogen';
import {
  AnalyticsPageType,
  getSeoMeta,
  Money,
  ShopPayButton,
  VariantSelector,
} from '@shopify/hydrogen';
import type {
  ProductConnection,
  Product as ProductType,
  ProductVariant,
  SelectedOptionInput,
} from '@shopify/hydrogen/storefront-api-types';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {defer} from '@shopify/remix-oxygen';
import clsx from 'clsx';
import {Suspense, useEffect, useRef, useState} from 'react';
import {FaHeart, FaRegHeart, FaTruck, FaLock} from 'react-icons/fa';
import invariant from 'tiny-invariant';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Button} from '~/components/Button';
import {Link} from '~/components/Link';
import {ModuleDetails} from '~/components/ModuleDetails';
import {DownloadAssetList} from '~/components/DownloadAssetList';
import {ProductAssetArchive} from '~/components/ProductAssetArchive';
import {ProductSwimlane} from '~/components/ProductSwimlane';
import {Heading, Text} from '~/components/Text';
import {useWishlist} from '~/hooks/useWishlist';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getLfsProductContentBySlug} from '~/data/lfs-product-metadata';
import {getProductRecord, hasProductRecord} from '~/data/product-catalog';
import {getLfsAssetEntry} from '~/data/lfs-assets';
import {getCommerceByHandle} from '~/data/shopify-live.server';
import {
  buildHubProductFromLocal,
  buildHubShop,
} from '~/data/hub-product.server';
import {
  getModuleByName,
  getPatchesForModule,
  getVideosForModule,
} from '~/data/lzxdb';
import type {LzxPatch, LzxVideo} from '~/data/lzxdb';
import {seoPayload} from '~/lib/seo.server.js';
import {getProductPurchaseStatus} from '~/lib/product-badges';
import {
  isModuleSlug,
  isInstrumentSlug,
  isSystemSlug,
  getCanonicalSlug,
} from '~/data/product-slugs';

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'Product not found'
      : `${error.status} ${error.data}`
    : error instanceof Error
    ? error.message
    : 'Unknown error';
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <h1 className="text-2xl font-bold mb-4">Error</h1>
      <p>{message}</p>
    </div>
  );
}

function hasContent(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildLegacyMediaNodes(slug: string) {
  const legacyContent = getLfsProductContentBySlug(slug);
  if (!legacyContent) return [];

  return legacyContent.galleryImages.map((image, index) => ({
    id: `lfs-product-media:${slug}:${index}`,
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

function mergeLegacyProductData(
  product: ProductType & {selectedVariant?: ProductVariant},
  slug: string,
) {
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

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  // Redirect module/instrument products to their hub pages
  const canonical = getCanonicalSlug(productHandle);
  if (canonical && isModuleSlug(productHandle)) {
    const url = new URL(request.url);
    throw new Response(null, {
      status: 301,
      headers: {
        Location: `/modules/${canonical}${url.search}`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }
  if (canonical && isSystemSlug(productHandle) && !hasProductRecord(productHandle)) {
    // Only bounce canonical system slugs that aren't themselves a
    // Shopify product handle. System product handles (e.g.
    // "double-vision-system") ARE the final destination for
    // `/systems/:slug` redirects, so routing them back here would
    // create an infinite /systems/ <-> /products/ redirect loop.
    const url = new URL(request.url);
    throw new Response(null, {
      status: 301,
      headers: {
        Location: `/systems/${canonical}${url.search}`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }
  if (canonical && isInstrumentSlug(productHandle)) {
    const url = new URL(request.url);
    throw new Response(null, {
      status: 301,
      headers: {
        Location: `/instruments/${canonical}${url.search}`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const shop = buildHubShop(request);
  const record = getProductRecord(productHandle);
  const lfs = getLfsAssetEntry(productHandle);
  const legacyContent = getLfsProductContentBySlug(productHandle);

  let product: ProductType & {selectedVariant?: ProductVariant};
  if (record) {
    const commerce = await getCommerceByHandle(
      context.storefront,
      productHandle,
    );
    product = buildHubProductFromLocal({
      record,
      commerce,
      lfs,
      selectedOptions,
    });
  } else if (legacyContent) {
    // No entry in the local catalog, but we still have legacy LFS
    // content (typically discontinued accessories). Synthesize a
    // minimal product so the rest of the page can render — the merge
    // step below populates media/description/metafields from LFS.
    product = {
      id: `lfs-product:${productHandle}`,
      title: legacyContent.name,
      vendor: 'LZX Industries',
      handle: productHandle,
      descriptionHtml: '',
      description: '',
      options: [],
      media: {nodes: []},
      variants: {nodes: []},
      seo: {title: legacyContent.name, description: ''},
      metafields: [],
    } as unknown as ProductType & {selectedVariant?: ProductVariant};
  } else {
    throw new Response('product', {status: 404});
  }

  const resolvedProduct = mergeLegacyProductData(product, productHandle);

  const recommended = getRecommendedProducts(context.storefront, resolvedProduct.id);
  const firstVariant = resolvedProduct.variants.nodes[0];
  const selectedVariant = resolvedProduct.selectedVariant ?? firstVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: resolvedProduct.id,
    variantGid: selectedVariant?.id ?? '',
    name: resolvedProduct.title,
    variantName: selectedVariant?.title ?? 'Default',
    brand: resolvedProduct.vendor,
    price: selectedVariant?.price?.amount ?? '0',
  };

  const seo = seoPayload.product({
    product: resolvedProduct, // Note: there is a field in this value for seo title and description that is getting pulled from Shopify. Any SEO updates need to be made there.
    selectedVariant,
    url: request.url,
  });

  // Look up related patches and videos from the local DB
  const lzxModule = getModuleByName(resolvedProduct.title);
  const relatedPatches = lzxModule ? getPatchesForModule(lzxModule.id) : [];
  const relatedVideos = lzxModule ? getVideosForModule(lzxModule.id) : [];

  return defer({
    product: resolvedProduct,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    relatedPatches,
    relatedVideos,
    legacyDownloads: legacyContent?.downloads ?? [],
    archiveAssets:
      legacyContent?.archiveAssets.filter((asset) => !asset.isDownload) ?? [],
    legacyExternalUrl: legacyContent?.externalUrl ?? null,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: resolvedProduct.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant?.price?.amount ?? '0'),
    },
    seo,
  });
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function Product() {
  const {
    product,
    recommended,
    relatedPatches,
    relatedVideos,
    legacyDownloads,
    archiveAssets,
    legacyExternalUrl,
  } =
    useLoaderData<typeof loader>();

  return (
    <div className="pb-16 md:pb-0">
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Products', to: '/catalog'},
          {label: product.title},
        ]}
      />
      <ModuleDetails product={product}>
        <>
          <ProductForm />
          {legacyExternalUrl ? (
            <a
              href={legacyExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm mt-2"
            >
              Documentation &rarr;
            </a>
          ) : null}
        </>
      </ModuleDetails>

      {legacyDownloads.length > 0 ? (
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <Heading as="h2" className="mb-4">
            Downloads
          </Heading>
          <DownloadAssetList assets={legacyDownloads} />
        </div>
      ) : null}

      {archiveAssets.length > 0 ? (
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <ProductAssetArchive assets={archiveAssets} />
        </div>
      ) : null}

      {/* Related patches and videos from the LZX database */}
      {(relatedPatches.length > 0 || relatedVideos.length > 0) && (
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
          {relatedPatches.length > 0 && (
            <div className="mb-10">
              <Heading as="h2" className="mb-4">
                Patches Using {product.title}
              </Heading>
              <ul className="flex flex-wrap gap-3">
                {(relatedPatches as LzxPatch[]).map((p) => (
                  <li key={p.id}>
                    <a
                      href={`/patches/${p.slug}`}
                      className="btn btn-outline btn-sm"
                    >
                      {p.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {relatedVideos.length > 0 && (
            <div>
              <Heading as="h2" className="mb-4">
                Videos Featuring {product.title}
              </Heading>
              <ul className="flex flex-wrap gap-3">
                {(relatedVideos as LzxVideo[]).map((v) => (
                  <li key={v.id}>
                    <a
                      href={`https://www.youtube.com/watch?v=${v.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      {v.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Suspense>
        <Await resolve={recommended}>
          {(products) =>
            products && products.length > 0 ? (
              <ProductSwimlane title="You May Also Like" products={products} />
            ) : null
          }
        </Await>
      </Suspense>
    </div>
  );
}

export function ProductForm() {
  const {product, analytics, storeDomain} = useLoaderData<typeof loader>();

  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;
  const purchaseStatus = getProductPurchaseStatus({
    productId: product.id,
    variant: selectedVariant,
  });
  const {isOutOfStock, isPreorder, isBackorder, buttonLabel, shippingLabel} =
    purchaseStatus;
  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics: ShopifyAnalyticsProduct = {
    ...analytics.products[0],
    quantity: 1,
  };

  const [quantity, setQuantity] = useState(1);

  // Sticky mobile bar: track when the main CTA scrolls out of view
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      {threshold: 0},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showLowStock = purchaseStatus.isLowStock;

  return (
    <>
      <div className="grid gap-3">
        {/* Variant Selector — pill buttons */}
        <VariantSelector
          handle={product.handle}
          options={product.options}
          variants={product.variants}
          selectedVariant={selectedVariant}
        >
          {({option}) =>
            option.name === 'Title' ? null : (
              <div key={option.name} className="flex flex-col gap-2">
                <Heading as="legend" size="lead" className="min-w-[4rem]">
                  {option.name}
                </Heading>
                <div className="flex flex-wrap gap-2">
                  {option.values.map(
                    ({value, isAvailable, isActive, to, variant}) => {
                      const variantStatus = getProductPurchaseStatus({
                        productId: product.id,
                        variant,
                        isAvailable,
                      });
                      const isSoldOut = variantStatus.isOutOfStock;
                      const availabilityLabel = variantStatus.availabilityLabel;

                      return (
                        <Link
                          key={option.name + value}
                          to={to}
                          preventScrollReset
                          prefetch="intent"
                          replace
                          className={clsx(
                            'flex min-h-[56px] min-w-[8rem] flex-col justify-center rounded-2xl border px-4 py-2 text-left transition-all duration-200',
                            isActive && !isSoldOut &&
                              'border-black bg-black text-white shadow-sm ring-2 ring-black ring-offset-2',
                            isActive &&
                              isSoldOut &&
                              'border-black bg-white text-primary shadow-sm ring-2 ring-black ring-offset-2',
                            !isActive &&
                              !isSoldOut &&
                              'border-primary/20 bg-white text-primary hover:border-primary/60 hover:bg-primary/[0.03]',
                            !isActive &&
                              isSoldOut &&
                              'border-primary/15 bg-primary/[0.03] text-primary/55 hover:border-primary/30',
                          )}
                        >
                          <span className="text-sm font-semibold leading-tight">
                            {value}
                          </span>
                          <span
                            className={clsx(
                              'mt-1 text-[11px] uppercase tracking-[0.14em]',
                              isActive && !isSoldOut
                                ? 'text-white/70'
                                : isSoldOut
                                ? 'text-primary/45'
                                : 'text-primary/55',
                            )}
                          >
                            {availabilityLabel}
                          </span>
                        </Link>
                      );
                    },
                  )}
                </div>
              </div>
            )}
        </VariantSelector>

        {/* Quantity selector */}
        {selectedVariant && !isOutOfStock && (
          <div className="flex items-center gap-3">
            <label htmlFor="quantity" className="text-sm font-medium">
              Qty
            </label>
            <div className="flex items-center border rounded">
              <button
                type="button"
                className="w-10 h-10 transition text-primary/50 hover:text-primary disabled:text-primary/10"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                &#8722;
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-12 text-center bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Quantity"
              />
              <button
                type="button"
                className="w-10 h-10 transition text-primary/50 hover:text-primary"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                &#43;
              </button>
            </div>
          </div>
        )}

        {/* Low stock warning */}
        {showLowStock && (
          <div className="px-3 py-2 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 text-sm font-medium">
            Only {selectedVariant!.quantityAvailable} left in stock
          </div>
        )}

        {/* Action buttons + status messages */}
        <div ref={ctaRef} className="grid gap-2">
          {selectedVariant && (
            <>
              {isOutOfStock ? (
                <Button variant="secondary" disabled>
                  <Text>Sold Out</Text>
                </Button>
              ) : (
                <AddToCartButton
                  lines={[
                    {
                      merchandiseId: selectedVariant.id,
                      quantity,
                    },
                  ]}
                  variant="primary"
                  className="!rounded"
                  data-test="add-to-cart"
                  analytics={{
                    products: [productAnalytics],
                    totalValue: parseFloat(productAnalytics.price),
                  }}
                >
                  <Text
                    as="span"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>{buttonLabel}</span> <span>·</span>{' '}
                    <Money
                      withoutTrailingZeros
                      data={selectedVariant.price!}
                      as="span"
                    />
                  </Text>
                </AddToCartButton>
              )}

              {/* Status message */}
              {!isOutOfStock && (
                <ShopPayButton
                  width="100%"
                  variantIds={[selectedVariant.id!]}
                  storeDomain={storeDomain}
                />
              )}

              <WishlistButton
                handle={product.handle}
                title={product.title}
                variantId={selectedVariant.id ?? ''}
                image={selectedVariant.image?.url}
                price={selectedVariant.price?.amount}
              />
            </>
          )}
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-primary/10 text-xs text-primary/60">
          {!isOutOfStock && (
            <Link
              to="/policies/shipping-policy"
              className="flex items-center gap-1.5 hover:text-primary transition"
            >
              <FaTruck className="text-sm" />
              <span>
                {shippingLabel}
              </span>
            </Link>
          )}
          <span className="flex items-center gap-1.5">
            <FaLock className="text-sm" />
            <span>Secure Checkout</span>
          </span>
        </div>
      </div>

      {/* Sticky mobile Add to Cart bar */}
      {selectedVariant && !isOutOfStock && showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] px-4 py-3 md:hidden">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">
                {product.title}
              </div>
              <Money
                withoutTrailingZeros
                data={selectedVariant.price!}
                as="div"
                className="text-sm font-bold"
              />
            </div>
            <AddToCartButton
              lines={[{merchandiseId: selectedVariant.id, quantity}]}
              variant="primary"
              className="!rounded"
              width="auto"
              analytics={{
                products: [productAnalytics],
                totalValue: parseFloat(productAnalytics.price),
              }}
            >
              <Text as="span" className="text-sm whitespace-nowrap">
                {buttonLabel}
              </Text>
            </AddToCartButton>
          </div>
        </div>
      )}
    </>
  );
}

function WishlistButton({
  handle,
  title,
  variantId,
  image,
  price,
}: {
  handle: string;
  title: string;
  variantId: string;
  image?: string;
  price?: string;
}) {
  const {isInWishlist, toggleItem} = useWishlist();
  const saved = isInWishlist(handle);

  return (
    <button
      type="button"
      onClick={() =>
        toggleItem({
          handle,
          title,
          variantId,
          image,
          price,
          addedAt: new Date().toISOString(),
        })
      }
      className={`flex items-center justify-center gap-2 w-full py-2 border rounded transition ${
        saved
          ? 'border-red-300 text-red-500 bg-red-50'
          : 'border-primary/20 text-primary/60 hover:text-primary hover:border-primary/40'
      }`}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      {saved ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
      <span className="text-sm">{saved ? 'Saved' : 'Save for Later'}</span>
    </button>
  );
}

// function ProductDetail({
//   title,
//   content,
//   learnMore,
// }: {
//   title: string;
//   content: string;
//   learnMore?: string;
// }) {
//   return (
//     <Disclosure key={title} as="div" className="grid w-full gap-2">
//       {({ open }) => (
//         <>
//           <Disclosure.Button className="text-left">
//             <div className="flex justify-between">
//               <Text size="lead" as="h4">
//                 {title}
//               </Text>
//               <IconClose
//                 className={clsx(
//                   'transition-transform transform-gpu duration-200',
//                   !open && 'rotate-[45deg]',
//                 )}
//               />
//             </div>
//           </Disclosure.Button>

//           <Disclosure.Panel className={'pb-4 pt-2 grid gap-2'}>
//             <div
//               className="prose dark:prose-invert"
//               dangerouslySetInnerHTML={{ __html: content }}
//             />
//             {learnMore && (
//               <div className="">
//                 <Link
//                   className="pb-px border-b border-primary/30 text-primary/50"
//                   to={learnMore}
//                 >
//                   Learn more
//                 </Link>
//               </div>
//             )}
//           </Disclosure.Panel>
//         </>
//       )}
//     </Disclosure>
//   );
// }

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query productRecommendations(
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

export async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
): Promise<ProductType[]> {
  let products: {
    recommended: ProductType[] | null;
    additional: ProductConnection | null;
  } | null = null;

  try {
    products = await storefront.query<{
      recommended: ProductType[] | null;
      additional: ProductConnection | null;
    }>(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {productId, count: 12},
    });
  } catch {
    // Shopify Storefront queries can fail for obscure SKUs (e.g. hidden or
    // deleted recommendations). Swallow the error so the product page still
    // renders — the recommended swimlane simply shows nothing.
    return [];
  }

  const recommended = products?.recommended ?? [];
  const additional = products?.additional?.nodes ?? [];

  const mergedProducts: ProductType[] = recommended
    .concat(additional)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item: ProductType) => item.id)
    .indexOf(productId);

  if (originalProduct !== -1) {
    mergedProducts.splice(originalProduct, 1);
  }

  return mergedProducts;
}
