import {useLoaderData} from '@remix-run/react';
import type {SeoConfig} from '@shopify/hydrogen';
import {
  AnalyticsPageType,
  getSeoMeta,
} from '@shopify/hydrogen';
import type {Collection as CollectionType} from '@shopify/hydrogen/storefront-api-types';
import {json} from '@shopify/remix-oxygen';
import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {Grid} from '~/components/Grid';
import {Hero} from '~/components/Hero';
import {ProductCard} from '~/components/ProductCard';
import {SocialProof} from '~/components/SocialProof';
import {Section, PageHeader} from '~/components/Text';
import {VideomancyLandingSections} from '~/components/VideomancyLandingSections';
import {CACHE_LONG} from '~/data/cache';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';

export async function loader({context}: LoaderFunctionArgs) {
  const seo = seoPayload.home();

  const {storefront} = context;
  const data = await storefront.query<{
    collection: CollectionType;
  }>(ACTIVE_COLLECTION_QUERY, {
    variables: {
      handle: 'active',
      pageBy: 250,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data?.collection, 'No data returned from Shopify API');

  return json(
    {
      analytics: {
        pageType: AnalyticsPageType.home,
      },
      products: data.collection.products,
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
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function Home() {
  const {products} = useLoaderData<typeof loader>();

  const sortedNodes = [...products.nodes].sort((a, b) => {
    // Pin Videomancer first
    const aPin = a.handle === 'videomancer' ? 1 : 0;
    const bPin = b.handle === 'videomancer' ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    const aQty = a.variants?.nodes?.[0]?.quantityAvailable ?? 0;
    const bQty = b.variants?.nodes?.[0]?.quantityAvailable ?? 0;
    const aInStock = aQty > 0 ? 1 : 0;
    const bInStock = bQty > 0 ? 1 : 0;
    return bInStock - aInStock;
  });

  return (
    <>
      <Hero />
      <VideomancyLandingSections />
      <PageHeader heading="Explore Our Catalog" variant="allCollections" />
      <Section>
        <Grid layout="products" data-test="product-grid">
          {sortedNodes.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              loading={getImageLoadingPriority(i)}
            />
          ))}
        </Grid>
      </Section>
      <SocialProof />
    </>
  );
}

const ACTIVE_COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query ActiveCollectionHome(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      products(first: $pageBy, sortKey: BEST_SELLING) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
`;
