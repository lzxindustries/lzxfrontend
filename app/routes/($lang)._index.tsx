import {Link, useLoaderData, useRouteError, isRouteErrorResponse} from '@remix-run/react';
import type {SeoConfig} from '@shopify/hydrogen';
import {
  AnalyticsPageType,
  getSeoMeta,
} from '@shopify/hydrogen';
import type {Collection as CollectionType} from '@shopify/hydrogen/storefront-api-types';
import {json} from '@shopify/remix-oxygen';
import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {Grid} from '~/components/Grid';
import {Hero} from '~/components/Hero';
import {LiteYouTube} from '~/components/LiteYouTube';
import {ProductCard} from '~/components/ProductCard';
import {Section, PageHeader} from '~/components/Text';
import {VideomancyLandingSections} from '~/components/VideomancyLandingSections';
import {CACHE_LONG} from '~/data/cache';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {listBlogPosts} from '~/lib/content.server';
import {seoPayload} from '~/lib/seo.server';

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.data}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';
  return (
    <PageHeader heading="Error loading page">
      <p>{message}</p>
    </PageHeader>
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const seo = seoPayload.home();
  const recentPosts = listBlogPosts().slice(0, 3);

  const {storefront} = context;
  const data = await storefront.query<{
    collection: CollectionType;
  }>(ACTIVE_COLLECTION_QUERY, {
    variables: {
      handle: 'active',
      pageBy: 250,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data?.collection, 'No data returned from Shopify API');

  return json(
    {
      analytics: {
        pageType: AnalyticsPageType.home,
      },
      products: data.collection.products,
      recentPosts,
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_LONG,
        'Oxygen-Cache-Control':
          'public, max-age=3600, stale-while-revalidate=600',
      },
    },
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function Home() {
  const {products, recentPosts} = useLoaderData<typeof loader>();

  const sortedNodes = [...products.nodes].sort((a, b) => {
    // Pin Videomancer first
    const aPin = a.handle === 'videomancer' ? 1 : 0;
    const bPin = b.handle === 'videomancer' ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    const aQty = a.variants?.nodes?.[0]?.quantityAvailable ?? 0;
    const bQty = b.variants?.nodes?.[0]?.quantityAvailable ?? 0;
    const aInStock = aQty > 0 ? 1 : 0;
    const bInStock = bQty > 0 ? 1 : 0;
    return bInStock - aInStock;
  });

  return (
    <>
      <Hero />
      <section className="bg-black px-6 py-20 md:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-4xl">
          <div className="vm-reveal text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-mystic-light">
              Demo Reel
            </p>
            <h2 className="font-display text-xl font-black uppercase tracking-[0.1em] text-moonwax md:text-3xl">
              See it in action
            </h2>
          </div>
          <div className="vm-reveal vm-reveal-delay-1 mt-10">
            <LiteYouTube
              videoId="7cY8loTRU78"
              title="Videomancer Demo Reel"
              className="drop-shadow-[0_0_60px_rgba(80,76,159,0.25)]"
            />
          </div>
        </div>
      </section>
      <VideomancyLandingSections />

      <section className="px-6 py-14 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Updates
              </p>
              <h2 className="text-3xl font-bold">What's New</h2>
            </div>
            <Link to="/blog" className="btn btn-sm btn-outline">
              View All Posts
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="rounded-lg border border-base-300 p-4 transition hover:bg-base-200"
              >
                <p className="text-xs uppercase tracking-wide text-base-content/60">{post.date}</p>
                <h3 className="mt-2 text-lg font-semibold leading-tight">{post.frontmatter.title}</h3>
                {post.excerpt ? (
                  <p className="mt-2 text-sm text-base-content/70 line-clamp-3">{post.excerpt}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageHeader heading="Explore Our Catalog" variant="allCollections" />
      <Section>
        <Grid layout="products" data-test="product-grid">
          {sortedNodes.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              loading={getImageLoadingPriority(i)}
            />
          ))}
        </Grid>
      </Section>

      <section className="bg-base-200 px-6 py-16 md:px-10 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-10">
          <div>
            <h2 className="mb-4 text-2xl font-bold">About LZX Industries</h2>
            <p className="leading-relaxed">
              LZX Industries designs and manufactures analog and digital video
              synthesis instruments in Portland, Oregon. Our Eurorack-format
              modules give artists, musicians, and VJs real-time control over
              color, pattern, and motion — bridging the worlds of modular
              synthesis and visual art. Every product is engineered, assembled,
              and tested in-house.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold">
              What Is Video Synthesis?
            </h2>
            <p className="leading-relaxed">
              Video synthesis is the art of generating and manipulating video
              signals with electronic circuits. Unlike conventional video
              editing, a video synthesizer creates imagery from scratch —
              oscillators produce patterns, ramps define gradients, and
              voltage-controlled processors blend, key, and colorize signals
              in real time. The result is a live, performable visual
              instrument that responds to hands-on control and external audio.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold">Get Started</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <Link to="/getting-started" className="link link-primary">
                  Getting Started Guide
                </Link>{' '}
                — learn how to build your first video synthesis system.
              </li>
              <li>
                <Link to="/glossary" className="link link-primary">
                  Glossary
                </Link>{' '}
                — key terms and concepts in video synthesis.
              </li>
              <li>
                <Link to="/patches" className="link link-primary">
                  Patch Ideas
                </Link>{' '}
                — example patches and recipes for LZX modules.
              </li>

            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

const ACTIVE_COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query ActiveCollectionHome(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      products(first: $pageBy) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
`;
