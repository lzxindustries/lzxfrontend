// import {json, type LoaderArgs} from '@shopify/remix-oxygen';
// import {useLoaderData} from '@remix-run/react';
// import type {
//   ProductConnection,
//   Collection,
// } from '@shopify/hydrogen/storefront-api-types';
// import invariant from 'tiny-invariant';
import YouTube from 'react-youtube';
import { Grid } from '~/components'
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
      <Section className="py-0">
        <Grid layout='patches' className="py-0">
          {
            db.patches.map((patch) => {
              return (
                <>
                  <div>
                    <Text as="h3" className="w-full" color="primary"><b>{patch.title}</b></Text>
                    {patch.videos.map((video) => {
                      return <YouTube className="aspect-video" opts={{ height: 90, width: 160, playerVars: { autoplay: 1 } }} iframeClassName="aspect-video" videoId={video.youtube} />
                    })}
                    <Link target="_blank" to={patch.diagram}><img className="h-16" src={patch.diagram} /></Link>
                    <p><Text color="primary">Artists </Text>
                      <Text color="subtle">
                        {patch.artists.map((artist) => {
                          return (<>{artist.name + ''}</>)
                        })}
                      </Text>
                    </p>
                    <p><Text color="primary">Modules </Text>
                      <Text color="subtle">
                        {patch.modules.map((module) => {
                          return (<><Link to={'/products/' + module.title.toLowerCase()} >{module.title}</Link> </>)
                        })}
                      </Text>
                    </p>
                    <p className="w-full">{patch.notes}</p>
                  </div>
                </>)
            })
          }
        </Grid>
      </Section>
    </>
  );
}

