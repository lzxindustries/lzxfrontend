import {Link, useLoaderData} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {Image, getSeoMeta, type SeoConfig} from '@shopify/hydrogen';
import type {Collection, Product} from '@shopify/hydrogen/storefront-api-types';

import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

const CASES_AND_POWER_SUBTITLE =
  'Cases, racks, busboards, and external power hardware for building, powering, and expanding LZX modular systems.';

const ACTIVE_SECTION_SUBTITLE =
  'Current enclosures and busboards for Gen3 systems, from compact racks to larger Vessel builds.';

const LEGACY_SECTION_SUBTITLE =
  'Earlier rack, distro, and OEM power parts preserved for compatibility with older systems and support workflows.';

const MAX_PRODUCTS_PER_QUERY = 250;

const CURATED_CASES_AND_POWER_ENTRIES = [
  {
    slug: 'vessel-84',
    name: 'Vessel 84',
    subtitle: '84HP EuroRack enclosure with 12V DC power and video sync distribution',
    imagePath: '/images/base-system-84-square.png',
    isActive: true,
  },
  {
    slug: 'vessel-168',
    name: 'Vessel 168',
    subtitle: '168HP EuroRack enclosure with 12V DC power and video sync distribution',
    imagePath: '/images/vessel168_photo_top_square2.png',
    isActive: true,
  },
  {
    slug: 'vessel-208',
    name: 'Vessel 208',
    subtitle: '208HP EuroRack enclosure with 12V DC power and video sync distribution',
    imagePath: null,
    isActive: true,
  },
  {
    slug: 'bus-168-diy-kit',
    name: 'Bus 168 DIY Kit',
    subtitle: 'DIY power and sync busboard for Vessel systems',
    imagePath: '/images/bus208_photo_top.png',
    isActive: true,
  },
  {
    slug: 'rack-84hp',
    name: 'Rack 84HP',
    subtitle: '84HP rack enclosure for desktop or 19" rack mounting',
    imagePath: '/images/rack-84.png',
    isActive: false,
  },
  {
    slug: 'dc-distro-3a',
    name: 'DC Distro 3A',
    subtitle: 'DC power distributor',
    imagePath: '/images/dc-distro-3a-front-panel-square.png',
    isActive: false,
  },
  {
    slug: 'dc-distro-5a',
    name: 'DC Distro 5A',
    subtitle: 'DC power distributor',
    imagePath: '/images/dc-distro-3a-front-panel-square.png',
    isActive: false,
  },
  {
    slug: '12v-dc-adapter-3a',
    name: '12V DC Adapter 3A',
    subtitle: '3A wall wart power supply with international plug kit',
    imagePath: '/images/12v-dc-wall-wart-adapter-set.png',
    isActive: false,
  },
  {
    slug: 'dc-power-cable',
    name: 'DC Power Cable',
    subtitle: '2.1mm DC jumper cables for module power distribution',
    imagePath: '/images/dc-power-cable-square.png',
    isActive: false,
  },
  {
    slug: 'power-entry-8hp',
    name: 'Power Entry 8HP',
    subtitle: 'OEM power entry assembly for 8HP and larger builds',
    imagePath: '/images/psu8-and-rear-panel.png',
    isActive: false,
  },
  {
    slug: 'power-sync-entry-12hp',
    name: 'Power & Sync Entry 12HP',
    subtitle: 'OEM power and sync entry assembly for 12HP and larger builds',
    imagePath: '/images/fpga12-and-rear-panel.png',
    isActive: false,
  },
  {
    slug: 'vessel-eurorack-psu-expander',
    name: 'Vessel EuroRack PSU Expander',
    subtitle: 'Legacy +/-12V power expander for Vessel cases',
    imagePath: null,
    isActive: false,
  },
] as const;

type CasesAndPowerProduct = Pick<Product, 'id' | 'title' | 'handle'> & {
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
    }>;
  };
};

type CasesAndPowerEntry = {
  slug: string;
  name: string;
  subtitle: string | null;
  imagePath: string | null;
  isActive: boolean;
  shopifyProduct: CasesAndPowerProduct | null;
};

function buildHandleFilterQuery(handles: string[]): string {
  return handles.map((handle) => `handle:${handle}`).join(' OR ');
}

export function getCasesAndPowerEntries(): Omit<
  CasesAndPowerEntry,
  'shopifyProduct'
>[] {
  return CURATED_CASES_AND_POWER_ENTRIES.map((entry) => ({...entry}));
}

export async function loader({context, request}: LoaderFunctionArgs) {
  const curatedEntries = getCasesAndPowerEntries();
  const handles = curatedEntries.map((entry) => entry.slug);
  const productByHandle = new Map<string, CasesAndPowerProduct>();

  if (handles.length > 0) {
    try {
      const handleFilterQuery = buildHandleFilterQuery(handles);
      const {products} = await context.storefront.query<{
        products: {nodes: CasesAndPowerProduct[]};
      }>(CASES_AND_POWER_QUERY, {
        variables: {
          first: Math.min(handles.length, MAX_PRODUCTS_PER_QUERY),
          query: handleFilterQuery,
          country: context.storefront.i18n.country,
          language: context.storefront.i18n.language,
        },
      });

      for (const product of products.nodes) {
        productByHandle.set(product.handle, product);
      }
    } catch (error) {
      console.error('Failed to load cases and power product data', error);
    }
  }

  const entries = curatedEntries.map((entry) => ({
    ...entry,
    shopifyProduct: productByHandle.get(entry.slug) ?? null,
  }));

  const activeEntries = entries.filter((entry) => entry.isActive);
  const legacyEntries = entries.filter((entry) => !entry.isActive);

  const seo = seoPayload.collection({
    collection: {
      id: 'cases-and-power',
      title: 'Cases & Power',
      handle: 'cases-and-power',
      description: CASES_AND_POWER_SUBTITLE,
      seo: {
        title: 'Cases & Power',
        description: CASES_AND_POWER_SUBTITLE,
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

function CasesAndPowerSection({
  title,
  subtitle,
  entries,
  legacy = false,
}: {
  title: string;
  subtitle: string;
  entries: CasesAndPowerEntry[];
  legacy?: boolean;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-1 border-b border-base-300 pb-2">
        {title}
      </h2>
      <p className="text-sm text-base-content/70 mb-4">{subtitle}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {entries.map((entry) => {
          const product = entry.shopifyProduct;
          const firstImage =
            product?.featuredImage ?? product?.variants?.nodes?.[0]?.image;
          const productPath = product?.handle ? `/products/${product.handle}` : null;
          const cardClasses =
            'group flex h-full flex-col gap-3 rounded-lg border border-base-300 p-4 transition hover:shadow-md';

          const cardContent = (
            <>
              {entry.imagePath ? (
                <img
                  src={entry.imagePath}
                  alt={`${entry.name} product image`}
                  loading="lazy"
                  className="aspect-square w-full rounded bg-base-200 object-contain p-2"
                />
              ) : firstImage ? (
                <Image
                  data={firstImage}
                  aspectRatio="1/1"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                  className="rounded bg-base-200 object-contain p-2"
                />
              ) : (
                <div className="aspect-square rounded bg-base-200 flex items-center justify-center text-base-content/30">
                  No image
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2">
                {legacy ? (
                  <span className="w-fit rounded-full bg-base-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-base-content/70">
                    Legacy
                  </span>
                ) : null}
                <div>
                  <div className="font-semibold text-sm transition group-hover:text-primary">
                    {entry.name}
                  </div>
                  {entry.subtitle ? (
                    <p className="mt-1 text-xs text-base-content/70 line-clamp-3">
                      {entry.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          );

          if (!productPath) {
            return (
              <div key={entry.slug} className={cardClasses}>
                {cardContent}
              </div>
            );
          }

          return (
            <Link
              key={entry.slug}
              to={productPath}
              prefetch="intent"
              className={cardClasses}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function CasesAndPowerPage() {
  const {activeEntries, legacyEntries} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="mb-2 font-bold text-3xl uppercase md:text-4xl">
        Cases & Power
      </h1>
      <p className="mb-8 max-w-3xl text-sm text-base-content/70 md:text-base">
        {CASES_AND_POWER_SUBTITLE}
      </p>

      <CasesAndPowerSection
        title="Active"
        subtitle={ACTIVE_SECTION_SUBTITLE}
        entries={activeEntries}
      />
      <CasesAndPowerSection
        title="Legacy"
        subtitle={LEGACY_SECTION_SUBTITLE}
        entries={legacyEntries}
        legacy
      />
    </div>
  );
}

const CASES_AND_POWER_FRAGMENT = `#graphql
  fragment CasesAndPowerProductFields on Product {
    id
    title
    handle
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
      }
    }
  }
`;

const CASES_AND_POWER_QUERY = `#graphql
  ${CASES_AND_POWER_FRAGMENT}
  query CasesAndPowerProducts(
    $first: Int!
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        ...CasesAndPowerProductFields
      }
    }
  }
`;