import {Outlet, useLoaderData} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {defer} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {Breadcrumbs} from '~/components/Breadcrumbs';
import {HubNavBar} from '~/components/HubNavBar';
import type {HubTab} from '~/components/HubNavBar';
import {loadInstrumentHubData, getRecommendedProducts} from '~/data/hub-loaders';
import type {InstrumentHubData} from '~/data/hub-loaders';
import {getCanonicalSlug} from '~/data/product-slugs';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  const canonical = getCanonicalSlug(slug);
  if (!canonical) {
    throw new Response('Instrument not found', {status: 404});
  }

  if (slug !== canonical) {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(
      `/instruments/${slug}`,
      `/instruments/${canonical}`,
    );
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
    throw new Response('Instrument not found', {status: 404});
  }

  const recommended = getRecommendedProducts(context, data.product.id);

  return defer({
    ...data,
    recommended,
  });
}

export type InstrumentLayoutLoaderData = InstrumentHubData & {
  recommended: ReturnType<typeof getRecommendedProducts>;
};

export default function InstrumentLayout() {
  const data = useLoaderData<typeof loader>();
  const {product, hasManual, videos, assets, slugEntry} =
    data as unknown as InstrumentHubData;
  const slug = (data as unknown as InstrumentHubData).slug;

  const basePath = `/instruments/${slug}`;

  const tabs: HubTab[] = [
    {label: 'Overview', to: basePath},
    {label: 'Manual', to: `${basePath}/manual`, hidden: !hasManual},
    {label: 'Videos', to: `${basePath}/videos`, hidden: videos.length === 0},
    {label: 'Downloads', to: `${basePath}/downloads`, hidden: assets.length === 0},
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Instruments', to: '/instruments'},
          {label: product.title},
        ]}
      />
      <HubNavBar tabs={tabs} />
      <Outlet context={data} />
    </div>
  );
}
