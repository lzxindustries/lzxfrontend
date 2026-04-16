import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {CACHE_LONG} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {listBlogPosts, getAllTags} from '~/lib/content.server';
import {BlogIndex} from '~/components/BlogLayout';

const POSTS_PER_PAGE = 10;

export async function loader({params, request}: LoaderFunctionArgs) {
  const {tag} = params;
  invariant(tag, 'Missing tag');

  const decodedTag = decodeURIComponent(tag);
  const url = new URL(request.url);
  const requestedPage = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));

  const allPosts = listBlogPosts(decodedTag);
  if (allPosts.length === 0) {
    throw new Response('Not Found', {status: 404});
  }

  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);
  const posts = allPosts.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  );
  const allTags = getAllTags();

  const seo = seoPayload.blogTag({
    tag: decodedTag,
    url: url.origin + `/blog/tags/${tag}`,
  });

  return json(
    {posts, page, totalPages, allTags, activeTag: decodedTag, seo},
    {headers: {'Cache-Control': CACHE_LONG}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function BlogTagPage() {
  const {posts, page, totalPages, allTags, activeTag} =
    useLoaderData<typeof loader>();

  return (
    <BlogIndex
      posts={posts}
      page={page}
      totalPages={totalPages}
      activeTag={activeTag}
      allTags={allTags}
    />
  );
}
