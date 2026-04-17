import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {CACHE_LONG} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {
  getDocPage,
  buildSidebar,
  getPrevNext,
  hasDocPagePath,
} from '~/lib/content.server';
import {DocLayout} from '~/components/DocLayout';

export async function loader({params, request}: LoaderFunctionArgs) {
  const splat = params['*'];
  if (!splat) {
    throw new Response('Not Found', {status: 404});
  }

  // Redirect /docs/modules/* → /modules/*/manual
  if (splat.startsWith('modules/')) {
    const rest = splat.slice('modules/'.length);
    if (rest === 'module-list' || rest === 'module-list/') {
      throw new Response(null, {
        status: 301,
        headers: {
          Location: '/modules',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }
    const slug = rest.split('/')[0];
    if (slug) {
      throw new Response(null, {
        status: 301,
        headers: {
          Location: `/modules/${slug}/manual`,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }
  }

  // Redirect /docs/instruments/* → /instruments/*/manual/*
  if (splat.startsWith('instruments/')) {
    const rest = splat.slice('instruments/'.length);
    const parts = rest.split('/');
    const slug = parts[0];
    const subPath = parts.slice(1).join('/');
    if (slug) {
      const target = `/instruments/${slug}/manual${
        subPath ? '/' + subPath : ''
      }`;
      throw new Response(null, {
        status: 301,
        headers: {
          Location: target,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }
  }

  const doc = await getDocPage(splat);
  if (!doc) {
    throw new Response('Not Found', {status: 404});
  }

  // Determine section from first path segment
  const section = splat.split('/')[0];

  const sidebar = buildSidebar(section);
  const {prev, next} = getPrevNext(section, splat);

  // Build breadcrumbs from path
  const pathParts = splat.split('/');
  const breadcrumbs = [
    {label: 'Home', to: '/'},
    {label: 'Docs', to: '/docs'},
    ...pathParts.slice(0, -1).map((part, i) => {
      const partialPath = pathParts.slice(0, i + 1).join('/');
      const hasPage = hasDocPagePath(partialPath);
      return {
        label: formatLabel(part),
        to: hasPage ? `/docs/${partialPath}` : undefined,
      };
    }),
    {
      label:
        doc.frontmatter.title ?? formatLabel(pathParts[pathParts.length - 1]),
    },
  ];

  const seo = seoPayload.doc({
    title: doc.frontmatter.title ?? splat,
    description: doc.frontmatter.description ?? '',
    url: new URL(request.url).origin + `/docs/${splat}`,
  });

  return json(
    {
      doc,
      sidebar,
      prev,
      next,
      breadcrumbs,
      currentPath: splat,
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_LONG,
      },
    },
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function DocsPage() {
  const {doc, sidebar, prev, next, breadcrumbs, currentPath} =
    useLoaderData<typeof loader>();

  return (
    <DocLayout
      html={doc.html}
      sidebar={sidebar}
      headings={doc.headings}
      breadcrumbs={breadcrumbs}
      prev={prev}
      next={next}
      frontmatter={doc.frontmatter}
      currentPath={currentPath}
    />
  );
}

function formatLabel(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
