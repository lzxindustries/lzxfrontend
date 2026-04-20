import {useLoaderData, Link} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import type {Collection, Product} from '@shopify/hydrogen/storefront-api-types';
import {Image} from '@shopify/hydrogen';

import {getModulesBySeries} from '~/data/product-slugs';
import type {SlugEntry} from '~/data/product-slugs';
import {getModuleArtworkPath} from '~/data/module-artwork';
import {getModuleById} from '~/data/lzxdb';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

const ACTIVE_SERIES_ORDER = ['pseries', 'gen3', 'castle'];
const LEGACY_SERIES_ORDER = [
  'orion',
  'visionary',
  'cadet',
  'expedition',
  'vhs',
  'legacy',
  'other',
];

const SERIES_LABELS: Record<string, string> = {
  pseries: 'P',
  gen3: 'Gen3',
  orion: 'Orion',
  visionary: 'Visionary',
  castle: 'Castle',
  cadet: 'Cadet',
  expedition: 'Expedition',
  vhs: 'Third Party',
  legacy: 'Legacy',
  other: 'Other',
};

const SERIES_SUBTITLES: Record<string, string> = {
  pseries:
    'Compact utility modules designed to solve everyday patching needs with minimal space and maximum flexibility. These are foundational building blocks for routing, buffering, and distribution.',
  gen3:
    'Gen3 defines the modern LZX core: high-precision color, keying, and signal processing modules built for contemporary video synthesis systems. This series is optimized for deep integration and performance.',
  castle:
    'Castle is a digital logic playground for video-rate pulse structures, counters, gates, and timing experiments. It brings modular logic synthesis into the visual domain with a playful, patch-programmable approach.',
  orion:
    'Orion explored expanded control and memory concepts for expressive visual composition. These modules bridge rhythmic structure, sequencing ideas, and performable modulation workflows.',
  visionary:
    'Visionary captures foundational LZX concepts that shaped early analog video patching techniques. The series remains a key reference point for historical workflows and classic signal behavior.',
  cadet:
    'Cadet offered a modular way to assemble a complete video synthesis voice from focused, single-purpose units. It emphasized accessibility, scalability, and educational clarity.',
  expedition:
    'Expedition documented a broad ecosystem of legacy modules from earlier eras of the platform. Together they represent a diverse toolkit of sync, processing, and image-generation techniques.',
  vhs:
    'Third-party companion modules developed for compatibility with the LZX ecosystem. This category is maintained as a historical reference for cross-platform patching workflows.',
  legacy:
    'Archival modules preserved for historical continuity and documentation access. These products are no longer active but remain important to legacy system owners.',
  other:
    'Special-case and archival modules that do not map cleanly to a single historical family. This section preserves discoverability for less common products.',
};

const MAX_PRODUCTS_PER_QUERY = 250;

type ModuleListingProduct = Pick<Product, 'id' | 'title' | 'handle'> & {
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
  const bySeriesMap = getModulesBySeries();
  const allEntries = [...bySeriesMap.values()].flat();

  const allHandles = allEntries.map((e) => e.canonical);
  const allShopifyIds = allEntries
    .map((e) => e.shopifyGid)
    .filter((id): id is string => Boolean(id));

  const productByHandle = new Map<string, ModuleListingProduct>();
  const productById = new Map<string, ModuleListingProduct>();

  // Primary fetch path: look up products by explicit Shopify GID to avoid
  // canonical-slug/handle mismatches.
  if (allShopifyIds.length > 0) {
    try {
      const {nodes} = await context.storefront.query<{
        nodes: (ModuleListingProduct | null)[];
      }>(MODULE_LISTING_BY_IDS_QUERY, {
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
      console.error('Failed to load module listing product data by IDs', error);
    }
  }

  // Secondary fetch path: handle-based lookup for products without a stored GID.
  if (allHandles.length > 0) {
    try {
      const handleFilterQuery = buildHandleFilterQuery(allHandles);
      const {products} = await context.storefront.query<{
        products: {nodes: ModuleListingProduct[]};
      }>(MODULE_LISTING_BY_HANDLES_QUERY, {
        variables: {
          first: Math.min(allHandles.length, MAX_PRODUCTS_PER_QUERY),
          query: handleFilterQuery,
          country: context.storefront.i18n.country,
          language: context.storefront.i18n.language,
        },
      });

      for (const p of products.nodes) {
        productByHandle.set(p.handle, p);
        productById.set(p.id, p);
      }
    } catch (error) {
      console.error(
        'Failed to load module listing product data by handles',
        error,
      );
    }
  }

  // Build serializable series groups
  const rawSeriesGroups: {
    key: string;
    label: string;
    entries: (SlugEntry & {shopifyProduct?: ModuleListingProduct; subtitle?: string})[];
  }[] = [];

  for (const key of [...ACTIVE_SERIES_ORDER, ...LEGACY_SERIES_ORDER]) {
    const entries = bySeriesMap.get(key);
    if (!entries || entries.length === 0) continue;
    rawSeriesGroups.push({
      key,
      label: SERIES_LABELS[key] ?? key,
      entries: [...entries]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((e) => ({
        ...e,
        shopifyProduct:
          (e.shopifyGid ? productById.get(e.shopifyGid) : undefined) ??
          productByHandle.get(e.canonical) ??
          undefined,
        subtitle: e.moduleId ? getModuleById(e.moduleId)?.subtitle : undefined,
      })),
    });
  }

  const activeSeriesGroups = rawSeriesGroups.filter((group) =>
    ACTIVE_SERIES_ORDER.includes(group.key),
  );
  const legacySeriesGroups = rawSeriesGroups.filter((group) =>
    LEGACY_SERIES_ORDER.includes(group.key),
  );

  const seo = seoPayload.collection({
    collection: {
      id: 'modules',
      title: 'Modules',
      handle: 'modules',
      description: 'LZX Industries eurorack video synthesis modules',
      seo: {
        title: 'Modules',
        description: 'LZX Industries eurorack video synthesis modules',
      },
      descriptionHtml: '',
      updatedAt: new Date().toISOString(),
      image: null,
    } as unknown as Collection,
    url: request.url,
  });

  return json({activeSeriesGroups, legacySeriesGroups, seo});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function ModuleListingPage() {
  const {activeSeriesGroups, legacySeriesGroups} = useLoaderData<typeof loader>();

  const renderSeriesGroup = (group: {
    key: string;
    label: string;
    entries: (SlugEntry & {shopifyProduct?: ModuleListingProduct; subtitle?: string})[];
  }) => (
    <section key={group.key} className="mb-12">
      <h2 className="text-xl font-semibold mb-1 border-b border-base-300 pb-2">
        {group.label} Series
      </h2>
      {SERIES_SUBTITLES[group.key] ? (
        <p className="text-sm text-base-content/70 mb-4">{SERIES_SUBTITLES[group.key]}</p>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {group.entries.map((entry) => {
          const product = (entry as any).shopifyProduct as
            | ModuleListingProduct
            | undefined;
          const firstImage =
            (product as any)?.featuredImage ?? product?.variants?.nodes?.[0]?.image;
          const localArtworkPath = getModuleArtworkPath(entry.canonical);

          return (
            <Link
              key={entry.canonical}
              to={`/modules/${entry.canonical}`}
              prefetch="intent"
              className="group flex flex-col gap-2 rounded-lg border border-base-300 p-3 hover:shadow-md transition"
            >
              {localArtworkPath ? (
                <img
                  src={localArtworkPath}
                  alt={`${entry.name} front panel`}
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
                {!ACTIVE_SERIES_ORDER.includes(group.key) && (
                  <span className="badge badge-sm badge-ghost mt-1">Legacy</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="font-bold text-3xl md:text-4xl uppercase mb-8">Modules</h1>

      {activeSeriesGroups.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase mb-6">Active</h2>
          {activeSeriesGroups.map((group) => renderSeriesGroup(group))}
        </section>
      ) : null}

      {legacySeriesGroups.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold uppercase mb-6">Legacy</h2>
          {legacySeriesGroups.map((group) => renderSeriesGroup(group))}
        </section>
      ) : null}
    </div>
  );
}

const MODULE_LISTING_FRAGMENT = `#graphql
  fragment ModuleListingProductFields on Product {
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

const MODULE_LISTING_BY_IDS_QUERY = `#graphql
  ${MODULE_LISTING_FRAGMENT}
  query ModuleListingByIds(
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...ModuleListingProductFields
      }
    }
  }
`;

const MODULE_LISTING_BY_HANDLES_QUERY = `#graphql
  ${MODULE_LISTING_FRAGMENT}
  query ModuleListing(
    $first: Int!
    $query: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        ...ModuleListingProductFields
      }
    }
  }
`;
