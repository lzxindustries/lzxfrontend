import {json} from '@shopify/remix-oxygen';
import {CACHE_LONG} from '~/data/cache';
import {listBlogPosts} from '~/lib/content.server';

export async function loader() {
  const posts = listBlogPosts().slice(0, 10);
  const origin = 'https://lzxindustries.net';

  const items = posts.map(
    (post) => `    <item>
      <title><![CDATA[${post.frontmatter.title ?? post.slug}]]></title>
      <link>${origin}/blog/${post.slug}</link>
      <guid isPermaLink="true">${origin}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate>
      ${(post.frontmatter.authors as string[])?.map((a) => `<author>${a}</author>`).join('\n      ') ?? ''}
      ${(post.frontmatter.tags as string[])?.map((t) => `<category>${t}</category>`).join('\n      ') ?? ''}
    </item>`,
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LZX Industries Blog</title>
    <link>${origin}/blog</link>
    <description>News, updates, and stories from LZX Industries.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/blog.rss.xml" rel="self" type="application/rss+xml"/>
    <copyright>© ${new Date().getFullYear()} LZX Industries</copyright>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': CACHE_LONG,
    },
  });
}
