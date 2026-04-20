import {flattenConnection, Image, useMoney} from '@shopify/hydrogen';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Link} from '~/components/Link';
import {Text} from '~/components/Text';
import {getProductPlaceholder} from '~/lib/placeholders';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {resolveProductUrl} from '~/data/product-slugs';
import {getSlugEntry} from '~/data/product-slugs';

export function ProductCardBackgroundSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 18">
      <defs>
        <pattern id="Pattern" x="0" y="0" width=".25" height=".25">
          <path d="M61.82 18c3.47-1.45 6.86-3.78 11.3-7.34C78 6.76 80.34 5.1 83.87 3.42 88.56 1.16 93.75 0 100 0v6.16C98.76 6.05 97.43 6 96 6c-9.59 0-14.23 2.23-23.13 9.34-1.28 1.03-2.39 1.9-3.4 2.66h-7.65zm-23.64 0H22.52c-1-.76-2.1-1.63-3.4-2.66C11.57 9.3 7.08 6.78 0 6.16V0c6.25 0 11.44 1.16 16.14 3.42 3.53 1.7 5.87 3.35 10.73 7.24 4.45 3.56 7.84 5.9 11.31 7.34zM61.82 0h7.66a39.57 39.57 0 0 1-7.34 4.58C57.44 6.84 52.25 8 46 8S34.56 6.84 29.86 4.58A39.57 39.57 0 0 1 22.52 0h15.66C41.65 1.44 45.21 2 50 2c4.8 0 8.35-.56 11.82-2z" />
        </pattern>
      </defs>

      <rect fill="url(#Pattern)" stroke="black" width="100" height="18" />
    </svg>
  );
}

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: Product;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  const handleOnClick = () => {
    if (onClick) {
      onClick();
    }
  };

  let cardLabel;

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();

  const variants = flattenConnection(cardProduct?.variants);
  const firstVariant = variants.length ? variants[0] : null;

  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} = useMoney(
    firstVariant?.price || {amount: '0', currencyCode: 'USD'},
  );

  if (!cardProduct?.variants?.nodes?.length) return null;

  if (!firstVariant) return null;

  const {image, price, compareAtPrice} = firstVariant;
  const subtitle =
    (
      product as Product & {
        subtitle?: {value?: string | null} | null;
      }
    ).subtitle?.value ?? '';
  const slugEntry = getSlugEntry(product.handle);
  const isLegacy = !!slugEntry?.isHidden;
  const lifecycleLabel = isLegacy ? 'Legacy' : slugEntry ? 'Active' : null;
  const productTypeLabel =
    slugEntry?.hubType === 'instrument'
      ? 'Instrument'
      : slugEntry?.hubType === 'module'
      ? 'Module'
      : null;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  return (
    <div className="flex flex-col gap-2" data-testid="product-card">
      <Link
        onClick={handleOnClick}
        to={resolveProductUrl(product.handle)}
        prefetch="intent"
        className="relative"
      >
        <div className={clsx('grid gap-4', className)}>
          <div className="card-image aspect-square bg-primary/5 relative">
            {firstVariant?.quantityAvailable != null &&
              firstVariant.quantityAvailable > 0 && (
                <div className="absolute top-2 right-2 z-10 bg-green-600 text-white text-xs font-normal px-2 py-1 rounded">
                  Ready to Ship
                </div>
              )}
            {cardLabel ? (
              <div className="absolute top-2 left-2 z-10 bg-primary text-primary-content text-xs font-normal px-2 py-1 rounded">
                {cardLabel}
              </div>
            ) : null}
            {image && (
              <Image
                data={image}
                alt={`${product.title} product`}
                className="inset-0 w-full h-full object-cover"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            )}
          </div>
          <div className="grid gap-1">
            <Text
              className="w-full font-semibold text-center overflow-hidden whitespace-nowrap text-ellipsis top-0"
              as="p"
              size="copy"
            >
              {product.title}
            </Text>
            {subtitle ? (
              <Text
                className="w-full text-center overflow-hidden whitespace-nowrap text-ellipsis text-xs opacity-70"
                as="p"
                size="copy"
              >
                {subtitle}
              </Text>
            ) : null}
            {productTypeLabel ? (
              <div className="flex justify-center gap-1 mt-1 flex-wrap">
                {lifecycleLabel ? (
                  <span
                    className={clsx(
                      'badge badge-xs',
                      isLegacy ? 'badge-ghost' : 'badge-primary',
                    )}
                  >
                    {lifecycleLabel}
                  </span>
                ) : null}
                <span className="badge badge-outline badge-xs">
                  {productTypeLabel}
                </span>
              </div>
            ) : null}
            <Text
              className="w-full font-medium text-center overflow-hidden whitespace-nowrap text-ellipsis top-0 mt-0 pt-0"
              as="p"
              size="copy"
            >
              {currencyNarrowSymbol}
              {withoutTrailingZerosAndCurrency}
            </Text>
          </div>
        </div>
      </Link>
      {quickAdd && (
        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
            },
          ]}
          variant="secondary"
          className="mt-2"
        >
          <Text as="span" className="flex items-center justify-center gap-2">
            Add to Bag
          </Text>
        </AddToCartButton>
      )}
    </div>
  );
}

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
