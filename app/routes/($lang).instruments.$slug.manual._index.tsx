import {useOutletContext} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {getSeoMeta, type SeoConfig} from '@shopify/hydrogen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {DocLayout} from '~/components/DocLayout';
import {getDocPage, buildSidebar, getPrevNext} from '~/lib/content.server';
import type {SidebarItem} from '~/lib/content.server';
import {getDocPathForSlug, getCanonicalSlug} from '~/data/product-slugs';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_LONG} from '~/data/cache';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';

export async function loader({params, request}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  const canonical = getCanonicalSlug(slug) ?? slug;
  const docPath = getDocPathForSlug(canonical);
  if (!docPath) {
    return json(
      {noManual: true as const, slug: canonical, doc: null, sidebar: null, prev: null, next: null, currentPath: null, seo: null},
      {headers: {'Cache-Control': CACHE_LONG}},
    );
  }

  const doc = await getDocPage(docPath);
  if (!doc) {
    return json(
      {noManual: true as const, slug: canonical, doc: null, sidebar: null, prev: null, next: null, currentPath: null, seo: null},
      {headers: {'Cache-Control': CACHE_LONG}},
    );
  }

  // Build sidebar for the instrument's section
  // docPath is like "instruments/videomancer" — we need the sub-section
  const instrumentSection = docPath; // e.g. "instruments/videomancer"
  const sidebar = buildSidebar(instrumentSection);
  const {prev, next} = getPrevNext(instrumentSection, docPath);

  const seo = seoPayload.doc({
    title: doc.frontmatter.title ?? `${canonical} Manual`,
    description: doc.frontmatter.description ?? '',
    url: new URL(request.url).origin + `/instruments/${canonical}/manual`,
  });

  return json(
    {
      noManual: false as const,
      doc,
      sidebar,
      prev,
      next,
      currentPath: docPath,
      slug: canonical,
      seo,
    },
    {headers: {'Cache-Control': CACHE_LONG}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function InstrumentManualIndex() {
  const loaderData = useLoaderData<typeof loader>();
  const parentData = useOutletContext<InstrumentLayoutLoaderData>();
  const product = (parentData as unknown as InstrumentHubData).product;

  if (loaderData.noManual) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No Manual Available</h1>
        <p className="text-base-content/70">
          A manual for <strong>{product.title}</strong> is not available yet.
        </p>
      </div>
    );
  }

  const {doc, sidebar, prev, next, currentPath, slug} = loaderData;

  const linkBuilder = (item: SidebarItem) => {
    // item.path is like "instruments/videomancer/quick-start"
    // We want "/instruments/videomancer/manual/quick-start"
    const prefix = `instruments/${slug}`;
    const relative = item.path.startsWith(prefix + '/')
      ? item.path.slice(prefix.length + 1)
      : item.slug;
    return `/instruments/${slug}/manual${relative ? '/' + relative : ''}`;
  };

  return (
    <DocLayout
      html={doc.html}
      sidebar={sidebar}
      headings={doc.headings}
      sectionHeader={{
        badge: 'Reference Manual',
        contextLabel: product.title,
        description: 'Technical documentation, setup guidance, and patching workflows.',
        backLink: {
          label: `${product.title} overview`,
          to: `/instruments/${slug}`,
        },
      }}
      showBreadcrumbs={false}
      breadcrumbs={[
        {label: 'Home', to: '/'},
        {label: 'Instruments', to: '/instruments'},
        {label: product.title, to: `/instruments/${slug}`},
        {label: 'Manual'},
      ]}
      prev={prev}
      next={next}
      frontmatter={doc.frontmatter}
      currentPath={currentPath}
      linkBuilder={linkBuilder}
    />
  );
}
