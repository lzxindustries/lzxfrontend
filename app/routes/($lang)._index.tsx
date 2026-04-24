import {
  Link,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import {AnalyticsPageType} from '@shopify/hydrogen';
import type {Collection as CollectionType} from '@shopify/hydrogen/storefront-api-types';
import {json} from '@shopify/remix-oxygen';
import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {
  FaBook,
  FaCubes,
  FaSuitcase,
  FaPuzzlePiece,
  FaComments,
} from 'react-icons/fa';
import {Grid} from '~/components/Grid';
import {Hero} from '~/components/Hero';
import {LiteYouTube} from '~/components/LiteYouTube';
import {NotFound} from '~/components/NotFound';
import {ProductCard} from '~/components/ProductCard';
import {VideomancyLandingSections} from '~/components/VideomancyLandingSections';
import {Section, PageHeader} from '~/components/Text';
import {CACHE_LONG} from '~/data/cache';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {listBlogPosts} from '~/lib/content.server';
import {formatBlogPostDate} from '~/lib/blog-formatting';
import {VALID_LOCALE_PATH_SEGMENTS} from '~/lib/locale-paths';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';
import {seoPayload} from '~/lib/seo.server';

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound type="page" />;
  }
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

export async function loader({
  context,
  request,
  params,
}: LoaderFunctionArgs) {
  const lang = params.lang;
  if (
    lang &&
    !VALID_LOCALE_PATH_SEGMENTS.has(String(lang).toLowerCase())
  ) {
    throw new Response(null, {status: 404});
  }

  const origin = new URL(request.url).origin;
  const seo = seoPayload.home({origin});
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
  return seoMetaFromLoaderData(data);
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

      {/* Product Categories */}
      <section className="px-6 py-14 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Explore Our Products
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              to="/modules"
              className="group card bg-base-200 hover:bg-base-300 transition-colors p-8 text-center"
            >
              <FaCubes className="mx-auto mb-4 text-4xl text-primary" />
              <h3 className="text-xl font-bold mb-2">Modules</h3>
              <p className="text-sm opacity-70">
                Eurorack-format video synthesis modules — build your system one
                module at a time.
              </p>
            </Link>
            <Link
              to="/catalog"
              className="group card bg-base-200 hover:bg-base-300 transition-colors p-8 text-center"
            >
              <FaSuitcase className="mx-auto mb-4 text-4xl text-primary" />
              <h3 className="text-xl font-bold mb-2">Shop All</h3>
              <p className="text-sm opacity-70">
                Browse our full catalog of instruments, modules, cases, and
                accessories.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* What's New */}
      <section className="bg-base-200 px-6 py-14 md:px-10 lg:px-12">
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
                className="rounded-lg border border-base-300 bg-base-100 p-4 transition hover:bg-base-300"
              >
                <p className="text-xs uppercase tracking-wide text-base-content/60">
                  <time dateTime={post.date}>{formatBlogPostDate(post.date)}</time>
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-tight">
                  {post.frontmatter.title}
                </h3>
                {post.excerpt ? (
                  <p className="mt-2 text-sm text-base-content/70 line-clamp-3">
                    {post.excerpt}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog */}
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

      {/* Getting Started CTA */}
      <section className="bg-contrast px-6 py-16 text-primary md:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <FaBook className="mx-auto mb-4 text-4xl" />
          <h2 className="text-3xl font-bold mb-4">
            New to Video Synthesis?
          </h2>
          <p className="mb-6 text-lg opacity-90">
            Learn how to build your first video synthesis system, understand
            the fundamentals, and start creating with our step-by-step guides.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/getting-started"
              className="btn btn-lg border-0 bg-primary text-contrast hover:bg-primary/90"
            >
              Getting Started Guide
            </Link>
            <Link
              to="/instruments/videomancer/setup"
              className="btn btn-lg btn-outline border-primary text-primary hover:bg-primary/10"
            >
              Set Up Videomancer
            </Link>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="px-6 py-14 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Join the Community
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              to="/patches"
              className="card bg-base-200 hover:bg-base-300 transition-colors p-6 text-center"
            >
              <FaPuzzlePiece className="mx-auto mb-3 text-3xl text-primary" />
              <h3 className="text-lg font-bold mb-1">Patch Ideas</h3>
              <p className="text-sm opacity-70">
                Example patches and recipes for LZX modules.
              </p>
            </Link>
            <a
              href="https://community.lzxindustries.net"
              target="_blank"
              rel="noreferrer"
              className="card bg-base-200 hover:bg-base-300 transition-colors p-6 text-center"
            >
              <FaComments className="mx-auto mb-3 text-3xl text-primary" />
              <h3 className="text-lg font-bold mb-1">Forum</h3>
              <p className="text-sm opacity-70">
                Ask questions, share patches, and connect with other video
                synthesists.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* About */}
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
              voltage-controlled processors blend, key, and colorize signals in
              real time. The result is a live, performable visual instrument
              that responds to hands-on control and external audio.
            </p>
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
