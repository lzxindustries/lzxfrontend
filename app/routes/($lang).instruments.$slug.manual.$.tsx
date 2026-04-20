import {useOutletContext} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {getSeoMeta, type SeoConfig} from '@shopify/hydrogen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {DocLayout} from '~/components/DocLayout';
import {
  getDocPage,
  buildSidebar,
  getPrevNext,
  hasDocPagePath,
} from '~/lib/content.server';
import type {SidebarItem} from '~/lib/content.server';
import {getDocPathForSlug, getCanonicalSlug} from '~/data/product-slugs';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_LONG} from '~/data/cache';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';

function formatLabel(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function loader({params, request}: LoaderFunctionArgs) {
  const {slug} = params;
  const splat = params['*'];
  invariant(slug, 'Missing slug param');
  invariant(splat, 'Missing splat param');

  const canonical = getCanonicalSlug(slug) ?? slug;
  const docPath = getDocPathForSlug(canonical);
  if (!docPath) {
    throw new Response('Manual not found', {status: 404});
  }

  // Full doc path: e.g. "instruments/videomancer/quick-start"
  const fullDocPath = `${docPath}/${splat}`;
  const doc = await getDocPage(fullDocPath);
  if (!doc) {
    throw new Response('Page not found', {status: 404});
  }

  const instrumentSection = docPath;
  const sidebar = buildSidebar(instrumentSection);
  const {prev, next} = getPrevNext(instrumentSection, fullDocPath);

  // Build breadcrumbs
  const splatParts = splat.split('/');
  const breadcrumbs = [
    {label: 'Home', to: '/'},
    {label: 'Instruments', to: '/instruments'},
    {
      label: (doc.frontmatter as any)._productTitle ?? canonical,
      to: `/instruments/${canonical}`,
    },
    {label: 'Manual', to: `/instruments/${canonical}/manual`},
    ...splatParts.slice(0, -1).map((part, i) => {
      const partialSplat = splatParts.slice(0, i + 1).join('/');
      const partialDocPath = `${docPath}/${partialSplat}`;
      const hasPage = hasDocPagePath(partialDocPath);
      return {
        label: formatLabel(part),
        to: hasPage
          ? `/instruments/${canonical}/manual/${partialSplat}`
          : undefined,
      };
    }),
    {
      label:
        doc.frontmatter.title ??
        formatLabel(splatParts[splatParts.length - 1] ?? ''),
    },
  ];

  const seo = seoPayload.doc({
    title: doc.frontmatter.title ?? splat,
    description: doc.frontmatter.description ?? '',
    url:
      new URL(request.url).origin + `/instruments/${canonical}/manual/${splat}`,
  });

  return json(
    {
      doc,
      sidebar,
      prev,
      next,
      currentPath: fullDocPath,
      slug: canonical,
      seo,
      breadcrumbs,
    },
    {headers: {'Cache-Control': CACHE_LONG}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function InstrumentManualPage() {
  const {doc, sidebar, prev, next, currentPath, slug, breadcrumbs} =
    useLoaderData<typeof loader>();
  const parentData = useOutletContext<InstrumentLayoutLoaderData>();
  const product = (parentData as unknown as InstrumentHubData).product;

  const linkBuilder = (item: SidebarItem) => {
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
      breadcrumbs={breadcrumbs as {label: string; to?: string}[]}
      prev={prev}
      next={next}
      frontmatter={doc.frontmatter}
      currentPath={currentPath}
      linkBuilder={linkBuilder}
    />
  );
}
