import {useOutletContext} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';

import {DocLayout} from '~/components/DocLayout';
import {getForumArchiveDocForProduct} from '~/data/forum-archive.server';
import {getSyntheticLegacyModuleManualDoc} from '~/data/legacy-module-docs';
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
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

export async function loader({params, request}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing slug param');

  const canonical = getCanonicalSlug(slug) ?? slug;
  const slugEntry = getSlugEntry(canonical);
  const archiveDoc = await getForumArchiveDocForProduct(
    canonical,
    slugEntry?.name ?? canonical,
    slugEntry?.externalUrl,
  );
  const docPath = getDocPathForSlug(canonical);
  const doc = docPath ? await getDocPage(docPath) : null;

  if (doc && docPath) {
    const sidebar = buildSidebar('modules');
    const {prev, next} = getPrevNext('modules', docPath);

    const seo = seoPayload.doc({
      title: doc.frontmatter.title ?? `${canonical} Manual`,
      description: doc.frontmatter.description ?? '',
      url: new URL(request.url).origin + `/modules/${canonical}/manual`,
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

  if (archiveDoc) {
    const seo = seoPayload.doc({
      title: archiveDoc.frontmatter.title ?? `${canonical} Manual`,
      description: archiveDoc.frontmatter.description ?? '',
      url: new URL(request.url).origin + `/modules/${canonical}/manual`,
    });

    return json(
      {
        noManual: false as const,
        doc: archiveDoc,
        sidebar: [] as SidebarItem[],
        prev: null,
        next: null,
        currentPath: archiveDoc.path,
        slug: canonical,
        seo,
      },
      {headers: {'Cache-Control': CACHE_LONG}},
    );
  }

  const syntheticDoc = getSyntheticLegacyModuleManualDoc(
    canonical,
    slugEntry?.name ?? canonical,
    slugEntry?.externalUrl,
  );

  if (syntheticDoc) {
    const seo = seoPayload.doc({
      title: syntheticDoc.frontmatter.title ?? `${canonical} Manual`,
      description: syntheticDoc.frontmatter.description ?? '',
      url: new URL(request.url).origin + `/modules/${canonical}/manual`,
    });

    return json(
      {
        noManual: false as const,
        doc: syntheticDoc,
        sidebar: [] as SidebarItem[],
        prev: null,
        next: null,
        currentPath: syntheticDoc.path,
        slug: canonical,
        seo,
      },
      {headers: {'Cache-Control': CACHE_LONG}},
    );
  }

  if (!docPath) {
    return json(
      {noManual: true as const, slug: canonical, doc: null, sidebar: null, prev: null, next: null, currentPath: null, seo: null},
      {headers: {'Cache-Control': CACHE_LONG}},
    );
  }

  if (!doc) {
    return json(
      {noManual: true as const, slug: canonical, doc: null, sidebar: null, prev: null, next: null, currentPath: null, seo: null},
      {headers: {'Cache-Control': CACHE_LONG}},
    );
  }
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

export default function ModuleManualPage() {
  const loaderData = useLoaderData<typeof loader>();
  const parentData = useOutletContext<ModuleLayoutLoaderData>();
  const product = (parentData as unknown as ModuleHubData).product;

  if (loaderData.noManual) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No Manual Available</h1>
        <p className="text-base-content/70">
          A manual for <strong>{product.title}</strong> is not available yet.
        </p>
        <a
          href={`/modules/${loaderData.slug}`}
          className="btn btn-outline btn-sm mt-6"
        >
          Return to overview
        </a>
      </div>
    );
  }

  const {doc, sidebar, prev, next, currentPath, slug} = loaderData;

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
      sectionHeader={{
        badge: 'Reference Manual',
        contextLabel: product.title,
        description: 'Technical documentation, setup guidance, and patching workflows.',
        backLink: {label: `${product.title} overview`, to: `/modules/${slug}`},
      }}
      showBreadcrumbs={false}
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
