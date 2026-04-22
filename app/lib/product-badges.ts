export const PREORDER_PRODUCT_IDS = new Set([
  'gid://shopify/Product/4319674761239',
]);

export interface ProductInventoryVariant {
  availableForSale?: boolean | null;
  quantityAvailable?: number | null;
}

export type ProductGridBadge = 'In Stock' | 'Preorder' | 'Backorder';

export interface ProductPurchaseStatus {
  isOutOfStock: boolean;
  isPreorder: boolean;
  isBackorder: boolean;
  isLowStock: boolean;
  buttonLabel: 'Sold Out' | 'Preorder Now' | 'Backorder Now' | 'Add to Cart';
  shippingLabel:
    | 'Ships when available'
    | 'Ships in 4-6 weeks'
    | 'Ships in 24 hours';
  availabilityLabel: string;
}

export function isPreorderProduct(productId?: string | null): boolean {
  return productId ? PREORDER_PRODUCT_IDS.has(productId) : false;
}

export function isInStockVariant(
  variant?: ProductInventoryVariant | null,
): boolean {
  return (variant?.quantityAvailable ?? 0) > 0;
}

export function isBackorderVariant(
  variant?: ProductInventoryVariant | null,
  productId?: string | null,
): boolean {
  if (isPreorderProduct(productId)) return false;
  if (!variant?.availableForSale) return false;
  if (variant.quantityAvailable == null) return false;

  return variant.quantityAvailable <= 0;
}

export function isLowStockVariant(
  variant?: ProductInventoryVariant | null,
): boolean {
  if (variant?.quantityAvailable == null) return false;

  return variant.quantityAvailable > 0 && variant.quantityAvailable < 5;
}

export function getProductPurchaseStatus({
  productId,
  variant,
  isAvailable = true,
}: {
  productId?: string | null;
  variant?: ProductInventoryVariant | null;
  isAvailable?: boolean;
}): ProductPurchaseStatus {
  const isOutOfStock = !isAvailable || variant?.availableForSale === false;
  const isPreorder = !isOutOfStock && isPreorderProduct(productId);
  const isBackorder = !isOutOfStock && isBackorderVariant(variant, productId);
  const isLowStock =
    !isOutOfStock && !isPreorder && !isBackorder && isLowStockVariant(variant);
  const quantityAvailable = variant?.quantityAvailable ?? 0;

  return {
    isOutOfStock,
    isPreorder,
    isBackorder,
    isLowStock,
    buttonLabel: isOutOfStock
      ? 'Sold Out'
      : isPreorder
      ? 'Preorder Now'
      : isBackorder
      ? 'Backorder Now'
      : 'Add to Cart',
    shippingLabel: isPreorder
      ? 'Ships when available'
      : isBackorder
      ? 'Ships in 4-6 weeks'
      : 'Ships in 24 hours',
    availabilityLabel: isOutOfStock
      ? 'Sold out'
      : isPreorder
      ? 'Preorder'
      : isBackorder
      ? 'Ships in 4-6 weeks'
      : isLowStock
      ? `${quantityAvailable} left`
      : 'In stock',
  };
}

export function getProductGridBadges({
  productId,
  variants,
}: {
  productId?: string | null;
  variants: Array<ProductInventoryVariant | null | undefined>;
}): ProductGridBadge[] {
  const badges: ProductGridBadge[] = [];
  const hasInStockVariant = variants.some((variant) => isInStockVariant(variant));

  if (hasInStockVariant) {
    badges.push('In Stock');
  }

  if (isPreorderProduct(productId)) {
    badges.push('Preorder');
    return badges;
  }

  if (
    !hasInStockVariant &&
    variants.some((variant) => isBackorderVariant(variant, productId))
  ) {
    badges.push('Backorder');
  }

  return badges;
}