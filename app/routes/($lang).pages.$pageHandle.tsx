import {useLoaderData} from '@remix-run/react';
import type {SeoConfig} from '@shopify/hydrogen';
import {getSeoMeta} from '@shopify/hydrogen';
import type {Page as PageType} from '@shopify/hydrogen/storefront-api-types';
import {json} from '@shopify/remix-oxygen';
import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {PageHeader} from '~/components/Text';
import {CACHE_LONG, routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

function normalizePageBody(html: string): string {
  return html
    .replace(
      /href=["']\/pages\/([^"'\s]+@[^"'\s]+)["']/gi,
      'href="mailto:$1"',
    )
    .replace(
      /href=["']([^"':\s]+@[^"':\s]+)["']/gi,
      'href="mailto:$1"',
    );
}

export async function loader({request, params, context}: LoaderFunctionArgs) {
  invariant(params.pageHandle, 'Missing page handle');

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
  return getSeoMeta(data!.seo as SeoConfig);
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
