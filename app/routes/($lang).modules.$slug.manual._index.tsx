import {useOutletContext} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {getSeoMeta, type SeoConfig} from '@shopify/hydrogen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {DocLayout} from '~/components/DocLayout';
import {getDocPage, buildSidebar, getPrevNext} from '~/lib/content.server';
import type {SidebarItem} from '~/lib/content.server';
import {
  getDocPathForSlug,
  getCanonicalSlug,
  getSlugEntry,
} from '~/data/product-slugs';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_LONG} from '~/data/cache';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';

export async function loader({params, request}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  const canonical = getCanonicalSlug(slug) ?? slug;
  const slugEntry = getSlugEntry(canonical);

  // If module has an external URL, redirect there
  if (slugEntry?.externalUrl) {
    throw new Response(null, {
      status: 302,
      headers: {Location: slugEntry.externalUrl},
    });
  }

  const docPath = getDocPathForSlug(canonical);
  if (!docPath) {
    throw new Response('Manual not found', {status: 404});
  }

  const doc = await getDocPage(docPath);
  if (!doc) {
    throw new Response('Manual not found', {status: 404});
  }

  // Module docs are flat (single file per module) — sidebar shows all modules
  const sidebar = buildSidebar('modules');
  const {prev, next} = getPrevNext('modules', docPath);

  const seo = seoPayload.doc({
    title: doc.frontmatter.title ?? `${canonical} Manual`,
    description: doc.frontmatter.description ?? '',
    url: new URL(request.url).origin + `/modules/${canonical}/manual`,
  });

  return json(
    {
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

export default function ModuleManualPage() {
  const {doc, sidebar, prev, next, currentPath, slug} =
    useLoaderData<typeof loader>();
  const parentData = useOutletContext<ModuleLayoutLoaderData>();
  const product = (parentData as unknown as ModuleHubData).product;

  const linkBuilder = (item: SidebarItem) => {
    // Module docs are flat: item.path is like "modules/esg3"
    // We want "/modules/esg3/manual"
    const moduleSlug = item.path.replace(/^modules\//, '');
    return `/modules/${moduleSlug}/manual`;
  };

  return (
    <DocLayout
      html={doc.html}
      sidebar={sidebar}
      headings={doc.headings}
      breadcrumbs={[
        {label: 'Home', to: '/'},
        {label: 'Modules', to: '/modules'},
        {label: product.title, to: `/modules/${slug}`},
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
