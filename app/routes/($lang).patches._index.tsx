// import {json, type LoaderArgs} from '@shopify/remix-oxygen';
// import {useLoaderData} from '@remix-run/react';
// import type {
//   ProductConnection,
//   Collection,
// } from '@shopify/hydrogen/storefront-api-types';
// import invariant from 'tiny-invariant';
import YouTube from 'react-youtube';
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
      {
        db.patches.map((patch) => {
          return (
            <>
              <Section>
                  <h3>{patch.title}</h3>
                  <p>{patch.notes}</p>
                  <p><img src={patch.diagram} /></p>
                  {patch.videos.map((video) => {
                    return <p><YouTube videoId={video.youtube} /></p>
                  })}
                  <p><b>Artists </b>
                    {patch.artists.map((artist) => {
                      return (<>{artist.name + ', '}</>)
                    })}
                  </p>
                  <p><b>Modules </b>
                    {patch.modules.map((module) => {
                      return (<><Link to={'/products/' + module.title.toLowerCase()} >{module.title}</Link>, </>)
                    })}
                  </p>
              </Section>
            </>)
        })
      }
    </>
  );
}

