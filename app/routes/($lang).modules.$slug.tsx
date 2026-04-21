import {Outlet, useLoaderData} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {defer} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {Breadcrumbs} from '~/components/Breadcrumbs';
import {HubNavBar} from '~/components/HubNavBar';
import type {HubTab} from '~/components/HubNavBar';
import {loadModuleHubData, getRecommendedProducts} from '~/data/hub-loaders';
import type {ModuleHubData} from '~/data/hub-loaders';
import {getCanonicalSlug} from '~/data/product-slugs';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  const canonical = getCanonicalSlug(slug);
  if (!canonical) {
    throw new Response('Module not found', {status: 404});
  }

  // Redirect aliases to canonical URL
  if (slug !== canonical) {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(
      `/modules/${slug}`,
      `/modules/${canonical}`,
    );
    throw new Response(null, {
      status: 301,
      headers: {
        Location: url.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  const data = await loadModuleHubData(slug, context, request);
  if (!data) {
    throw new Response('Module not found', {status: 404});
  }

  const recommended = data.hasShopifyProduct
    ? getRecommendedProducts(context, data.product.id)
    : Promise.resolve([]);

  return defer({
    ...data,
    recommended,
  });
}

export type ModuleLayoutLoaderData = ModuleHubData & {
  recommended: ReturnType<typeof getRecommendedProducts>;
};

export default function ModuleLayout() {
  const data = useLoaderData<typeof loader>();
  const {
    product,
    hasManual,
    patches,
    videos,
    assets,
    archiveAssets,
    connectors,
    controls,
    features,
    slugEntry,
  } = data as unknown as ModuleHubData;
  const slug = (data as unknown as ModuleHubData).slug;

  const basePath = `/modules/${slug}`;

  const hasSpecs =
    connectors.length > 0 || controls.length > 0 || features.length > 0;

  const tabs: HubTab[] = [
    {label: 'Overview', to: basePath},
    {
      label: 'Docs',
      to: `${basePath}/manual`,
      hidden: !hasManual && !slugEntry.externalUrl,
    },
    {label: 'Patches', to: `${basePath}/patches`, hidden: patches.length === 0},
    {label: 'Videos', to: `${basePath}/videos`, hidden: videos.length === 0},
    {
      label: 'Downloads',
      to: `${basePath}/downloads`,
      hidden: assets.length === 0 && archiveAssets.length === 0,
    },
    {label: 'Specs', to: `${basePath}/specs`, hidden: !hasSpecs},
    {label: 'Support', to: `${basePath}/support`},
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Modules', to: '/modules'},
          {label: product.title},
        ]}
      />
      <HubNavBar tabs={tabs} />
      <Outlet context={data} />
    </div>
  );
}
