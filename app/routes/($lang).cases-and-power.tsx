import {Link, useLoaderData} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {Image, getSeoMeta, type SeoConfig} from '@shopify/hydrogen';
import type {Collection, Product} from '@shopify/hydrogen/storefront-api-types';

import {routeHeaders} from '~/data/cache';
import {getLfsProductMetadataBySlug} from '~/data/lfs-product-metadata';
import {seoPayload} from '~/lib/seo.server';

export const headers = routeHeaders;

const CASES_AND_POWER_SUBTITLE =
  'Cases, racks, busboards, and external power hardware for building, powering, and expanding LZX modular systems.';

const ACTIVE_SECTION_SUBTITLE =
  'Current enclosures and busboards for Gen3 systems, from compact racks to larger Vessel builds.';

const LEGACY_SECTION_SUBTITLE =
  'Earlier rack, distro, and OEM power parts preserved for compatibility with older systems and support workflows.';

const CURATED_CASES_AND_POWER_ENTRIES = [
  {
    slug: 'vessel-84',
    imagePath: '/images/base-system-84-square.png',
  },
  {
    slug: 'vessel-168',
    imagePath: '/images/vessel168_photo_top_square2.png',
  },
  {
    slug: 'vessel-208',
  },
  {
    slug: 'bus-168-diy-kit',
    imagePath: '/images/bus208_photo_top.png',
    subtitle: 'DIY power and sync busboard for Vessel systems',
  },
  {
    slug: 'dc-distro-3a',
    imagePath: '/images/dc-distro-3a-front-panel-square.png',
  },
  {
    slug: 'rack-84hp',
    imagePath: '/images/rack-84.png',
    subtitle: '84HP rack enclosure for desktop or 19" rack mounting',
  },
  {
    slug: '12v-dc-adapter-3a',
    imagePath: '/images/12v-dc-wall-wart-adapter-set.png',
    subtitle: '3A wall wart power supply with international plug kit',
  },
  {
    slug: 'vessel-eurorack-psu-expander',
    subtitle: 'Legacy +/-12V power expander for Vessel cases',
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
  shopifyId: string | null;
  shopifyProduct: CasesAndPowerProduct | null;
};

function getCuratedEntries(): Omit<CasesAndPowerEntry, 'shopifyProduct'>[] {
  return CURATED_CASES_AND_POWER_ENTRIES.flatMap((entry) => {
    const metadata = getLfsProductMetadataBySlug(entry.slug);

    if (!metadata) return [];

    return [
      {
        slug: metadata.slug,
        name: metadata.name,
        subtitle: entry.subtitle ?? metadata.subtitle ?? null,
        imagePath: entry.imagePath ?? null,
        isActive: metadata.isActive,
        shopifyId: metadata.shopifyId,
      },
    ];
  });
}

export async function loader({context, request}: LoaderFunctionArgs) {
  const curatedEntries = getCuratedEntries();
  const shopifyIds = curatedEntries
    .map((entry) => entry.shopifyId)
    .filter((id): id is string => Boolean(id));

  const productById = new Map<string, CasesAndPowerProduct>();

  if (shopifyIds.length > 0) {
    try {
      const {nodes} = await context.storefront.query<{
        nodes: (CasesAndPowerProduct | null)[];
      }>(CASES_AND_POWER_QUERY, {
        variables: {
          ids: shopifyIds,
          country: context.storefront.i18n.country,
          language: context.storefront.i18n.language,
        },
      });

      for (const node of nodes) {
        if (!node) continue;
        productById.set(node.id, node);
      }
    } catch (error) {
      console.error('Failed to load cases and power product data', error);
    }
  }

  const entries = curatedEntries.map((entry) => ({
    ...entry,
    shopifyProduct: entry.shopifyId ? productById.get(entry.shopifyId) ?? null : null,
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
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...CasesAndPowerProductFields
      }
    }
  }
`;