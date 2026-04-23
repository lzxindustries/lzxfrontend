import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {redirect} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {routeHeaders} from '~/data/cache';
import {getCanonicalSlug, isSystemSlug, getSlugEntry} from '~/data/product-slugs';
import {getProductRecord, getProductRecordByGid} from '~/data/product-catalog';

export const headers = routeHeaders;

export async function loader({params}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  const canonical = getCanonicalSlug(slug);
  if (!canonical || !isSystemSlug(canonical)) {
    throw new Response('System not found', {status: 404});
  }

  // Resolve the Shopify product handle for this system slug and redirect.
  const slugEntry = getSlugEntry(canonical)!;
  const record =
    getProductRecord(canonical) ??
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