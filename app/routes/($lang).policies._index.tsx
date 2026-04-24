import {useLoaderData} from '@remix-run/react';
import type {ShopPolicy} from '@shopify/hydrogen/storefront-api-types';
import {json} from '@shopify/remix-oxygen';
import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link} from '~/components/Link';
import {Heading, Section, PageHeader} from '~/components/Text';
import {routeHeaders, CACHE_LONG} from '~/data/cache';
import {listLocalPolicies} from '~/data/policies.server';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

export async function loader({request}: LoaderFunctionArgs) {
  const policies = listLocalPolicies();

  if (policies.length === 0) {
    throw new Response('Not found', {status: 404});
  }

  const seo = seoPayload.policies({
    policies: policies as unknown as ShopPolicy[],
    url: request.url,
  });

  return json(
    {
      policies,
      seo,
    },
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
  const {policies} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Policies" />
      <Section padding="x" className="mb-24">
        {policies.map((policy) => {
          return (
            policy && (
              <Heading className="font-normal text-heading" key={policy.id}>
                <Link to={`/policies/${policy.handle}`}>{policy.title}</Link>
              </Heading>
            )
          );
        })}
      </Section>
    </>
  );
}
