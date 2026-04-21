import {Outlet, useLoaderData} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {defer} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {Breadcrumbs} from '~/components/Breadcrumbs';
import {HubNavBar} from '~/components/HubNavBar';
import type {HubTab} from '~/components/HubNavBar';
import {routeHeaders} from '~/data/cache';
import {
  getRecommendedProducts,
  loadInstrumentHubData,
  type InstrumentHubData,
} from '~/data/hub-loaders';
import {getCanonicalSlug, isSystemSlug} from '~/data/product-slugs';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  const canonical = getCanonicalSlug(slug);
  if (!canonical || !isSystemSlug(canonical)) {
    throw new Response('System not found', {status: 404});
  }

  if (slug !== canonical) {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(`/systems/${slug}`, `/systems/${canonical}`);
    throw new Response(null, {
      status: 301,
      headers: {
        Location: url.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  const data = await loadInstrumentHubData(slug, context, request);
  if (!data) {
    throw new Response('System not found', {status: 404});
  }

  const recommended = getRecommendedProducts(context, data.product.id);

  return defer({
    ...data,
    recommended,
  });
}

type SystemLayoutLoaderData = InstrumentHubData & {
  recommended: ReturnType<typeof getRecommendedProducts>;
};

export default function SystemsLayout() {
  const data = useLoaderData<typeof loader>() as unknown as SystemLayoutLoaderData;
  const {product, hasManual, videos, assets, connectors, controls, features} =
    data as unknown as InstrumentHubData;
  const slug = (data as unknown as InstrumentHubData).slug;

  const basePath = `/systems/${slug}`;
  const instrumentBasePath = `/instruments/${slug}`;

  const hasSpecs =
    connectors.length > 0 ||
    controls.length > 0 ||
    features.length > 0 ||
    (product as any).metafields?.some(
      (m: any) =>
        m?.namespace === 'custom' &&
        ['specs', 'features', 'compatibility'].includes(m?.key),
    );

  const tabs: HubTab[] = [
    {label: 'Overview', to: basePath},
    {label: 'Docs', to: `${instrumentBasePath}/manual`, hidden: !hasManual},
    {label: 'Learn', to: `${instrumentBasePath}/learn`},
    {label: 'Setup', to: `${instrumentBasePath}/setup`},
    {
      label: 'Videos',
      to: `${instrumentBasePath}/videos`,
      hidden: videos.length === 0,
    },
    {
      label: 'Software & Downloads',
      to: `${instrumentBasePath}/downloads`,
      hidden: assets.length === 0,
    },
    {label: 'Specs', to: `${instrumentBasePath}/specs`, hidden: !hasSpecs},
    {label: 'Support', to: `${instrumentBasePath}/support`},
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Systems', to: '/systems'},
          {label: product.title},
        ]}
      />
      <HubNavBar tabs={tabs} />
      <Outlet context={data} />
    </div>
  );
}