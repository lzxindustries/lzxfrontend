import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {CACHE_LONG} from '~/data/cache';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {listBlogPosts} from '~/lib/content.server';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';
import {seoPayload} from '~/lib/seo.server';

type ArtistCard = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  imageUrl: string | null;
  artistName: string;
};

function artistNameFromSlug(slug: string): string {
  return slug
    .replace(/^artist-feature-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function loader({request}: LoaderFunctionArgs) {
  const artistPosts = listBlogPosts()
    .filter((post) => post.slug.startsWith('artist-feature-'))
    .map((post) => {
      const imageFile = post.frontmatter.image
        ? String(post.frontmatter.image).replace(/^\.\//, '')
        : null;

      return {
        slug: post.slug,
        title: post.frontmatter.title ?? artistNameFromSlug(post.slug),
        date: post.date,
        excerpt: post.excerpt,
        imageUrl: imageFile ? `${post.imageBasePath}/${imageFile}` : null,
        artistName: artistNameFromSlug(post.slug),
      } as ArtistCard;
    });

  const seo = seoPayload.page({
    page: {
      title: 'Artists',
      seo: {
        title: 'Artists',
        description:
          'Featured artists and creators using LZX video synthesis instruments and modules.',
      },
    } as any,
    url: request.url,
  });

  return json({artistPosts, seo}, {headers: {'Cache-Control': CACHE_LONG}});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

export default function ArtistsPage() {
  const {artistPosts} = useLoaderData<typeof loader>();

  return (
    <>
      <Breadcrumbs items={[{label: 'Home', to: '/'}, {label: 'Artists'}]} />
      <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <div className="mb-8 rounded-xl border border-base-300 bg-base-200/50 p-4 md:p-5">
          <p className="text-sm text-base-content/80 md:text-base">
            Interested in an upcoming blog artist feature?{' '}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfbYgacfHYorGJjFF6B8he6Olj6lFVeO2dB9Rabpcdkkv1cpw/viewform"
              className="link link-primary font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit the artist feature application
            </a>
            .
          </p>
        </div>
        <h1 className="text-3xl font-bold mb-2">Artists</h1>
        <p className="text-base-content/70 mb-8">
          A growing archive of artists and video creators using LZX tools in
          their work.
        </p>

        {artistPosts.length === 0 ? (
          <p className="text-base-content/70">No artist features yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artistPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="overflow-hidden rounded-lg border border-base-300 transition hover:bg-base-200"
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.artistName}
                    className="h-52 w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wide text-base-content/60">
                    {post.date}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold leading-tight">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 text-sm text-base-content/70 line-clamp-3">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
