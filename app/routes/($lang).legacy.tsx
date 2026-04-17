import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {getSeoMeta, Image, type SeoConfig} from '@shopify/hydrogen';
import {Link, useLoaderData} from '@remix-run/react';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {getModulesBySeries} from '~/data/product-slugs';
import {getModuleById} from '~/data/lzxdb';
import {seoPayload} from '~/lib/seo.server';

type LegacyEntry = {
  canonical: string;
  name: string;
  subtitle?: string;
  moduleId: string | null;
  shopifyProduct?: Product;
};

const MAX_PRODUCTS_PER_QUERY = 250;

function buildHandleFilterQuery(handles: string[]): string {
  return handles.map((handle) => `handle:${handle}`).join(' OR ');
}

export async function loader({context, request}: LoaderFunctionArgs) {
  const bySeriesMap = getModulesBySeries();
  const allEntries = [...bySeriesMap.values()].flat();
  const legacyEntries = allEntries.filter((e) => e.isHidden);
  const allHandles = legacyEntries.map((e) => e.canonical);

  const productMap = new Map<string, Product>();

  if (allHandles.length > 0) {
    try {
      const handleFilterQuery = buildHandleFilterQuery(allHandles);
      const {products} = await context.storefront.query<{
        products: {nodes: Product[]};
      }>(LEGACY_LISTING_QUERY, {
        variables: {
          first: Math.min(allHandles.length, MAX_PRODUCTS_PER_QUERY),
          query: handleFilterQuery,
          country: context.storefront.i18n.country,
          language: context.storefront.i18n.language,
        },
      });

      for (const p of products.nodes) {
        productMap.set(p.handle, p);
      }
    } catch (error) {
      console.error('Failed to load legacy module listing product data', error);
    }
  }

  const entries: LegacyEntry[] = legacyEntries
    .map((e) => ({
      canonical: e.canonical,
      name: e.name,
      subtitle: e.moduleId ? getModuleById(e.moduleId)?.subtitle : undefined,
      moduleId: e.moduleId,
      shopifyProduct: productMap.get(e.canonical),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const seo = seoPayload.page({
    page: {
      title: 'Legacy Modules',
      seo: {
        title: 'Legacy Modules',
        description:
          'Discontinued and legacy LZX modules with continued access to documentation and downloads.',
      },
    } as any,
    url: request.url,
  });

  return json({entries, seo});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function LegacyModulesPage() {
  const {entries} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="text-3xl font-bold mb-2">Legacy Modules</h1>
      <p className="text-base-content/70 mb-8">
        These modules are no longer in active production, but documentation and
        downloads remain available for existing owners and users.
      </p>

      {entries.length === 0 ? (
        <p className="text-base-content/70">No legacy modules found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {entries.map((entry) => {
            const image = entry.shopifyProduct?.variants?.nodes?.[0]?.image;
            return (
              <Link
                key={entry.canonical}
                to={`/modules/${entry.canonical}`}
                className="group rounded-lg border border-base-300 p-3 transition hover:shadow-md"
              >
                {image ? (
                  <Image
                    data={image}
                    aspectRatio="1/1"
                    className="rounded bg-base-200 object-cover"
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                  />
                ) : (
                  <div className="aspect-square rounded bg-base-200 flex items-center justify-center text-base-content/30">
                    No image
                  </div>
                )}

                <div className="mt-2">
                  <div className="font-semibold text-sm group-hover:text-primary transition">
                    {entry.name}
                  </div>
                  {entry.subtitle ? (
                    <p className="text-xs text-base-content/70 line-clamp-2 mt-0.5">
                      {entry.subtitle}
                    </p>
                  ) : null}
                  <span className="badge badge-sm badge-ghost mt-1">
                    Legacy
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const LEGACY_LISTING_QUERY = `#graphql
  query LegacyListing(
    $first: Int!
    $query: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        variants(first: 1) {
          nodes {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;
