import clsx from 'clsx';
import {
  flattenConnection,
  Image,
  Money,
  ShopifyAnalyticsProduct,
  useMoney,
} from '@shopify/hydrogen';
import { Text, Link, AddToCartButton } from '~/components';
import { isDiscounted, isNewArrival } from '~/lib/utils';
import { getProductPlaceholder } from '~/lib/placeholders';
import type { MoneyV2, Product } from '@shopify/hydrogen/storefront-api-types';

export function ProductCardBackgroundSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 18">
      <defs>
        <pattern id="Pattern" x="0" y="0" width=".25" height=".25">
          <path d="M61.82 18c3.47-1.45 6.86-3.78 11.3-7.34C78 6.76 80.34 5.1 83.87 3.42 88.56 1.16 93.75 0 100 0v6.16C98.76 6.05 97.43 6 96 6c-9.59 0-14.23 2.23-23.13 9.34-1.28 1.03-2.39 1.9-3.4 2.66h-7.65zm-23.64 0H22.52c-1-.76-2.1-1.63-3.4-2.66C11.57 9.3 7.08 6.78 0 6.16V0c6.25 0 11.44 1.16 16.14 3.42 3.53 1.7 5.87 3.35 10.73 7.24 4.45 3.56 7.84 5.9 11.31 7.34zM61.82 0h7.66a39.57 39.57 0 0 1-7.34 4.58C57.44 6.84 52.25 8 46 8S34.56 6.84 29.86 4.58A39.57 39.57 0 0 1 22.52 0h15.66C41.65 1.44 45.21 2 50 2c4.8 0 8.35-.56 11.82-2z" />
        </pattern>
      </defs>

      <rect fill="url(#Pattern)" stroke="black" width="100" height="18" />
    </svg >
  )
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
  let cardLabel;

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const { image, price, compareAtPrice } = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };

  const bgpattern = "bg-sine-waves";

  const { currencyNarrowSymbol, withoutTrailingZerosAndCurrency } =
    useMoney(firstVariant.price);

  return (
    <div className="flex flex-col gap-2">
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="intent"
      >
        <div className={clsx('grid gap-4', className)}>

          {/* <div className="absolute w-full h-full">
            <ProductCardBackgroundSVG />
          </div> */}
          <div className={"card-image aspect-[4/5] bg-primary/5 " + bgpattern}>
            {image && (
              <Image
                className="object-cover w-full fadeIn px-2 py-2"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="4/5"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            )}
            {/* <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text> */}
          </div>
          <div className="grid gap-1">
            <Text
              className="w-full font-semibold text-center overflow-hidden whitespace-nowrap text-ellipsis top-0"
              as="p"
              size="copy"
            >
              {product.title}
            </Text>
            <Text
              className="w-full font-medium text-center overflow-hidden whitespace-nowrap text-ellipsis top-0 mt-0 pt-0"
              as="p"
              size="copy"
            >
              {currencyNarrowSymbol}{withoutTrailingZerosAndCurrency}
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
          analytics={{
            products: [productAnalytics],
            totalValue: parseFloat(productAnalytics.price),
          }}
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
  const { currencyNarrowSymbol, withoutTrailingZerosAndCurrency } =
    useMoney(data);

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
