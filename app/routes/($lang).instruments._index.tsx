import {useLoaderData, Link} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta, Image} from '@shopify/hydrogen';
import type {Collection, Product} from '@shopify/hydrogen/storefront-api-types';

import {getAllInstrumentSlugs, getSlugEntry} from '~/data/product-slugs';
import {getInstrumentArtworkPath} from '~/data/instrument-artwork';
import {getLfsProductSubtitle} from '~/data/lfs-product-metadata';
import {getModuleById} from '~/data/lzxdb';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

const EXCLUDED_INSTRUMENT_SLUGS = new Set([
  'andor-1-media-player',
  'double-vision',
  'double-vision-168',
  'double-vision-expander',
]);

const FORCE_LOCAL_SQUARE_ARTWORK_SLUGS = new Set([
  'chromagnon',
  'videomancer',
  'vidiot',
]);
const ACTIVE_INSTRUMENT_SLUGS = new Set(['videomancer', 'chromagnon']);
const LEGACY_INSTRUMENT_SLUGS = new Set(['vidiot']);

const INSTRUMENT_LISTING_ARTWORK_OVERRIDES: Record<string, string> = {
  videomancer: '/images/videomancer/hardware/photo-angle-front.png',
};

const MAX_PRODUCTS_PER_QUERY = 250;

const BITVISION_LEGACY_ENTRY = {
  canonical: 'bitvision',
  name: 'BitVision',
  subtitle: 'Compact Video Synthesizer for Audiovisualization',
  externalUrl: 'https://community.lzxindustries.net/t/all-about-bitvision-legacy/1353',
  hasInternalPage: false,
  isHidden: true,
  artworkPath: null,
  shopifyProduct: null,
};

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

type InstrumentListingEntry = {
  canonical: string;
  name: string;
  subtitle?: string | null;
  shopifyProduct?: InstrumentListingProduct | null;
  externalUrl?: string | null;
  hasInternalPage: boolean;
  isHidden: boolean;
  artworkPath?: string | null;
};

function buildHandleFilterQuery(handles: string[]): string {
  return handles.map((handle) => `handle:${handle}`).join(' OR ');
}

export function isListedInstrumentSlug(slug: string): boolean {
  return !EXCLUDED_INSTRUMENT_SLUGS.has(slug);
}

function sortInstrumentEntries<T extends {canonical: string; name: string}>(
  entries: T[],
) {
  return [...entries].sort((a, b) => a.name.localeCompare(b.name));
}

function getInstrumentListingArtworkPath(slug: string): string | null {
  return INSTRUMENT_LISTING_ARTWORK_OVERRIDES[slug] ?? getInstrumentArtworkPath(slug);
}

export async function loader({context, request}: LoaderFunctionArgs) {
  const slugs = getAllInstrumentSlugs();
  const entries = slugs
    .map((slug) => getSlugEntry(slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => isListedInstrumentSlug(entry.canonical));

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
      const subtitle = entry.moduleId
        ? getModuleById(entry.moduleId)?.subtitle ?? getLfsProductSubtitle(entry.name)
        : getLfsProductSubtitle(entry.name);

      return {
        canonical: entry.canonical,
        name: entry.name,
        isHidden: entry.isHidden,
        subtitle,
        shopifyProduct:
          (entry.shopifyGid ? productById.get(entry.shopifyGid) : undefined) ??
          productByHandle.get(entry.canonical) ??
          null,
        hasInternalPage: true,
        externalUrl: entry.externalUrl ?? null,
      };
    });

  const activeEntries = sortInstrumentEntries(
    listingEntries.filter((entry) => ACTIVE_INSTRUMENT_SLUGS.has(entry.canonical)),
  );
  const legacyEntries = sortInstrumentEntries(
    [
      ...listingEntries.filter((entry) => LEGACY_INSTRUMENT_SLUGS.has(entry.canonical)),
      BITVISION_LEGACY_ENTRY,
    ],
  );

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

  return json({activeEntries, legacyEntries, seo});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function InstrumentListingPage() {
  const {activeEntries, legacyEntries} = useLoaderData<typeof loader>();

  const renderEntries = (entries: InstrumentListingEntry[], legacy = false) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {entries.map((entry) => {
        const product = entry.shopifyProduct ?? null;
        const firstImage =
          product?.featuredImage ??
          product?.variants?.nodes?.[0]?.image;
        const localArtworkPath =
          entry.artworkPath ?? getInstrumentListingArtworkPath(entry.canonical);
        const shouldUseLocalSquareArtwork =
          Boolean(localArtworkPath) &&
          FORCE_LOCAL_SQUARE_ARTWORK_SLUGS.has(entry.canonical);
        const cardClasses =
          'group flex flex-col gap-3 rounded-lg border border-base-300 p-4 hover:shadow-md transition';

        const cardContent = (
          <>
            {shouldUseLocalSquareArtwork ? (
              <img
                src={localArtworkPath!}
                alt={`${entry.name} product image`}
                loading="lazy"
                className="aspect-square w-full rounded bg-base-200 object-contain p-2"
              />
            ) : firstImage ? (
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
              {entry.subtitle ? (
                <p className="mt-1 text-sm text-base-content/70 line-clamp-2">
                  {entry.subtitle}
                </p>
              ) : null}
              {legacy ? (
                <span className="badge badge-sm badge-ghost mt-1">Legacy</span>
              ) : null}
            </div>
          </>
        );

        if (entry.hasInternalPage) {
          return (
            <Link
              key={entry.canonical}
              to={`/instruments/${entry.canonical}`}
              prefetch="intent"
              className={cardClasses}
            >
              {cardContent}
            </Link>
          );
        }

        return (
          <a
            key={entry.canonical}
            href={entry.externalUrl ?? '#'}
            target="_blank"
            rel="noreferrer"
            className={cardClasses}
          >
            {cardContent}
          </a>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="font-bold text-3xl md:text-4xl uppercase mb-8">
        Instruments
      </h1>

      {activeEntries.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase mb-6">Active</h2>
          {renderEntries(activeEntries)}
        </section>
      ) : null}

      {legacyEntries.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold uppercase mb-6">Legacy</h2>
          {renderEntries(legacyEntries, true)}
        </section>
      ) : null}
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
