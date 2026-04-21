import {Link, useLoaderData} from '@remix-run/react';
import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {getSeoMeta, Image, type SeoConfig} from '@shopify/hydrogen';
import type {Collection, Product} from '@shopify/hydrogen/storefront-api-types';

import {routeHeaders} from '~/data/cache';
import {getInstrumentArtworkPath} from '~/data/instrument-artwork';
import {getModuleById} from '~/data/lzxdb';
import {
  getSlugEntry,
  resolveHubUrlForSlug,
  type SlugEntry,
} from '~/data/product-slugs';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

const SYSTEM_SLUGS = [
  'double-vision',
  'double-vision-168',
  'double-vision-expander',
] as const;

const SYSTEMS_SUBTITLE =
  'Double Vision brings the modern Gen3 video synthesis platform into complete instruments and expandable system formats, from the base desktop configuration to larger racks and companion expansion.';

const MAX_PRODUCTS_PER_QUERY = 250;

type SystemsListingProduct = Pick<Product, 'id' | 'title' | 'handle'> & {
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

type SystemsListingEntry = SlugEntry & {
  shopifyProduct?: SystemsListingProduct | null;
  subtitle?: string;
};

function buildHandleFilterQuery(handles: string[]): string {
  return handles.map((handle) => `handle:${handle}`).join(' OR ');
}

export async function loader({context, request}: LoaderFunctionArgs) {
  const entries = SYSTEM_SLUGS.map((slug) => getSlugEntry(slug)).filter(
    (entry): entry is SlugEntry => Boolean(entry),
  );

  const allHandles = entries.map((entry) => entry.canonical);
  const allShopifyIds = entries
    .map((entry) => entry.shopifyGid)
    .filter((id): id is string => Boolean(id));

  const productByHandle = new Map<string, SystemsListingProduct>();
  const productById = new Map<string, SystemsListingProduct>();

  if (allShopifyIds.length > 0) {
    try {
      const {nodes} = await context.storefront.query<{
        nodes: (SystemsListingProduct | null)[];
      }>(SYSTEMS_LISTING_BY_IDS_QUERY, {
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
      console.error('Failed to load systems listing product data by IDs', error);
    }
  }

  if (allHandles.length > 0) {
    try {
      const handleFilterQuery = buildHandleFilterQuery(allHandles);
      const {products} = await context.storefront.query<{
        products: {nodes: SystemsListingProduct[]};
      }>(SYSTEMS_LISTING_BY_HANDLES_QUERY, {
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
        'Failed to load systems listing product data by handles',
        error,
      );
    }
  }

  const entriesWithProductData: SystemsListingEntry[] = entries.map((entry) => ({
    ...entry,
    subtitle: entry.moduleId ? getModuleById(entry.moduleId)?.subtitle : undefined,
    shopifyProduct:
      (entry.shopifyGid ? productById.get(entry.shopifyGid) : undefined) ??
      productByHandle.get(entry.canonical) ??
      null,
  }));

  const seo = seoPayload.page({
    page: {
      title: 'Systems',
      seo: {
        title: 'Systems',
        description:
          'Double Vision Gen3 systems and expansion configurations.',
      },
    } as Collection,
    url: request.url,
  });

  return json({entries: entriesWithProductData, seo});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function SystemsPage() {
  const {entries} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="font-bold text-3xl md:text-4xl uppercase mb-8">Systems</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-1 border-b border-base-300 pb-2">
          Gen3 Series
        </h2>
        <p className="text-sm text-base-content/70 mb-4">{SYSTEMS_SUBTITLE}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {entries.map((entry) => {
            const product = entry.shopifyProduct ?? undefined;
            const firstImage =
              product?.featuredImage ?? product?.variants?.nodes?.[0]?.image;
            const localArtworkPath = getInstrumentArtworkPath(entry.canonical);

            return (
              <Link
                key={entry.canonical}
                to={resolveHubUrlForSlug(entry.canonical)}
                prefetch="intent"
                className="group flex flex-col gap-2 rounded-lg border border-base-300 p-3 hover:shadow-md transition"
              >
                {localArtworkPath ? (
                  <img
                    src={localArtworkPath}
                    alt={`${entry.name} product image`}
                    loading="lazy"
                    className="aspect-square w-full rounded bg-base-200 object-contain p-2"
                  />
                ) : firstImage ? (
                  <Image
                    data={firstImage}
                    aspectRatio="1/1"
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                    className="rounded bg-base-200 object-contain p-2"
                  />
                ) : (
                  <div className="aspect-square rounded bg-base-200 flex items-center justify-center text-base-content/30">
                    No image
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm group-hover:text-primary transition">
                    {entry.name}
                  </div>
                  {entry.subtitle ? (
                    <p className="text-xs text-base-content/70 line-clamp-2 mt-0.5">
                      {entry.subtitle}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const SYSTEMS_LISTING_FRAGMENT = `#graphql
  fragment SystemsListingProductFields on Product {
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

const SYSTEMS_LISTING_BY_IDS_QUERY = `#graphql
  ${SYSTEMS_LISTING_FRAGMENT}
  query SystemsListingByIds(
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...SystemsListingProductFields
      }
    }
  }
`;

const SYSTEMS_LISTING_BY_HANDLES_QUERY = `#graphql
  ${SYSTEMS_LISTING_FRAGMENT}
  query SystemsListingByHandles(
    $first: Int!
    $query: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        ...SystemsListingProductFields
      }
    }
  }
`;
