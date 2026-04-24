import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
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
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

export async function loader({params, request}: LoaderFunctionArgs) {
  const rawSplat = params['*'];
  if (!rawSplat) {
    throw new Response('Not Found', {status: 404});
  }

  // Canonicalize trailing slashes: /docs/foo/ → /docs/foo (301).
  // Content lookups use splat as a relative path, so trailing
  // slashes would otherwise 404.
  if (rawSplat.endsWith('/')) {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(/\/+$/, '');
    if (!url.pathname) url.pathname = '/docs';
    throw new Response(null, {
      status: 301,
      headers: {
        Location: url.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  const splat = rawSplat;

  // Redirect /docs/modules/* → /modules/*/manual
  if (splat.startsWith('modules/')) {
    const rest = splat.slice('modules/'.length);
    if (rest === 'module-list' || rest === 'module-list/') {
      throw new Response(null, {
        status: 301,
        headers: {
          Location: '/modules/specs',
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

  // Redirect /docs/getting-started/* → /getting-started/*
  // `/getting-started` is the canonical onboarding URL family: it has
  // a curated index page with path-picker cards and dedicated route
  // templates. Leaving `/docs/getting-started/*` live would duplicate
  // every onboarding page under two distinct layouts (DocLayout vs
  // MarkdownArticle) and split analytics and SEO.
  if (splat.startsWith('getting-started/') || splat === 'getting-started') {
    const rest = splat === 'getting-started'
      ? ''
      : splat.slice('getting-started/'.length);
    const target = rest ? `/getting-started/${rest}` : '/getting-started';
    throw new Response(null, {
      status: 301,
      headers: {
        Location: target,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
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

  // Determine product hub back-link if this doc belongs to a product
  let productHubLink: {label: string; to: string} | null = null;
  if (section === 'instruments') {
    const instrumentSlug = pathParts[1];
    if (instrumentSlug) {
      productHubLink = {
        label: formatLabel(instrumentSlug),
        to: `/instruments/${instrumentSlug}`,
      };
    }
  } else if (section === 'guides') {
    // Guides are standalone — no product back-link
  } else if (section === 'case-and-power') {
    // Case/power docs are standalone
  }

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
      productHubLink,
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
  return seoMetaFromLoaderData(data);
};

export default function DocsPage() {
  const {doc, sidebar, prev, next, breadcrumbs, currentPath, productHubLink} =
    useLoaderData<typeof loader>();

  return (
    <DocLayout
      html={doc.html}
      sidebar={sidebar}
      headings={doc.headings}
      sectionHeader={
        productHubLink
          ? {
              badge: 'Reference Manual',
              contextLabel: productHubLink.label,
              description: 'Technical documentation, setup guidance, and patching workflows.',
              backLink: {
                label: `${productHubLink.label} product page`,
                to: productHubLink.to,
              },
            }
          : undefined
      }
      showBreadcrumbs={!productHubLink}
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
