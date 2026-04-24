import {useLoaderData} from '@remix-run/react';
import type {ShopPolicy} from '@shopify/hydrogen/storefront-api-types';
import {json} from '@shopify/remix-oxygen';
import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {Button} from '~/components/Button';
import {Section, PageHeader} from '~/components/Text';
import {routeHeaders, CACHE_LONG} from '~/data/cache';
import {getLocalPolicyByHandle} from '~/data/policies.server';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

export async function loader({request, params}: LoaderFunctionArgs) {
  invariant(params.policyHandle, 'Missing policy handle');
  const policy = getLocalPolicyByHandle(params.policyHandle);

  if (!policy) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.policy({
    policy: policy as unknown as ShopPolicy,
    url: request.url,
  });

  return json(
    {policy, seo},
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

export default function Policies() {
  const {policy} = useLoaderData<typeof loader>();

  return (
    <>
      <Section
        padding="all"
        display="flex"
        className="flex-col items-baseline w-full gap-8 md:flex-row"
      >
        <PageHeader
          heading={policy.title}
          className="grid items-start flex-grow gap-4 md:sticky top-36 md:w-5/12"
        >
          <Button
            className="justify-self-start"
            variant="inline"
            to={'/policies'}
          >
            &larr; Back to Policies
          </Button>
        </PageHeader>
        <div className="flex-grow w-full md:w-7/12">
          <div
            dangerouslySetInnerHTML={{__html: policy.body}}
            className="prose dark:prose-invert"
          />
        </div>
      </Section>
    </>
  );
}


