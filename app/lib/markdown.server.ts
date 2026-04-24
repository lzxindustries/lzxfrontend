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
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import matter from 'gray-matter';
import type {Root, Element} from 'hast';
import type {Plugin} from 'unified';
import {trimPlainExcerpt} from '~/lib/plain-excerpt';

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
          const id = (node.properties?.id as string) || '';
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
          } else if (isDocsStaticAssetPath(src)) {
            // Docusaurus static assets are served from /public/docs/*
            node.properties.src = `/docs${src}`;
          }
        }

        if (node.tagName === 'a' && node.properties?.href) {
          const href = String(node.properties.href);
          const {pathname, query, hash} = splitHref(href);

          if (!pathname || hashOnlyHref(pathname)) return;
          if (isExternalHref(pathname)) return;

          let rewrittenPath = pathname;

          if (isDocsStaticAssetPath(pathname)) {
            rewrittenPath = `/docs${pathname}`;
          } else if (isMarkdownPath(pathname)) {
            if (pathname.startsWith('/')) {
              rewrittenPath = normalizeMarkdownPath(pathname);
            } else if (currentPath) {
              const resolved = resolveRelativePath(pathname, currentPath);
              rewrittenPath = normalizeMarkdownPath(resolved);
            }
          } else if (isAbsoluteDocsPath(pathname)) {
            // Absolute /docs/modules/ and /docs/instruments/ links (without .md)
            rewrittenPath = normalizeMarkdownPath(pathname);
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

function isDocsStaticAssetPath(pathname: string): boolean {
  return /^\/(img|pdf|zip|firmware|mp3)\//i.test(pathname);
}

function isAbsoluteDocsPath(pathname: string): boolean {
  return (
    pathname.startsWith('/docs/modules/') ||
    pathname.startsWith('/docs/instruments/')
  );
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

  // Rewrite /docs/modules/{slug} → /modules/{slug}/manual, except for
  // the cross-module index page which lives at /modules/specs.
  const moduleMatch = normalized.match(/^\/docs\/modules\/([^/]+)$/);
  if (moduleMatch) {
    const slug = moduleMatch[1];
    if (slug === 'module-list') return '/modules/specs';
    return `/modules/${slug}/manual`;
  }

  // Rewrite /docs/instruments/{slug}/{subpath?} → /instruments/{slug}/manual/{subpath?}
  const instrMatch = normalized.match(
    /^\/docs\/instruments\/([^/]+)(?:\/(.+))?$/,
  );
  if (instrMatch) {
    const slug = instrMatch[1];
    const subpath = instrMatch[2];
    return `/instruments/${slug}/manual${subpath ? '/' + subpath : ''}`;
  }

  return normalized;
}

function visitElements(node: Root | Element, fn: (el: Element) => void) {
  if ('children' in node) {
    for (const child of node.children) {
      if (child.type === 'element') {
        fn(child);
        visitElements(child, fn);
      }
    }
  }
}

// --- Strip h1 headings (title rendered separately by layout) ---

function stripH1Headings(): Plugin<[], Root> {
  return () => {
    return (tree: Root) => {
      tree.children = tree.children.filter(
        (node) => !(node.type === 'element' && node.tagName === 'h1'),
      );
    };
  };
}

// --- Strip legacy subtitle spans (head2_nolink) ---

function stripLegacySubtitles(): Plugin<[], Root> {
  return () => {
    return (tree: Root) => {
      tree.children = tree.children.filter((node) => {
        if (node.type !== 'element') return true;
        return !hasClass(node, 'head2_nolink');
      });
    };
  };
}

function hasClass(node: Element, className: string): boolean {
  const classes = node.properties?.className;
  if (Array.isArray(classes)) return classes.includes(className);
  if (typeof classes === 'string') return classes === className;
  // Check children recursively (span may be wrapped in <p>)
  for (const child of node.children) {
    if (child.type === 'element' && hasClass(child, className)) return true;
  }
  return false;
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
            (child.properties.className as string[]).includes(
              'language-mermaid',
            )
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
  const stripped = content
    .replace(/^---[\s\S]*?---\s*/, '') // Remove frontmatter
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links → text
    .replace(/#{1,6}\s+/g, '') // Remove headings
    .replace(/[*_~`>]/g, '') // Remove emphasis/formatting
    .replace(/\n+/g, ' ') // Collapse newlines
    .trim();
  return trimPlainExcerpt(stripped, 200);
}

// Remove `export function` blocks using brace counting so nested `}` don't
// prematurely end the match.
function stripExportFunctionBlocks(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inExportFn = false;
  let depth = 0;

  for (const line of lines) {
    if (!inExportFn) {
      if (/^export\s+function\s/.test(line)) {
        inExportFn = true;
        depth =
          (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
        // depth may be 0 if opening brace is on a later line — that's fine,
        // we still skip this line.
        continue;
      }
      result.push(line);
    } else {
      depth +=
        (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      if (depth <= 0) {
        inExportFn = false;
      }
      // Skip all lines inside the export function block.
    }
  }

  return result.join('\n');
}

// --- MDX-to-Markdown preprocessing ---
// Docusaurus docs use MDX features (imports, JSX, admonitions, component
// definitions). We convert these to plain Markdown / HTML before feeding
// the content to the remark pipeline.

function stripMdxSyntax(content: string): string {
  // 1. Collect default import variable→path map and remove import lines
  const imports: Record<string, string> = {};
  content = content.replace(
    /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/gm,
    (_match, name: string, path: string) => {
      imports[name] = path;
      return '';
    },
  );

  // 1b. Remove destructured/named imports (e.g. import { x, y } from 'react')
  content = content.replace(
    /^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    '',
  );

  // 2. Remove `export function ...` blocks (e.g. ResponsiveYouTube component
  //    definitions). These span from `export function` to the closing `}` at
  //    column 0.
  content = stripExportFunctionBlocks(content);

  // 3. Replace <ResponsiveYouTube videoId="XYZ" /> with a plain iframe
  content = content.replace(
    /<ResponsiveYouTube\s+videoId=["']([^"']+)["']\s*\/>/g,
    (_match, videoId: string) =>
      `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">\n` +
      `<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" ` +
      `src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>\n</div>`,
  );

  // 4. Replace JSX image source bindings inside <img> tags.
  content = content.replace(
    /(<img[^>]*\ssrc=)\{(\w+)\}/g,
    (_match, before: string, name: string) => {
      const path = imports[name] || name;
      return `${before}"${path}"`;
    },
  );

  // 5. Replace template-literal src: src={`...${var}...`}
  content = content.replace(
    /src=\{`([^`]*)\$\{(\w+)\}([^`]*)`\}/g,
    (_match, before: string, name: string, after: string) => {
      const val = imports[name] || name;
      return `src="${before}${val}${after}"`;
    },
  );

  // 6. Convert Docusaurus admonition blocks (supports titles and nesting).
  const lines = content.split('\n');
  const admonitionStack: string[] = [];
  const convertedLines: string[] = [];

  for (const line of lines) {
    const normalizedLine = line.replace(/\r$/, '');

    const openMatch = normalizedLine.match(
      /^:::(note|tip|info|warning|caution|danger|important)\b\s*(.*)$/i,
    );
    if (openMatch) {
      const type = openMatch[1].toLowerCase();
      const explicitTitle = openMatch[2]?.trim();
      const defaultLabel = type.charAt(0).toUpperCase() + type.slice(1);
      const title = explicitTitle || defaultLabel;

      admonitionStack.push(type);
      // Blank lines around the raw HTML are required so CommonMark resumes
      // markdown parsing for the inner content (otherwise inline syntax such
      // as **bold**, *italic*, and links inside admonitions render literally).
      convertedLines.push(`<div class="admonition admonition-${type}">`);
      convertedLines.push(`<p class="admonition-title">${title}</p>`);
      convertedLines.push('');
      continue;
    }

    if (/^:::\s*$/.test(normalizedLine)) {
      if (admonitionStack.length > 0) {
        admonitionStack.pop();
        convertedLines.push('');
        convertedLines.push('</div>');
      } else {
        convertedLines.push(normalizedLine);
      }
      continue;
    }

    convertedLines.push(normalizedLine);
  }

  // Close any unbalanced admonitions to avoid malformed HTML output.
  while (admonitionStack.length > 0) {
    admonitionStack.pop();
    convertedLines.push('');
    convertedLines.push('</div>');
  }

  content = convertedLines.join('\n');

  return content;
}

// --- Main render function ---

export async function renderMarkdown(
  raw: string,
  imageBasePath: string = '',
  currentPath: string = '',
): Promise<ParsedMarkdown> {
  const {data: frontmatter, content: rawContent} = matter(raw);

  // Preprocess MDX syntax before feeding to remark
  const content = stripMdxSyntax(rawContent);

  const headings: TocHeading[] = [];

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {behavior: 'wrap'})
    .use(rehypeHighlight as never, {ignoreMissing: true})
    .use(stripH1Headings())
    .use(stripLegacySubtitles())
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
