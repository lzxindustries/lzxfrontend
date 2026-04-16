import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json, redirect} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {CACHE_LONG} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {getBlogPost} from '~/lib/content.server';
import {BlogPostView} from '~/components/BlogLayout';

export async function loader({params, request}: LoaderFunctionArgs) {
  const {slug} = params;
  invariant(slug, 'Missing blog post slug');

  const post = await getBlogPost(slug);
  if (!post) {
    throw new Response('Not Found', {status: 404});
  }

  if (post.slug !== slug) {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(/\/blog\/[^/]+$/, `/blog/${post.slug}`);
    return redirect(url.toString(), 301);
  }

  const heroImage = post.frontmatter.image
    ? `${post.imageBasePath}/${String(post.frontmatter.image).replace(/^\.\//, '')}`
    : undefined;

  const seo = seoPayload.blogPost({
    title: post.frontmatter.title ?? slug,
    description: post.frontmatter.description ?? post.excerpt,
    image: heroImage,
    publishedAt: post.date,
    author: (post.frontmatter.authors as string[])?.[0] ?? 'LZX Industries',
    url: new URL(request.url).origin + `/blog/${slug}`,
  });

  return json(
    {post, heroImage, seo},
    {headers: {'Cache-Control': CACHE_LONG}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function BlogPostPage() {
  const {post, heroImage} = useLoaderData<typeof loader>();

  return (
    <BlogPostView
      title={post.frontmatter.title ?? ''}
      date={post.date}
      authors={(post.frontmatter.authors as string[]) ?? []}
      tags={(post.frontmatter.tags as string[]) ?? []}
      readingTime={post.readingTime}
      html={post.html}
      headings={post.headings}
      heroImage={heroImage}
    />
  );
}
