import {unified} from 'unified';

// Polyfill Buffer for Cloudflare Workers runtime (used by gray-matter)
if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as any).Buffer = {
    from: (input: string) => new TextEncoder().encode(input),
    isBuffer: () => false,
  };
}

import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import matter from 'gray-matter';
import type {Root, Element} from 'hast';
import type {Plugin} from 'unified';

// --- Types ---

export interface TocHeading {
  depth: number;
  id: string;
  text: string;
}

export interface ContentFrontmatter {
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  tags?: string[];
  authors?: string[];
  draft?: boolean;
  sidebar_position?: number;
  date?: string;
  [key: string]: unknown;
}

export interface ParsedMarkdown {
  frontmatter: ContentFrontmatter;
  html: string;
  headings: TocHeading[];
  readingTime: number;
  excerpt: string;
}

// --- Heading extraction plugin ---

function extractHeadings(headings: TocHeading[]): Plugin<[], Root> {
  return () => {
    return (tree: Root) => {
      for (const node of tree.children) {
        if (
          node.type === 'element' &&
          (node.tagName === 'h2' || node.tagName === 'h3')
        ) {
          const depth = node.tagName === 'h2' ? 2 : 3;
          const id =
            (node.properties?.id as string) || '';
          const text = getTextContent(node);
          if (text) {
            headings.push({depth, id, text});
          }
        }
      }
    };
  };
}

function getTextContent(node: Element): string {
  let text = '';
  for (const child of node.children) {
    if (child.type === 'text') {
      text += child.value;
    } else if (child.type === 'element') {
      text += getTextContent(child);
    }
  }
  return text;
}

// --- Image path rewriting plugin ---

function rewriteInternalPaths(
  imageBasePath: string,
  currentPath: string,
): Plugin<[], Root> {
  return () => {
    return (tree: Root) => {
      visitElements(tree, (node) => {
        if (node.tagName === 'img' && node.properties?.src) {
          const src = String(node.properties.src);
          if (src.startsWith('./') || src.startsWith('../')) {
            // Co-located image: rewrite relative to basePath
            const filename = src.split('/').pop() || src;
            node.properties.src = `${imageBasePath}/${filename}`;
          } else if (src.startsWith('/img/')) {
            // Docusaurus static image: prefix with /docs
            node.properties.src = `/docs${src}`;
          }
        }

        if (node.tagName === 'a' && node.properties?.href) {
          const href = String(node.properties.href);
          const {pathname, query, hash} = splitHref(href);

          if (!pathname || hashOnlyHref(pathname)) return;
          if (isExternalHref(pathname)) return;

          let rewrittenPath = pathname;

          if (pathname.startsWith('/img/')) {
            rewrittenPath = `/docs${pathname}`;
          } else if (isMarkdownPath(pathname)) {
            if (pathname.startsWith('/')) {
              rewrittenPath = normalizeMarkdownPath(pathname);
            } else if (currentPath) {
              const resolved = resolveRelativePath(pathname, currentPath);
              rewrittenPath = normalizeMarkdownPath(resolved);
            }
          } else if (isRelativeHref(pathname) && imageBasePath) {
            // Allow explicit links to co-located assets in blog/docs markdown.
            if (isAssetPath(pathname)) {
              const filename = pathname.split('/').pop() || pathname;
              rewrittenPath = `${imageBasePath}/${filename}`;
            }
          }

          node.properties.href = `${rewrittenPath}${query}${hash}`;
        }
      });
    };
  };
}

function splitHref(href: string): {
  pathname: string;
  query: string;
  hash: string;
} {
  const match = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return {
    pathname: match?.[1] ?? href,
    query: match?.[2] ?? '',
    hash: match?.[3] ?? '',
  };
}

function hashOnlyHref(pathname: string): boolean {
  return pathname.startsWith('#');
}

function isExternalHref(pathname: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(pathname);
}

function isRelativeHref(pathname: string): boolean {
  return pathname.startsWith('./') || pathname.startsWith('../');
}

function isMarkdownPath(pathname: string): boolean {
  return /\.md$/i.test(pathname);
}

function isAssetPath(pathname: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif|mp4|mov|webm|pdf)$/i.test(pathname);
}

function resolveRelativePath(pathname: string, currentPath: string): string {
  const baseDir = currentPath.endsWith('/')
    ? currentPath
    : currentPath.slice(0, currentPath.lastIndexOf('/') + 1);
  return new URL(pathname, `https://example.com${baseDir}`).pathname;
}

function normalizeMarkdownPath(pathname: string): string {
  let normalized = pathname.replace(/\.md$/i, '').replace(/\/index$/i, '');
  if (normalized === '/docs/index') normalized = '/docs';
  if (!normalized) return '/';
  return normalized;
}

function visitElements(
  node: Root | Element,
  fn: (el: Element) => void,
) {
  if ('children' in node) {
    for (const child of node.children) {
      if (child.type === 'element') {
        fn(child);
        visitElements(child, fn);
      }
    }
  }
}

// --- Mermaid code block wrapping ---

function wrapMermaidBlocks(): Plugin<[], Root> {
  return () => {
    return (tree: Root) => {
      visitElements(tree, (node) => {
        // Find <pre><code class="language-mermaid">...</code></pre>
        if (node.tagName === 'pre' && node.children.length === 1) {
          const child = node.children[0];
          if (
            child.type === 'element' &&
            child.tagName === 'code' &&
            Array.isArray(child.properties?.className) &&
            (child.properties.className as string[]).includes('language-mermaid')
          ) {
            const mermaidSource = getTextContent(child);
            // Replace <pre><code> with a <div class="mermaid"> for client-side rendering
            node.tagName = 'div';
            node.properties = {className: ['mermaid']};
            node.children = [{type: 'text', value: mermaidSource}];
          }
        }
      });
    };
  };
}

// --- Reading time ---

function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// --- Excerpt extraction ---

function extractExcerpt(raw: string): string {
  const truncateMarker = /<!--\s*truncate\s*-->/i;
  const idx = raw.search(truncateMarker);
  const content = idx >= 0 ? raw.slice(0, idx) : raw.slice(0, 300);
  // Strip markdown syntax for a plain-text excerpt
  return content
    .replace(/^---[\s\S]*?---\s*/, '') // Remove frontmatter
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links → text
    .replace(/#{1,6}\s+/g, '') // Remove headings
    .replace(/[*_~`>]/g, '') // Remove emphasis/formatting
    .replace(/\n+/g, ' ') // Collapse newlines
    .trim()
    .slice(0, 200);
}

// --- Main render function ---

export async function renderMarkdown(
  raw: string,
  imageBasePath: string = '',
  currentPath: string = '',
): Promise<ParsedMarkdown> {
  const {data: frontmatter, content} = matter(raw);

  const headings: TocHeading[] = [];

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeKatex)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {behavior: 'wrap'})
    .use(rehypeHighlight as never, {ignoreMissing: true})
    .use(wrapMermaidBlocks())
    .use(rewriteInternalPaths(imageBasePath, currentPath))
    .use(extractHeadings(headings))
    .use(rehypeStringify, {allowDangerousHtml: true});

  const result = await processor.process(content);

  return {
    frontmatter: frontmatter as ContentFrontmatter,
    html: String(result),
    headings,
    readingTime: calculateReadingTime(content),
    excerpt: extractExcerpt(raw),
  };
}
