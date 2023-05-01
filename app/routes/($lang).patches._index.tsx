// import {json, type LoaderArgs} from '@shopify/remix-oxygen';
// import {useLoaderData} from '@remix-run/react';
// import type {
//   ProductConnection,
//   Collection,
// } from '@shopify/hydrogen/storefront-api-types';
// import invariant from 'tiny-invariant';
import { db } from '~/lib/db'
import {
  PageHeader,
  Section,
  // ProductCard,
  // Grid,
  // Pagination,
  // getPaginationVariables,
  // Button,
  Text,
  Link,
} from '~/components';
// import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
// import {getImageLoadingPriority} from '~/lib/const';
// import {seoPayload} from '~/lib/seo.server';
import { routeHeaders, CACHE_SHORT } from '~/data/cache';

// const PAGE_BY = 8;

export const headers = routeHeaders;

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
//     id: 'all-patches',
//     title: 'All Patches',
//     handle: 'patches',
//     descriptionHtml: 'All the patches',
//     description: 'All the patches',
//     seo: {
//       title: 'All Patches',
//       description: 'All the patches',
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

export default function Patches() {



  return (
    <>
      <PageHeader heading="Patches" />
      <Section>
        {
          db.patches.map((patch, it) => {
            it = it + 1
            return (
              <>
                <div className="flex">
                  <Text as="h3">{patch.title}</Text>
                  <Text as="p">{patch.notes}</Text>
                  <Text as="p">{patch.diagram}</Text>
                  {patch.videos.map((video) => {
                    return <Text as="p"><Link to={'https://www.youtube.com/watch?v=' + video.youtube} >Video</Link></Text>
                  }
                  )}
                  {patch.artists.map((artist) => {
                    return <Text as="p">{artist.name}</Text>
                  }
                  )}
                  {patch.modules.map((module) => {
                    return <Text as="p"><Link to={'/products/' + module.title.toLowerCase()} >{module.title}</Link>, </Text>
                  }
                  )}
                </div>
              </>)
          })
        }
      </Section>
    </>
  );
}

