import {useLoaderData, Link} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import type {Collection, Product} from '@shopify/hydrogen/storefront-api-types';
import {Image} from '@shopify/hydrogen';

import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getModulesBySeries} from '~/data/product-slugs';
import type {SlugEntry} from '~/data/product-slugs';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

const SERIES_ORDER = [
  'gen3',
  'orion',
  'visionary',
  'castle',
  'cadet',
  'expedition',
  'vhs',
  'legacy',
  'other',
];

const SERIES_LABELS: Record<string, string> = {
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

export async function loader({context, request}: LoaderFunctionArgs) {
  const bySeriesMap = getModulesBySeries();
  const allHandles = [...bySeriesMap.values()]
    .flat()
    .filter((e) => !e.isHidden)
    .map((e) => e.canonical);

  // Batch-fetch Shopify products for images/prices
  const {products} = await context.storefront.query<{
    products: {nodes: Product[]};
  }>(MODULE_LISTING_QUERY, {
    variables: {
      first: allHandles.length + 10,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  const productMap = new Map<string, Product>();
  for (const p of products.nodes) {
    productMap.set(p.handle, p);
  }

  // Build serializable series groups
  const seriesGroups: {
    key: string;
    label: string;
    entries: (SlugEntry & {shopifyProduct?: Product})[];
  }[] = [];

  for (const key of SERIES_ORDER) {
    const entries = bySeriesMap.get(key);
    if (!entries || entries.length === 0) continue;
    seriesGroups.push({
      key,
      label: SERIES_LABELS[key] ?? key,
      entries: entries.map((e) => ({
        ...e,
        shopifyProduct: productMap.get(e.canonical) ?? undefined,
      })),
    });
  }

  const seo = seoPayload.collection({
    collection: {
      id: 'modules',
      title: 'Modules',
      handle: 'modules',
      description: 'LZX Industries eurorack video synthesis modules',
      seo: {title: 'Modules', description: 'LZX Industries eurorack video synthesis modules'},
      descriptionHtml: '',
      updatedAt: new Date().toISOString(),
      image: null,
    } as unknown as Collection,
    url: request.url,
  });

  return json({seriesGroups, seo});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function ModuleListingPage() {
  const {seriesGroups} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="font-bold text-3xl md:text-4xl uppercase mb-8">
        Modules
      </h1>

      {seriesGroups.map((group) => (
        <section key={group.key} className="mb-12">
          <h2 className="text-xl font-semibold mb-4 border-b border-base-300 pb-2">
            {group.label} Series
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {group.entries.map((entry) => {
              const product = (entry as any).shopifyProduct as
                | Product
                | undefined;
              const firstImage = product?.variants?.nodes?.[0]?.image;

              return (
                <Link
                  key={entry.canonical}
                  to={`/modules/${entry.canonical}`}
                  prefetch="intent"
                  className="group flex flex-col gap-2 rounded-lg border border-base-300 p-3 hover:shadow-md transition"
                >
                  {firstImage ? (
                    <Image
                      data={firstImage}
                      aspectRatio="1/1"
                      sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                      className="rounded bg-base-200 object-cover"
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
                    {entry.isHidden && (
                      <span className="badge badge-sm badge-ghost mt-1">
                        Legacy
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

const MODULE_LISTING_QUERY = `#graphql
  query ModuleListing(
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
