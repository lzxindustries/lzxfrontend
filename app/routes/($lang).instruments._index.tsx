import {useLoaderData, Link} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta, Image} from '@shopify/hydrogen';
import type {Collection, Product} from '@shopify/hydrogen/storefront-api-types';

import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getAllInstrumentSlugs, getSlugEntry} from '~/data/product-slugs';
import {getInstrumentArtworkPath} from '~/data/instrument-artwork';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

const MAX_PRODUCTS_PER_QUERY = 250;

type InstrumentListingProduct = Pick<Product, 'id' | 'title' | 'handle'> & {
  availableForSale?: boolean;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  variants?: {
    nodes?: Array<{
      id: string;
      image?: {
        url: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      } | null;
      price?: {amount: string; currencyCode: string};
    }>;
  };
};

function buildHandleFilterQuery(handles: string[]): string {
  return handles.map((handle) => `handle:${handle}`).join(' OR ');
}

export async function loader({context, request}: LoaderFunctionArgs) {
  const slugs = getAllInstrumentSlugs();
  const entries = slugs
    .map((slug) => getSlugEntry(slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const allHandles = entries.map((entry) => entry.canonical);
  const allShopifyIds = entries
    .map((entry) => entry.shopifyGid)
    .filter((id): id is string => Boolean(id));

  const productByHandle = new Map<string, InstrumentListingProduct>();
  const productById = new Map<string, InstrumentListingProduct>();

  if (allShopifyIds.length > 0) {
    try {
      const {nodes} = await context.storefront.query<{
        nodes: (InstrumentListingProduct | null)[];
      }>(INSTRUMENT_LISTING_BY_IDS_QUERY, {
        variables: {
          ids: allShopifyIds,
          country: context.storefront.i18n.country,
          language: context.storefront.i18n.language,
        },
      });

      for (const node of nodes) {
        if (!node) continue;
        productById.set(node.id, node);
        productByHandle.set(node.handle, node);
      }
    } catch (error) {
      console.error(
        'Failed to load instrument listing product data by IDs',
        error,
      );
    }
  }

  if (allHandles.length > 0) {
    try {
      const handleFilterQuery = buildHandleFilterQuery(allHandles);
      const {products} = await context.storefront.query<{
        products: {nodes: InstrumentListingProduct[]};
      }>(INSTRUMENT_LISTING_BY_HANDLES_QUERY, {
        variables: {
          first: Math.min(allHandles.length, MAX_PRODUCTS_PER_QUERY),
          query: handleFilterQuery,
          country: context.storefront.i18n.country,
          language: context.storefront.i18n.language,
        },
      });

      for (const product of products.nodes) {
        productByHandle.set(product.handle, product);
        productById.set(product.id, product);
      }
    } catch (error) {
      console.error(
        'Failed to load instrument listing product data by handles',
        error,
      );
    }
  }

  const listingEntries = entries
    .map((entry) => {
      return {
        ...entry,
        shopifyProduct:
          (entry.shopifyGid ? productById.get(entry.shopifyGid) : undefined) ??
          productByHandle.get(entry.canonical) ??
          null,
      };
    });

  const seo = seoPayload.collection({
    collection: {
      id: 'instruments',
      title: 'Instruments',
      handle: 'instruments',
      description: 'LZX Industries standalone video instruments',
      seo: {
        title: 'Instruments',
        description: 'LZX Industries standalone video instruments',
      },
      descriptionHtml: '',
      updatedAt: new Date().toISOString(),
      image: null,
    } as unknown as Collection,
    url: request.url,
  });

  return json({entries: listingEntries, seo});
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
          const product = entry.shopifyProduct as InstrumentListingProduct | null;
          const firstImage =
            product?.featuredImage ??
            product?.variants?.nodes?.[0]?.image;
          const localArtworkPath = getInstrumentArtworkPath(entry.canonical);

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
              ) : localArtworkPath ? (
                <img
                  src={localArtworkPath}
                  alt={`${entry.name} product image`}
                  loading="lazy"
                  className="aspect-video w-full rounded bg-base-200 object-cover"
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

const INSTRUMENT_LISTING_FRAGMENT = `#graphql
  fragment InstrumentListingProductFields on Product {
    id
    title
    handle
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
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
`;

const INSTRUMENT_LISTING_BY_IDS_QUERY = `#graphql
  ${INSTRUMENT_LISTING_FRAGMENT}
  query InstrumentListingByIds(
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...InstrumentListingProductFields
      }
    }
  }
`;

const INSTRUMENT_LISTING_BY_HANDLES_QUERY = `#graphql
  ${INSTRUMENT_LISTING_FRAGMENT}
  query InstrumentListingByHandles(
    $first: Int!
    $query: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        ...InstrumentListingProductFields
      }
    }
  }
`;
