import {useLoaderData} from '@remix-run/react';
import type {Page as PageType} from '@shopify/hydrogen/storefront-api-types';
import {json} from '@shopify/remix-oxygen';
import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {PageHeader} from '~/components/Text';
import {CACHE_LONG, routeHeaders} from '~/data/cache';
import {getLocalPageByHandle} from '~/data/policies.server';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

function normalizePageBody(html: string): string {
  return html
    .replace(/href=["']\/pages\/([^"'\s]+@[^"'\s]+)["']/gi, 'href="mailto:$1"')
    .replace(/href=["']([^"':\s]+@[^"':\s]+)["']/gi, 'href="mailto:$1"');
}

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.pageHandle, 'Missing page handle');

  // Prefer locally-authored content. Pages that live in
  // `/policies/*.html` (e.g. contact-information, legal-notice)
  // resolve here without a Storefront API call. Anything else falls
  // through to Shopify so admin-managed pages keep working.
  const localPage = getLocalPageByHandle(params.pageHandle);
  if (localPage) {
    // Omit `seo.description` here so `seoPayload.page` can derive a
    // plain-text description from the rendered body. Explicitly
    // setting `description: ''` would short-circuit that fallback and
    // ship an empty meta description to search and social crawlers.
    const normalizedPage = {
      ...localPage,
      body: normalizePageBody(localPage.body),
      seo: {title: localPage.title},
    } as unknown as PageType;
    const seo = seoPayload.page({page: normalizedPage, url: request.url});
    return json(
      {page: normalizedPage, seo},
      {
        headers: {
          'Cache-Control': CACHE_LONG,
          'Oxygen-Cache-Control':
            'public, max-age=3600, stale-while-revalidate=600',
        },
      },
    );
  }

  const {page} = await context.storefront.query<{page: PageType}>(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, {status: 404});
  }

  const normalizedPage = {
    ...page,
    body: normalizePageBody(page.body || ''),
  };

  const seo = seoPayload.page({page: normalizedPage, url: request.url});

  return json(
    {page: normalizedPage, seo},
    {
      headers: {
        'Cache-Control': CACHE_LONG,
        'Oxygen-Cache-Control':
          'public, max-age=3600, stale-while-revalidate=600',
      },
    },
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading={page.title}>
        <div
          dangerouslySetInnerHTML={{__html: page.body}}
          className="prose dark:prose-invert"
        />
      </PageHeader>
    </>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;
