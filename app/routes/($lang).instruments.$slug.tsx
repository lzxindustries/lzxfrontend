import {Outlet, useLoaderData} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {defer} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {Breadcrumbs} from '~/components/Breadcrumbs';
import {HubNavBar} from '~/components/HubNavBar';
import {
  loadInstrumentHubData,
  getRecommendedProducts,
} from '~/data/hub-loaders';
import type {InstrumentHubData} from '~/data/hub-loaders';
import {getCanonicalSlug} from '~/data/product-slugs';
import {buildInstrumentTabs} from '~/data/hub-tabs';
import {hasCuratedLearnContent} from '~/data/instrument-learn-cards';
import {loadSupportContent} from '~/data/support-content.server';
import {SUPPORT_MANIFEST} from '~/data/support-manifest';
import {getSignalFlowForProduct} from '~/components/SignalFlowDiagram';
import {routeHeaders} from '~/data/cache';

/**
 * True when the Setup tab would have meaningful first-run content for
 * this instrument: authored prerequisites, a signal flow diagram, or
 * a firmware updater entry point. Otherwise the tab would render only
 * a generic template that duplicates material in the Manual.
 *
 * Computed in the loader (not the component) because
 * `loadSupportContent` lives in a `.server.ts` module and cannot be
 * pulled into the client bundle.
 */
function computeHasSetupContent(slug: string): boolean {
  const supportContent = loadSupportContent(slug);
  const supportRecord = SUPPORT_MANIFEST[slug];
  return (
    (supportContent.setupPrerequisites?.length ?? 0) > 0 ||
    Boolean(getSignalFlowForProduct(slug)) ||
    supportRecord?.connectSupported === true
  );
}

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
  const hasSetupContent = computeHasSetupContent(slug);

  return defer({
    ...data,
    recommended,
    hasSetupContent,
  });
}

export type InstrumentLayoutLoaderData = InstrumentHubData & {
  recommended: ReturnType<typeof getRecommendedProducts>;
  hasSetupContent: boolean;
};

export default function InstrumentLayout() {
  const data = useLoaderData<typeof loader>();
  const {
    product,
    hasManual,
    videos,
    assets,
    archiveAssets,
    connectors,
    controls,
    features,
  } = data as unknown as InstrumentHubData;
  const slug = (data as unknown as InstrumentHubData).slug;
  const hasSetupContent = (data as unknown as InstrumentLayoutLoaderData)
    .hasSetupContent;

  const hasSpecs =
    connectors.length > 0 ||
    controls.length > 0 ||
    features.length > 0 ||
    (product as any).metafields?.some(
      (m: any) =>
        m?.namespace === 'custom' &&
        ['specs', 'features', 'compatibility'].includes(m?.key),
    );

  const tabs = buildInstrumentTabs({
    slug,
    hasManual,
    hasCuratedLearn: hasCuratedLearnContent(slug),
    hasSetupContent,
    videoCount: videos.length,
    downloadCount: assets.length + archiveAssets.length,
    hasSpecs: Boolean(hasSpecs),
  });

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
