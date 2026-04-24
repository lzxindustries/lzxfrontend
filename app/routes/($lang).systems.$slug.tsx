import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {redirect} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {routeHeaders} from '~/data/cache';
import {
  getCanonicalSlug,
  getSlugEntry,
  getSystemProductHandle,
  isSystemSlug,
} from '~/data/product-slugs';
import {getProductRecord, getProductRecordByGid} from '~/data/product-catalog';

export const headers = routeHeaders;

export async function loader({params}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  const canonical = getCanonicalSlug(slug);
  if (!canonical || !isSystemSlug(canonical)) {
    throw new Response('System not found', {status: 404});
  }

  // Resolve the Shopify product handle via the explicit system mapping,
  // then verify it against the local catalog. GID lookup is kept as a
  // last-resort safety net in case the catalog snapshot drifts.
  const handle = getSystemProductHandle(canonical);
  const slugEntry = getSlugEntry(canonical)!;
  const record =
    (handle ? getProductRecord(handle) : null) ??
    (slugEntry.shopifyGid ? getProductRecordByGid(slugEntry.shopifyGid) : null);
  if (!record) {
    throw new Response('System not found', {status: 404});
  }

  return redirect(`/products/${record.handle}`, {
    status: 301,
    headers: {'Cache-Control': 'public, max-age=31536000'},
  });
}

export default function SystemsSlugLayout() {
  return null;
}
