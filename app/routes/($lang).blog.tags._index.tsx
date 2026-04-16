import type {MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {CACHE_LONG} from '~/data/cache';
import {getAllTags} from '~/lib/content.server';
import {Breadcrumbs} from '~/components/Breadcrumbs';

export async function loader() {
  const allTags = getAllTags();

  const seo = {
    title: 'Blog Tags',
    titleTemplate: '%s | LZX Industries',
    description: 'Browse LZX Industries blog posts by topic.',
    jsonLd: {
      '@context': 'https://schema.org' as const,
      '@type': 'WebPage' as const,
      name: 'Blog Tags',
    },
  };

  return json(
    {allTags, seo},
    {headers: {'Cache-Control': CACHE_LONG}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function BlogTagsIndex() {
  const {allTags} = useLoaderData<typeof loader>();

  return (
    <>
      <Breadcrumbs
        items={[{label: 'Home', to: '/'}, {label: 'Blog', to: '/blog'}, {label: 'Tags'}]}
      />
      <div className="px-6 pb-16 md:px-10 lg:px-12 max-w-screen-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tags</h1>
        <div className="flex flex-wrap gap-3">
          {allTags.map(({tag, count}) => (
            <Link
              key={tag}
              to={`/blog/tags/${encodeURIComponent(tag)}`}
              className="badge badge-lg badge-outline hover:badge-primary transition-colors"
            >
              {tag} ({count})
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
