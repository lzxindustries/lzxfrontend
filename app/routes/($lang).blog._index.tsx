import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {CACHE_LONG} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {listBlogPosts, getAllTags} from '~/lib/content.server';
import {BlogIndex} from '~/components/BlogLayout';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

const POSTS_PER_PAGE = 10;

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const requestedPage = Math.max(
    1,
    parseInt(url.searchParams.get('page') ?? '1', 10),
  );

  const allPosts = listBlogPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);
  const posts = allPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  );
  const allTags = getAllTags();

  const seo = seoPayload.blogIndex({
    url: url.origin + '/blog',
  });

  return json(
    {posts, page, totalPages, allTags, seo},
    {headers: {'Cache-Control': CACHE_LONG}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

export default function BlogIndexPage() {
  const {posts, page, totalPages, allTags} = useLoaderData<typeof loader>();

  return (
    <BlogIndex
      posts={posts}
      page={page}
      totalPages={totalPages}
      allTags={allTags}
    />
  );
}
