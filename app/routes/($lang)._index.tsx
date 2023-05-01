// import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
// import {Suspense} from 'react';
// import {Await, useLoaderData} from '@remix-run/react';
// import {ProductSwimlane, FeaturedCollections, Hero} from '~/components';
// import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
// import {getHeroPlaceholder} from '~/lib/placeholders';
// import {seoPayload} from '~/lib/seo.server';
// import type {
//   CollectionConnection,
//   ProductConnection,
// } from '@shopify/hydrogen/storefront-api-types';
// import {AnalyticsPageType} from '@shopify/hydrogen';
// import {routeHeaders, CACHE_SHORT} from '~/data/cache';
// import {type CollectionHero} from '~/components/Hero';

// interface HomeSeoData {
//   shop: {
//     name: string;
//     description: string;
//   };
// }

// export const headers = routeHeaders;

// export async function loader({params, context}: LoaderArgs) {
//   const {language, country} = context.storefront.i18n;

//   if (
//     params.lang &&
//     params.lang.toLowerCase() !== `${language}-${country}`.toLowerCase()
//   ) {
//     // If the lang URL param is defined, yet we still are on `EN-US`
//     // the the lang param must be invalid, send to the 404 page
//     throw new Response(null, {status: 404});
//   }

//   const {shop, hero} = await context.storefront.query<{
//     hero: CollectionHero;
//     shop: HomeSeoData;
//   }>(HOMEPAGE_SEO_QUERY, {
//     variables: {handle: 'freestyle'},
//   });

//   const seo = seoPayload.home();

//   return defer(
//     {
//       shop,
//       primaryHero: hero,
//       // These different queries are separated to illustrate how 3rd party content
//       // fetching can be optimized for both above and below the fold.
//       featuredProducts: context.storefront.query<{
//         products: ProductConnection;
//       }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
//         variables: {
//           /**
//            * Country and language properties are automatically injected
//            * into all queries. Passing them is unnecessary unless you
//            * want to override them from the following default:
//            */
//           country,
//           language,
//         },
//       }),
//       secondaryHero: context.storefront.query<{hero: CollectionHero}>(
//         COLLECTION_HERO_QUERY,
//         {
//           variables: {
//             handle: 'accessories',
//             country,
//             language,
//           },
//         },
//       ),
//       featuredCollections: context.storefront.query<{
//         collections: CollectionConnection;
//       }>(FEATURED_COLLECTIONS_QUERY, {
//         variables: {
//           country,
//           language,
//         },
//       }),
//       tertiaryHero: context.storefront.query<{hero: CollectionHero}>(
//         COLLECTION_HERO_QUERY,
//         {
//           variables: {
//             handle: 'modules',
//             country,
//             language,
//           },
//         },
//       ),
//       analytics: {
//         pageType: AnalyticsPageType.home,
//       },
//       seo,
//     },
//     {
//       headers: {
//         'Cache-Control': CACHE_SHORT,
//       },
//     },
//   );
// }

// export default function Homepage() {
//   const {
//     primaryHero,
//     secondaryHero,
//     tertiaryHero,
//     featuredCollections,
//     featuredProducts,
//   } = useLoaderData<typeof loader>();

//   // TODO: skeletons vs placeholders
//   const skeletons = getHeroPlaceholder([{}, {}, {}]);

//   return (
//     <>
//       {primaryHero && (
//         <Hero {...primaryHero} height="full" top loading="eager" />
//       )}

//       {featuredProducts && (
//         <Suspense>
//           <Await resolve={featuredProducts}>
//             {({products}) => {
//               if (!products?.nodes) return <></>;
//               return (
//                 <ProductSwimlane
//                   products={products.nodes}
//                   title="Featured Products"
//                   count={4}
//                 />
//               );
//             }}
//           </Await>
//         </Suspense>
//       )}

//       {secondaryHero && (
//         <Suspense fallback={<Hero {...skeletons[1]} />}>
//           <Await resolve={secondaryHero}>
//             {({hero}) => {
//               if (!hero) return <></>;
//               return <Hero {...hero} />;
//             }}
//           </Await>
//         </Suspense>
//       )}

//       {featuredCollections && (
//         <Suspense>
//           <Await resolve={featuredCollections}>
//             {({collections}) => {
//               if (!collections?.nodes) return <></>;
//               return (
//                 <FeaturedCollections
//                   collections={collections.nodes}
//                   title="Collections"
//                 />
//               );
//             }}
//           </Await>
//         </Suspense>
//       )}

//       {tertiaryHero && (
//         <Suspense fallback={<Hero {...skeletons[2]} />}>
//           <Await resolve={tertiaryHero}>
//             {({hero}) => {
//               if (!hero) return <></>;
//               return <Hero {...hero} />;
//             }}
//           </Await>
//         </Suspense>
//       )}
//     </>
//   );
// }

// const COLLECTION_CONTENT_FRAGMENT = `#graphql
//   ${MEDIA_FRAGMENT}
//   fragment CollectionContent on Collection {
//     id
//     handle
//     title
//     descriptionHtml
//     heading: metafield(namespace: "hero", key: "title") {
//       value
//     }
//     byline: metafield(namespace: "hero", key: "byline") {
//       value
//     }
//     cta: metafield(namespace: "hero", key: "cta") {
//       value
//     }
//     spread: metafield(namespace: "hero", key: "spread") {
//       reference {
//         ...Media
//       }
//     }
//     spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
//       reference {
//         ...Media
//       }
//     }
//   }
// `;

// const HOMEPAGE_SEO_QUERY = `#graphql
//   ${COLLECTION_CONTENT_FRAGMENT}
//   query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
//   @inContext(country: $country, language: $language) {
//     hero: collection(handle: $handle) {
//       ...CollectionContent
//     }
//     shop {
//       name
//       description
//     }
//   }
// `;

// const COLLECTION_HERO_QUERY = `#graphql
//   ${COLLECTION_CONTENT_FRAGMENT}
//   query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
//   @inContext(country: $country, language: $language) {
//     hero: collection(handle: $handle) {
//       ...CollectionContent
//     }
//   }
// `;

// // @see: https://shopify.dev/api/storefront/2023-04/queries/products
// export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
//   ${PRODUCT_CARD_FRAGMENT}
//   query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
//   @inContext(country: $country, language: $language) {
//     products(first: 100) {
//       nodes {
//         ...ProductCard
//       }
//     }
//   }
// `;

// // @see: https://shopify.dev/api/storefront/2023-04/queries/collections
// export const FEATURED_COLLECTIONS_QUERY = `#graphql
//   query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
//   @inContext(country: $country, language: $language) {
//     collections(
//       first: 4,
//       sortKey: UPDATED_AT
//     ) {
//       nodes {
//         id
//         title
//         handle
//         image {
//           altText
//           width
//           height
//           url
//         }
//       }
//     }
//   }
// `;
// import {json, type LoaderArgs} from '@shopify/remix-oxygen';
// import {useLoaderData} from '@remix-run/react';
// import type {
//   ProductConnection,
//   Collection,
// } from '@shopify/hydrogen/storefront-api-types';
// import invariant from 'tiny-invariant';
// import {
//   PageHeader,
//   Section,
//   ProductCard,
//   Grid,
//   Pagination,
//   getPaginationVariables,
//   Button,
// } from '~/components';
// import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
// import {getImageLoadingPriority} from '~/lib/const';
// import {seoPayload} from '~/lib/seo.server';
// import {routeHeaders, CACHE_SHORT} from '~/data/cache';

// const PAGE_BY = 32;

// export const headers = routeHeaders;

// export async function loader({request, context: {storefront}}: LoaderArgs) {
//   const variables = getPaginationVariables(request, PAGE_BY);

//   const data = await storefront.query<{
//     products: ProductConnection;
//   }>(ALL_PRODUCTS_QUERY, {
//     variables: {
//       ...variables,
//       country: storefront.i18n.country,
//       language: storefront.i18n.language,
//     },
//   });

//   invariant(data, 'No data returned from Shopify API');

//   const seoCollection = {
//     id: 'all-products',
//     title: 'All Products',
//     handle: 'products',
//     descriptionHtml: 'All the store products',
//     description: 'All the store products',
//     seo: {
//       title: 'All Products',
//       description: 'All the store products',
//     },
//     metafields: [],
//     products: data.products,
//     updatedAt: '',
//   } satisfies Collection;

//   const seo = seoPayload.collection({
//     collection: seoCollection,
//     url: request.url,
//   });

//   return json(
//     {
//       products: data.products,
//       seo,
//     },
//     {
//       headers: {
//         'Cache-Control': CACHE_SHORT,
//       },
//     },
//   );
// }

// export default function AllProducts() {
//   const {products} = useLoaderData<typeof loader>();

//   return (
//     <>
//       {/* <PageHeader heading="All Products" variant="allCollections" /> */}
//       <Section>
//         <Pagination connection={products}>
//           {({
//             endCursor,
//             hasNextPage,
//             hasPreviousPage,
//             nextPageUrl,
//             nodes,
//             prevPageUrl,
//             startCursor,
//             nextLinkRef,
//             isLoading,
//           }) => {
//             const itemsMarkup = nodes.map((product, i) => (
//               <ProductCard
//                 key={product.id}
//                 product={product}
//                 loading={getImageLoadingPriority(i)}
//               />
//             ));

//             return (
//               <>
//                 {hasPreviousPage && (
//                   <div className="flex items-center justify-center mt-6">
//                     <Button
//                       to={prevPageUrl}
//                       variant="secondary"
//                       prefetch="intent"
//                       width="full"
//                       disabled={!isLoading}
//                       state={{
//                         pageInfo: {
//                           endCursor,
//                           hasNextPage,
//                           startCursor,
//                         },
//                         nodes,
//                       }}
//                     >
//                       {isLoading ? 'Loading...' : 'Previous'}
//                     </Button>
//                   </div>
//                 )}
//                 <Grid layout="products" className="product-grid">{itemsMarkup}</Grid>
//                 {hasNextPage && (
//                   <div className="flex items-center justify-center mt-6">
//                     <Button
//                       ref={nextLinkRef}
//                       to={nextPageUrl}
//                       variant="secondary"
//                       prefetch="intent"
//                       width="full"
//                       disabled={!isLoading}
//                       state={{
//                         pageInfo: {
//                           endCursor,
//                           hasPreviousPage,
//                           startCursor,
//                         },
//                         nodes,
//                       }}
//                     >
//                       {isLoading ? 'Loading...' : 'Next'}
//                     </Button>
//                   </div>
//                 )}
//               </>
//             );
//           }}
//         </Pagination>
//       </Section>
//     </>
//   );
// }

// const ALL_PRODUCTS_QUERY = `#graphql
//   ${PRODUCT_CARD_FRAGMENT}
//   query AllProducts(
//     $country: CountryCode
//     $language: LanguageCode
//     $first: Int
//     $last: Int
//     $startCursor: String
//     $endCursor: String
//   ) @inContext(country: $country, language: $language) {
//     products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
//       nodes {
//         ...ProductCard
//       }
//       pageInfo {
//         hasPreviousPage
//         hasNextPage
//         startCursor
//         endCursor
//       }
//     }
//   }
// `;
import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import type {
  Collection as CollectionType,
  CollectionConnection,
  Filter,
} from '@shopify/hydrogen/storefront-api-types';
import {flattenConnection, AnalyticsPageType} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import {PageHeader, Section, Text, SortFilter} from '~/components';
import {ProductGrid} from '~/components/ProductGrid';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {CACHE_SHORT, routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import type {AppliedFilter, SortParam} from '~/components/SortFilter';

export const headers = routeHeaders;

const PAGINATION_SIZE = 48;

type VariantFilterParam = Record<string, string | boolean>;
type PriceFiltersQueryParam = Record<'price', {max?: number; min?: number}>;
type VariantOptionFiltersQueryParam = Record<
  'variantOption',
  {name: string; value: string}
>;
type FiltersQueryParams = Array<
  VariantFilterParam | PriceFiltersQueryParam | VariantOptionFiltersQueryParam
>;

export async function loader({params, request, context}: LoaderArgs) {
  // const {collectionHandle} = params;
  const collectionHandle = 'Gen3';

  invariant(collectionHandle, 'Missing collectionHandle param');

  const searchParams = new URL(request.url).searchParams;
  const knownFilters = ['productVendor', 'productType'];
  const available = 'available';
  const variantOption = 'variantOption';
  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );
  const cursor = searchParams.get('cursor');
  const filters: FiltersQueryParams = [];
  const appliedFilters: AppliedFilter[] = [];

  for (const [key, value] of searchParams.entries()) {
    if (available === key) {
      filters.push({available: value === 'true'});
      appliedFilters.push({
        label: value === 'true' ? 'In stock' : 'Out of stock',
        urlParam: {
          key: available,
          value,
        },
      });
    } else if (knownFilters.includes(key)) {
      filters.push({[key]: value});
      appliedFilters.push({label: value, urlParam: {key, value}});
    } else if (key.includes(variantOption)) {
      const [name, val] = value.split(':');
      filters.push({variantOption: {name, value: val}});
      appliedFilters.push({label: val, urlParam: {key, value}});
    }
  }

  // Builds min and max price filter since we can't stack them separately into
  // the filters array. See price filters limitations:
  // https://shopify.dev/custom-storefronts/products-collections/filter-products#limitations
  if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
    const price: {min?: number; max?: number} = {};
    if (searchParams.has('minPrice')) {
      price.min = Number(searchParams.get('minPrice')) || 0;
      appliedFilters.push({
        label: `Min: $${price.min}`,
        urlParam: {key: 'minPrice', value: searchParams.get('minPrice')!},
      });
    }
    if (searchParams.has('maxPrice')) {
      price.max = Number(searchParams.get('maxPrice')) || 0;
      appliedFilters.push({
        label: `Max: $${price.max}`,
        urlParam: {key: 'maxPrice', value: searchParams.get('maxPrice')!},
      });
    }
    filters.push({
      price,
    });
  }

  const {collection, collections} = await context.storefront.query<{
    collection: CollectionType;
    collections: CollectionConnection;
  }>(COLLECTION_QUERY, {
    variables: {
      handle: collectionHandle,
      pageBy: PAGINATION_SIZE,
      cursor,
      filters,
      sortKey,
      reverse,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!collection) {
    throw new Response('collection', {status: 404});
  }

  const collectionNodes = flattenConnection(collections);
  const seo = seoPayload.collection({collection, url: request.url});

  return json(
    {
      collection,
      appliedFilters,
      collections: collectionNodes,
      analytics: {
        pageType: AnalyticsPageType.collection,
        collectionHandle,
        resourceId: collection.id,
      },
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}

export default function Collection() {
  const {collection, collections, appliedFilters} =
    useLoaderData<typeof loader>();

  return (
    <>
      {/* <PageHeader heading={collection.title}>
        {collection?.description && (
          <div className="flex items-baseline justify-between w-full">
            <div>
              <Text format width="narrow" as="p" className="inline-block">
                {collection.description}
              </Text>
            </div>
          </div>
        )}
      </PageHeader> */}
      <Section>
        {/* <SortFilter
          filters={collection.products.filters as Filter[]}
          appliedFilters={appliedFilters}
          collections={collections as CollectionType[]}
        > */}
          <ProductGrid
            key={collection.id}
            collection={collection as CollectionType}
            url={`/collections/${collection.handle}`}
            data-test="product-grid"
          />
        {/* </SortFilter> */}
      </Section>
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        first: $pageBy,
        after: $cursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
`;

function getSortValuesFromParam(sortParam: SortParam | null) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
