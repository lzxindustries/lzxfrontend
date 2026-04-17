import {useRef} from 'react';
import {Link} from '@remix-run/react';
import clsx from 'clsx';
import MailchimpSubscribe from 'react-mailchimp-subscribe';
import {useImageZoom} from '~/hooks/useImageZoom';
import {useMermaid} from '~/hooks/useMermaid';
import {Breadcrumbs} from './Breadcrumbs';
import type {BlogPost} from '~/lib/content.server';
import type {TocHeading} from '~/lib/markdown.server';

// --- Blog Index (listing) ---

export interface BlogIndexProps {
  posts: BlogPost[];
  page: number;
  totalPages: number;
  activeTag?: string;
  allTags: {tag: string; count: number}[];
}

export function BlogIndex({
  posts,
  page,
  totalPages,
  activeTag,
  allTags,
}: BlogIndexProps) {
  const years = Array.from(new Set(posts.map((post) => post.date.slice(0, 4))));

  return (
    <>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Blog', to: activeTag ? '/blog' : undefined},
          ...(activeTag ? [{label: `#${activeTag}`}] : []),
        ]}
      />
      <div className="px-6 pb-16 md:px-10 lg:px-12 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          {activeTag ? `Posts tagged "${activeTag}"` : 'Blog'}
        </h1>

        {/* Tag filter bar */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              to="/blog"
              className={clsx(
                'badge badge-lg',
                !activeTag ? 'badge-primary' : 'badge-outline',
              )}
            >
              All
            </Link>
            {allTags.map(({tag, count}) => (
              <Link
                key={tag}
                to={`/blog/tags/${encodeURIComponent(tag)}`}
                className={clsx(
                  'badge badge-lg',
                  activeTag === tag ? 'badge-primary' : 'badge-outline',
                )}
              >
                {tag} ({count})
              </Link>
            ))}
          </div>
        )}

        {/* Post grid */}
        {posts.length === 0 ? (
          <p className="text-lg opacity-60">No posts found.</p>
        ) : (
          <>
            {years.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-sm font-medium text-base-content/70 mr-1">
                  Archive:
                </span>
                {years.map((year) => (
                  <a
                    key={year}
                    href={`#year-${year}`}
                    className="badge badge-outline"
                  >
                    {year}
                  </a>
                ))}
              </div>
            )}

            {years.map((year, yearIndex) => {
              const yearPosts = posts.filter((post) =>
                post.date.startsWith(year),
              );

              return (
                <section key={year} id={`year-${year}`} className="mb-10">
                  <h2 className="text-2xl font-semibold mb-4">{year}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {yearPosts.map((post, index) => {
                      const showNewsletter =
                        yearIndex === 0 && index === 1 && posts.length > 2;

                      return (
                        <div key={post.slug}>
                          <BlogCard post={post} />
                          {showNewsletter ? (
                            <div className="mt-4 rounded-lg border border-base-300 bg-base-200 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                Newsletter
                              </p>
                              <p className="mt-1 mb-3 text-sm text-base-content/70">
                                Get release updates, firmware notes, and
                                workshop news.
                              </p>
                              {/* @ts-expect-error react-mailchimp-subscribe types incompatible with React 18 */}
                              <MailchimpSubscribe url="https://lzxindustries.us11.list-manage.com/subscribe/post?u=7da8b11822c70e5b64240e14f&amp;id=352bd533b6&amp;f_id=0076a2e0f0" />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {page > 1 && (
              <Link to={`?page=${page - 1}`} className="btn btn-sm btn-outline">
                ← Previous
              </Link>
            )}
            {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                to={`?page=${p}`}
                className={clsx(
                  'btn btn-sm',
                  p === page ? 'btn-primary' : 'btn-outline',
                )}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link to={`?page=${page + 1}`} className="btn btn-sm btn-outline">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// --- Blog Card ---

function BlogCard({post}: {post: BlogPost}) {
  const imageUrl = post.frontmatter.image
    ? `${post.imageBasePath}/${String(post.frontmatter.image).replace(
        /^\.\//,
        '',
      )}`
    : null;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="card bg-base-200 hover:bg-base-300 transition-colors overflow-hidden"
    >
      {imageUrl && (
        <figure className="h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={post.frontmatter.title ?? ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </figure>
      )}
      <div className="card-body p-4">
        <h2 className="card-title text-lg">{post.frontmatter.title}</h2>
        <div className="flex items-center gap-3 text-xs opacity-60">
          <time>{formatDate(post.date)}</time>
          {post.frontmatter.authors && (
            <span>by {(post.frontmatter.authors as string[]).join(', ')}</span>
          )}
          <span>{post.readingTime} min read</span>
        </div>
        {post.excerpt && (
          <p className="text-sm mt-2 opacity-80 line-clamp-3">{post.excerpt}</p>
        )}
        {post.frontmatter.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(post.frontmatter.tags as string[]).map((tag) => (
              <span key={tag} className="badge badge-sm badge-outline">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// --- Blog Post (detail) ---

export interface BlogPostProps {
  title: string;
  date: string;
  authors: string[];
  tags: string[];
  readingTime: number;
  html: string;
  headings: TocHeading[];
  heroImage?: string;
}

export function BlogPostView({
  title,
  date,
  authors,
  tags,
  readingTime,
  html,
  headings,
  heroImage,
}: BlogPostProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useImageZoom(contentRef);
  useMermaid(contentRef);

  return (
    <>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Blog', to: '/blog'},
          {label: title},
        ]}
      />
      <article className="px-6 pb-16 md:px-10 lg:px-12 max-w-prose-wide mx-auto">
        {heroImage && (
          <figure className="mb-8 -mx-6 md:-mx-10 lg:-mx-12">
            <img
              src={heroImage}
              alt={title}
              className="w-full max-h-96 object-cover"
            />
          </figure>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm opacity-60 mb-8">
          <time>{formatDate(date)}</time>
          {authors.length > 0 && <span>by {authors.join(', ')}</span>}
          <span>{readingTime} min read</span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog/tags/${encodeURIComponent(tag)}`}
                className="badge badge-outline"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        <div
          ref={contentRef}
          className="docs-content prose max-w-none"
          dangerouslySetInnerHTML={{__html: html}}
        />
      </article>
    </>
  );
}

// --- Utility ---

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
