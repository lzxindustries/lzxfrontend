/**
 * Whether the module hub should show a **Specs** tab with meaningful content.
 * Matches `modules.$slug.specs` / `app/routes/($lang).modules.$slug.specs.tsx` —
 * lzxdb structured data and/or the Shopify `custom.specs` metafield.
 */
export function moduleHasSpecsTabContent(
  product: {metafields?: (Record<string, unknown> | null)[] | null},
  connectorsLen: number,
  controlsLen: number,
  featuresLen: number,
): boolean {
  if (connectorsLen > 0 || controlsLen > 0 || featuresLen > 0) {
    return true;
  }
  const mfs = product.metafields;
  if (!Array.isArray(mfs)) return false;
  return mfs.some(
    (m) =>
      m &&
      m.namespace === 'custom' &&
      m.key === 'specs' &&
      typeof m.value === 'string' &&
      m.value.trim().length > 0,
  );
}
