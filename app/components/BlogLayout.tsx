import {useRef} from 'react';
import {Link} from '@remix-run/react';
import clsx from 'clsx';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {page > 1 && (
              <Link
                to={`?page=${page - 1}`}
                className="btn btn-sm btn-outline"
              >
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
              <Link
                to={`?page=${page + 1}`}
                className="btn btn-sm btn-outline"
              >
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
    ? `${post.imageBasePath}/${String(post.frontmatter.image).replace(/^\.\//, '')}`
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
          {authors.length > 0 && (
            <span>by {authors.join(', ')}</span>
          )}
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
