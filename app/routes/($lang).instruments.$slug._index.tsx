import {Await, Link, useFetcher, useOutletContext} from '@remix-run/react';
import {Money, ShopPayButton, VariantSelector} from '@shopify/hydrogen';
import type {
  ExternalVideo,
  MediaImage,
  Product,
  ProductVariant,
  Metafield,
} from '@shopify/hydrogen/storefront-api-types';
import type {MetaArgs} from '@shopify/remix-oxygen';
import clsx from 'clsx';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {FaHeart, FaRegHeart, FaTruck, FaLock} from 'react-icons/fa';

import {AddToCartButton} from '~/components/AddToCartButton';
import {Button} from '~/components/Button';
import {Heading, Text} from '~/components/Text';
import {ProductSwimlane} from '~/components/ProductSwimlane';
import {useWishlist} from '~/hooks/useWishlist';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';
import ProductMediaGallery, {
  type MediaGalleryItem,
  MediaGalleryItemType,
} from '~/components/ProductMediaGallery';
import {
  QuickStartPreview,
  QUICK_START_STEPS,
} from '~/components/QuickStartPreview';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('instruments.$slug'))
    ?.data as InstrumentLayoutLoaderData | undefined;
  if (!parentData) return [];
  const product = parentData.product as unknown as Product;
  const title = product?.seo?.title ?? product?.title ?? '';
  const description = product?.seo?.description ?? product?.description ?? '';
  const image =
    (product as any)?.selectedVariant?.image?.url ??
    product?.variants?.nodes?.[0]?.image?.url;
  return [
    {title: `${title} | LZX Industries`},
    ...(description ? [{name: 'description', content: description}] : []),
    ...(title ? [{property: 'og:title', content: title}] : []),
    ...(description
      ? [{property: 'og:description', content: description}]
      : []),
    ...(image ? [{property: 'og:image', content: image}] : []),
  ];
};

// --- Gallery helpers ---

const normalizeForMatch = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getKeywordRank = (value: string, keywords: string[]): number => {
  const normalized = normalizeForMatch(value);
  for (let i = 0; i < keywords.length; i++) {
    if (normalized.includes(keywords[i]!)) return keywords.length - i;
  }
  return 0;
};

function getGalleryMedia(product: Product): MediaGalleryItem[] {
  const items: MediaGalleryItem[] = [];
  const seenYoutubeIds = new Set<string>();

  for (const [index, item] of product.media.nodes.entries()) {
    if (item.mediaContentType === 'IMAGE') {
      const img = item as MediaImage;
      if (!img.image) continue;
      items.push({
        name: (item.alt ?? '').trim() || `Image ${index + 1}`,
        src: img.image.url,
        type: MediaGalleryItemType.IMAGE,
      });
    } else if (item.mediaContentType === 'EXTERNAL_VIDEO') {
      const vid = item as ExternalVideo;
      const ytId = vid.embedUrl?.split('/').filter(Boolean).pop();
      if (!ytId || seenYoutubeIds.has(ytId)) continue;
      seenYoutubeIds.add(ytId);
      items.push({
        name: (item.alt ?? '').trim() || `Video ${index + 1}`,
        src: vid.embedUrl,
        type: MediaGalleryItemType.VIDEO,
      });
    }
  }

  // Videomancer-specific deterministic sort
  if (product.handle === 'videomancer' && items.length > 1) {
    const imagePriority = [
      'hero',
      'front panel',
      'front',
      'main',
      'beauty',
      'product',
      'angle',
    ];
    const videoPriority = [
      'overview',
      'intro',
      'trailer',
      'demo',
      'walkthrough',
      'performance',
    ];

    const withMeta = items.map((item, i) => ({
      item,
      originalIndex: i,
      rank:
        item.type === MediaGalleryItemType.IMAGE
          ? getKeywordRank(`${item.name} ${item.src}`, imagePriority)
          : getKeywordRank(`${item.name} ${item.src}`, videoPriority),
    }));

    const images = withMeta.filter(
      (e) => e.item.type === MediaGalleryItemType.IMAGE,
    );
    const videos = withMeta.filter(
      (e) => e.item.type === MediaGalleryItemType.VIDEO,
    );

    const heroImage = [...images].sort(
      (a, b) => b.rank - a.rank || a.originalIndex - b.originalIndex,
    )[0];
    const priorityVideo = [...videos].sort(
      (a, b) => b.rank - a.rank || a.originalIndex - b.originalIndex,
    )[0];

    const remainingVideos = videos
      .filter((e) => e !== priorityVideo)
      .sort((a, b) => b.rank - a.rank || a.originalIndex - b.originalIndex)
      .map((e) => e.item);
    const remainingImages = images
      .filter((e) => e !== heroImage)
      .sort((a, b) => b.rank - a.rank || a.originalIndex - b.originalIndex)
      .map((e) => e.item);

    const ordered: MediaGalleryItem[] = [];
    if (heroImage) ordered.push(heroImage.item);
    if (priorityVideo) ordered.push(priorityVideo.item);
    ordered.push(...remainingVideos, ...remainingImages);
    if (ordered.length > 0) return ordered;
  }

  return items;
}

function rewriteLegacyDocsLinks(html: string): string {
  let rewritten = html;
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net\/docs\/category\/program-guides/gi,
    '/instruments/videomancer/manual/programs',
  );
  rewritten = rewritten.replace(
    /https?:\/\/lzxindustries\.net\/docs\/docs\/category\/program-guides/gi,
    '/instruments/videomancer/manual/programs',
  );
  rewritten = rewritten.replace(
    /https?:\/\/lzxindustries\.net\/docs\/docs\/instruments\/([^"'\s<]*)/gi,
    '/instruments/$1/manual',
  );
  rewritten = rewritten.replace(
    /https?:\/\/lzxindustries\.net\/docs\/docs\/modules\/([^"'\s<]*)/gi,
    '/modules/$1/manual',
  );
  rewritten = rewritten.replace(
    /https?:\/\/lzxindustries\.net\/docs\/docs\/(?!instruments\/|modules\/)([^"'\s<]*)/gi,
    '/docs/$1',
  );
  rewritten = rewritten.replace(
    /https?:\/\/docs\.lzxindustries\.net(\/docs\/[^"'\s<]*)/gi,
    '$1',
  );
  rewritten = rewritten.replace(
    /(href=["'])\/docs\/category\/[^"']+(["'])/gi,
    '$1/docs$2',
  );
  rewritten = rewritten.replace(
    /(href=["'])\/docs\/docs\/instruments\/([^"']+)(["'])/gi,
    '$1/instruments/$2/manual$3',
  );
  rewritten = rewritten.replace(
    /(href=["'])\/docs\/docs\/modules\/([^"']+)(["'])/gi,
    '$1/modules/$2/manual$3',
  );
  rewritten = rewritten.replace(
    /(href=["'])\/docs\/docs\/([^"']+)(["'])/gi,
    '$1/docs/$2$3',
  );
  return rewritten;
}

// --- Component ---

export default function InstrumentOverview() {
  const data = useOutletContext<InstrumentLayoutLoaderData>();
  const {product, shop, slugEntry, hasManual} =
    data as unknown as InstrumentHubData;
  const recommended = (data as any).recommended;
  const storeDomain = shop.primaryDomain.url;

  const media = useMemo(() => getGalleryMedia(product as Product), [product]);

  const metafields = (product as any).metafields as
    | (Metafield | null)[]
    | undefined;

  const sections: {title: string; content: string; defaultOpen?: boolean}[] =
    [];
  if (product.descriptionHtml) {
    sections.push({
      title: 'Description',
      content: rewriteLegacyDocsLinks(product.descriptionHtml),
      defaultOpen: true,
    });
  }

  return (
    <div className="pb-16 md:pb-0">
      <div className="flex flex-wrap flex-row justify-center p-0 m-0">
        <ProductMediaGallery media={media} />
        <div className="basis-[100%] md:basis-1/2 md:h-screen hiddenScroll md:overflow-y-scroll">
          <div className="flex flex-col gap-3 px-6 pt-4 pb-4">
            <h1 className="font-sans font-bold text-3xl md:text-4xl uppercase">
              {product.title}
            </h1>
            {slugEntry.isHidden ? (
              <div className="badge badge-warning badge-lg">Discontinued</div>
            ) : (
              <ProductForm
                product={
                  product as Product & {selectedVariant?: ProductVariant}
                }
                storeDomain={storeDomain}
              />
            )}
            {hasManual && (
              <Link
                to={`/instruments/${slugEntry.canonical}/manual`}
                className="btn btn-outline btn-sm mt-2"
              >
                Read Full Docs &rarr;
              </Link>
            )}
          </div>

          {/* Quick Start Preview */}
          {QUICK_START_STEPS[slugEntry.canonical] && hasManual && (
            <div className="px-6 pt-4">
              <QuickStartPreview
                steps={QUICK_START_STEPS[slugEntry.canonical]!}
                manualUrl={`/instruments/${slugEntry.canonical}/manual/quick-start`}
                productTitle={product.title}
              />
            </div>
          )}

          {sections.length > 0 && (
            <div className="border-t border-primary/10 px-6">
              {sections.map((section) => (
                <Disclosure
                  key={section.title}
                  defaultOpen={section.defaultOpen}
                >
                  {({open}) => (
                    <div className="border-b border-primary/10">
                      <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left">
                        <span className="text-base font-semibold uppercase tracking-wide">
                          {section.title}
                        </span>
                        <svg
                          className={`h-5 w-5 transition-transform duration-200 ${
                            open ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Disclosure.Button>
                      <Disclosure.Panel className="pb-4">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{__html: section.content}}
                        />
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              ))}
            </div>
          )}
        </div>
      </div>

      <Suspense>
        <Await resolve={recommended}>
          {(products: Product[] | null) =>
            products && products.length > 0 ? (
              <ProductSwimlane title="You May Also Like" products={products} />
            ) : null
          }
        </Await>
      </Suspense>


    </div>
  );
}

// --- ProductForm ---

function ProductForm({
  product,
  storeDomain,
}: {
  product: Product & {selectedVariant?: ProductVariant};
  storeDomain: string;
}) {
  const notifyFetcher = useFetcher<{ok: boolean; message: string}>();
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;
  const isPreorder = product.id === 'gid://shopify/Product/4319674761239';
  const isBackorder =
    (selectedVariant?.quantityAvailable ?? 0) <= 0 && !isPreorder;
  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant.price.amount < selectedVariant.compareAtPrice.amount;

  const [quantity, setQuantity] = useState(1);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry!.isIntersecting),
      {threshold: 0},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const buttonLabel = isOutOfStock
    ? 'Sold Out'
    : isPreorder
    ? 'Preorder Now'
    : isBackorder
    ? 'Backorder Now'
    : 'Add to Cart';

  const showLowStock =
    !isOutOfStock &&
    !isPreorder &&
    !isBackorder &&
    selectedVariant?.quantityAvailable != null &&
    selectedVariant.quantityAvailable > 0 &&
    selectedVariant.quantityAvailable < 5;

  return (
    <>
      <div className="grid gap-3">
        <VariantSelector
          handle={product.handle}
          options={product.options}
          variants={product.variants}
        >
          {({option}) =>
            option.name === 'Title' ? null : (
            <div key={option.name} className="flex flex-col gap-2">
              <Heading as="legend" size="lead" className="min-w-[4rem]">
                {option.name}
              </Heading>
              <div className="flex flex-wrap gap-2">
                {option.values.map(({value, isAvailable, isActive, to}) => (
                  <Link
                    key={option.name + value}
                    to={to}
                    preventScrollReset
                    prefetch="intent"
                    replace
                    className={clsx(
                      'px-4 py-2 text-sm rounded-full border transition-all duration-200 cursor-pointer min-h-[40px] flex items-center',
                      isActive
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-white text-primary border-primary/30 hover:border-primary/60',
                      !isAvailable &&
                        'opacity-40 line-through pointer-events-none',
                    )}
                  >
                    {value}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </VariantSelector>

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

        {showLowStock && (
          <div className="px-3 py-2 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 text-sm font-medium">
            Only {selectedVariant!.quantityAvailable} left in stock
          </div>
        )}

        <div ref={ctaRef} className="grid gap-2">
          {selectedVariant && (
            <>
              {isOutOfStock ? (
                <div className="grid gap-3 rounded-lg border border-base-300 p-3">
                  <Button variant="secondary" disabled>
                    <Text>Sold Out</Text>
                  </Button>
                  <notifyFetcher.Form
                    method="post"
                    action="/api/notify-me"
                    className="grid gap-2"
                  >
                    <input type="hidden" name="handle" value={product.handle} />
                    <input
                      type="hidden"
                      name="variantId"
                      value={selectedVariant.id ?? ''}
                    />
                    <label
                      htmlFor="notify-email-instrument"
                      className="text-xs font-medium text-base-content/70"
                    >
                      Get notified when back in stock
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="notify-email-instrument"
                        type="email"
                        name="email"
                        required
                        placeholder="you@example.com"
                        className="input input-bordered input-sm flex-1"
                      />
                      <button
                        type="submit"
                        className="btn btn-sm btn-primary"
                        disabled={notifyFetcher.state !== 'idle'}
                      >
                        Notify Me
                      </button>
                    </div>
                    {notifyFetcher.data?.message ? (
                      <p
                        className={clsx(
                          'text-xs',
                          notifyFetcher.data.ok ? 'text-success' : 'text-error',
                        )}
                      >
                        {notifyFetcher.data.message}
                      </p>
                    ) : null}
                  </notifyFetcher.Form>
                </div>
              ) : (
                <AddToCartButton
                  lines={[{merchandiseId: selectedVariant.id, quantity}]}
                  variant="primary"
                  className="!rounded"
                  data-test="add-to-cart"
                  analytics={{
                    products: [
                      {
                        productGid: product.id,
                        variantGid: selectedVariant.id ?? '',
                        name: product.title,
                        variantName: selectedVariant.title ?? 'Default',
                        brand: product.vendor,
                        price: selectedVariant.price?.amount ?? '0',
                        quantity: 1,
                      },
                    ],
                    totalValue: parseFloat(
                      selectedVariant.price?.amount ?? '0',
                    ),
                  }}
                >
                  <Text
                    as="span"
                    className="flex items-center justify-center gap-2"
                  >
                    <span>{buttonLabel}</span> <span>&middot;</span>{' '}
                    <Money
                      withoutTrailingZeros
                      data={selectedVariant.price!}
                      as="span"
                    />
                  </Text>
                </AddToCartButton>
              )}
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

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-primary/10 text-xs text-primary/60">
          {!isOutOfStock && (
            <Link
              to="/policies/shipping-policy"
              className="flex items-center gap-1.5 hover:text-primary transition"
            >
              <FaTruck className="text-sm" />
              <span>
                {isPreorder
                  ? 'Ships when available'
                  : isBackorder
                  ? 'Ships in 4-6 weeks'
                  : 'Ships in 24 hours'}
              </span>
            </Link>
          )}
          <span className="flex items-center gap-1.5">
            <FaLock className="text-sm" />
            <span>Secure Checkout</span>
          </span>
        </div>
      </div>

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
                products: [
                  {
                    productGid: product.id,
                    variantGid: selectedVariant.id ?? '',
                    name: product.title,
                    variantName: selectedVariant.title ?? 'Default',
                    brand: product.vendor,
                    price: selectedVariant.price?.amount ?? '0',
                    quantity: 1,
                  },
                ],
                totalValue: parseFloat(selectedVariant.price?.amount ?? '0'),
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
