import {Outlet, useLoaderData} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {defer} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {Breadcrumbs} from '~/components/Breadcrumbs';
import {HubNavBar} from '~/components/HubNavBar';
import {loadModuleHubData, getRecommendedProducts} from '~/data/hub-loaders';
import type {ModuleHubData} from '~/data/hub-loaders';
import {getCanonicalSlug, getSlugEntry} from '~/data/product-slugs';
import {buildModuleTabs} from '~/data/hub-tabs';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  // "module-list" is the cross-module index, not a product. Redirect
  // any lingering bookmarks or rewritten markdown links to the specs
  // overview that fulfils the same role.
  if (slug === 'module-list') {
    throw new Response(null, {
      status: 301,
      headers: {
        Location: '/modules/specs',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  const canonical = getCanonicalSlug(slug);
  if (!canonical) {
    throw new Response('Module not found', {status: 404});
  }

  // Safety net for stale external links: if this slug has been reclassified
  // as an instrument (e.g. videomancer), 301 to the instrument hub instead
  // of 404ing. The module route never rendered these slugs since the split.
  const entry = getSlugEntry(canonical);
  if (entry?.hubType === 'instrument') {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(
      `/modules/${slug}`,
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
    hasLocalDocumentation,
    patches,
    videos,
    assets,
    archiveAssets,
    connectors,
    controls,
    features,
  } = data as unknown as ModuleHubData;
  const slug = (data as unknown as ModuleHubData).slug;

  const hasSpecs =
    connectors.length > 0 || controls.length > 0 || features.length > 0;

  const tabs = buildModuleTabs({
    slug,
    hasLocalDocumentation,
    patchCount: patches.length,
    videoCount: videos.length,
    downloadCount: assets.length + archiveAssets.length,
    hasSpecs,
  });

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
