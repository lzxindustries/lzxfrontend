import {useLoaderData, Link} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta, Image} from '@shopify/hydrogen';
import type {Collection, Product} from '@shopify/hydrogen/storefront-api-types';

import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getAllInstrumentSlugs, getSlugEntry} from '~/data/product-slugs';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader({context, request}: LoaderFunctionArgs) {
  const slugs = getAllInstrumentSlugs();

  // Fetch Shopify product data for images/prices
  const {products} = await context.storefront.query<{
    products: {nodes: Product[]};
  }>(INSTRUMENT_LISTING_QUERY, {
    variables: {
      first: slugs.length + 10,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  const productMap = new Map<string, Product>();
  for (const p of products.nodes) {
    productMap.set(p.handle, p);
  }

  const entries = slugs
    .map((s) => {
      const entry = getSlugEntry(s);
      if (!entry) return null;
      return {
        ...entry,
        shopifyProduct: productMap.get(entry.canonical) ?? null,
      };
    })
    .filter(Boolean);

  const seo = seoPayload.collection({
    collection: {
      id: 'instruments',
      title: 'Instruments',
      handle: 'instruments',
      description: 'LZX Industries standalone video instruments',
      seo: {title: 'Instruments', description: 'LZX Industries standalone video instruments'},
      descriptionHtml: '',
      updatedAt: new Date().toISOString(),
      image: null,
    } as unknown as Collection,
    url: request.url,
  });

  return json({entries, seo});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function InstrumentListingPage() {
  const {entries} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="font-bold text-3xl md:text-4xl uppercase mb-8">
        Instruments
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {entries.map((entry: any) => {
          const product = entry.shopifyProduct as Product | null;
          const firstImage = product?.variants?.nodes?.[0]?.image;

          return (
            <Link
              key={entry.canonical}
              to={`/instruments/${entry.canonical}`}
              prefetch="intent"
              className="group flex flex-col gap-3 rounded-lg border border-base-300 p-4 hover:shadow-md transition"
            >
              {firstImage ? (
                <Image
                  data={firstImage}
                  aspectRatio="16/9"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="rounded bg-base-200 object-cover"
                />
              ) : (
                <div className="aspect-video rounded bg-base-200 flex items-center justify-center text-base-content/30">
                  No image
                </div>
              )}
              <div>
                <div className="font-semibold text-lg group-hover:text-primary transition">
                  {entry.name}
                </div>
                {entry.isHidden && (
                  <span className="badge badge-sm badge-ghost mt-1">
                    Discontinued
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const INSTRUMENT_LISTING_QUERY = `#graphql
  query InstrumentListing(
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        availableForSale
        variants(first: 1) {
          nodes {
            id
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
