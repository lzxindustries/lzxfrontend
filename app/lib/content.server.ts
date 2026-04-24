import {renderMarkdown} from './markdown.server';
import matter from 'gray-matter';
import type {ContentFrontmatter, TocHeading} from './markdown.server';
import {trimPlainExcerpt} from './plain-excerpt';

export type {TocHeading} from './markdown.server';

// --- Types ---

export interface BlogPost {
  slug: string;
  date: string;
  frontmatter: ContentFrontmatter;
  excerpt: string;
  readingTime: number;
  imageBasePath: string;
}

export interface BlogPostFull extends BlogPost {
  html: string;
  headings: TocHeading[];
}

export interface DocPage {
  slug: string;
  path: string;
  frontmatter: ContentFrontmatter;
}

export interface DocPageFull extends DocPage {
  html: string;
  headings: TocHeading[];
  readingTime: number;
}

export interface SidebarItem {
  label: string;
  slug: string;
  path: string;
  position: number;
  children?: SidebarItem[];
}

export interface TagInfo {
  tag: string;
  count: number;
}

// --- Content loading via import.meta.glob ---
// Vite bundles these at build time as raw strings

const blogFiles = import.meta.glob<string>('../../content/blog/*/index.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const docFiles = import.meta.glob<string>('../../content/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// --- Helpers ---

function extractDateFromBlogPath(filepath: string): string {
  // Path format: ../../content/blog/YYYY-MM-DD-slug/index.md
  const match = filepath.match(/\/blog\/(\d{4}-\d{2}-\d{2})-[^/]+\/index\.md$/);
  return match?.[1] ?? '1970-01-01';
}

function extractSlugFromBlogPath(filepath: string): string {
  // Path format: ../../content/blog/YYYY-MM-DD-slug/index.md
  const match = filepath.match(/\/blog\/\d{4}-\d{2}-\d{2}-([^/]+)\/index\.md$/);
  return match?.[1] ?? '';
}

function extractBlogFolderFromPath(filepath: string): string {
  const match = filepath.match(/\/blog\/([^/]+)\/index\.md$/);
  return match?.[1] ?? '';
}

function extractDocPathFromFilePath(filepath: string): string {
  // Path format: ../../content/docs/modules/dsg3.md → modules/dsg3
  const match = filepath.match(/\/content\/docs\/(.+)\.md$/);
  if (!match) return '';
  // Remove trailing /index for index files
  const cleaned = match[1].replace(/\/index$/, '');
  // Normalize top-level docs/index.md to docs root
  return cleaned === 'index' ? '' : cleaned;
}

function slugFromDocPath(docPath: string): string {
  // Last segment of the path
  const parts = docPath.split('/');
  return parts[parts.length - 1] ?? '';
}

function sectionFromDocPath(docPath: string): string {
  // First segment: modules, guides, instruments, case-and-power
  return docPath.split('/')[0] ?? '';
}

function isProductionRuntime(): boolean {
  return (
    (typeof import.meta !== 'undefined' &&
      Boolean(
        (import.meta as ImportMeta & {env?: {PROD?: boolean}}).env?.PROD,
      )) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production')
  );
}

const BLOG_PREVIEW_FALLBACK_IMAGE = '/docs/img/social-card.jpg';

// Docusaurus-style static asset prefixes — deployed under /docs/ on
// this site. Mirrors the img/link rewrites in markdown.server.ts so
// frontmatter image paths resolve to the same deployed files used by
// inline <img> tags.
const DOCS_STATIC_ASSET_PATTERN = /^\/(img|pdf|zip|firmware|mp3)\//i;

function rewriteDocsStaticAssetPath(value: string): string {
  return DOCS_STATIC_ASSET_PATTERN.test(value) ? `/docs${value}` : value;
}

function inferFirstInlineImage(content: string): string | undefined {
  const markdownImageMatch = content.match(
    /!\[[^\]]*\]\((?:<)?([^)>\s]+)(?:>)?(?:\s+["'][^"']*["'])?\)/,
  );
  if (markdownImageMatch?.[1]) return markdownImageMatch[1];

  const htmlImageMatch = content.match(
    /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i,
  );
  if (htmlImageMatch?.[1]) return htmlImageMatch[1];

  return undefined;
}

function resolveBlogPreviewImage(
  frontmatter: ContentFrontmatter,
  contentAfterFrontmatter: string,
): string {
  const frontmatterImage =
    typeof frontmatter.image === 'string' ? frontmatter.image.trim() : '';
  if (frontmatterImage) return rewriteDocsStaticAssetPath(frontmatterImage);

  const inferredImage = inferFirstInlineImage(contentAfterFrontmatter)?.trim();
  if (inferredImage) return rewriteDocsStaticAssetPath(inferredImage);

  return BLOG_PREVIEW_FALLBACK_IMAGE;
}

// --- Blog functions ---

export function listBlogPosts(tag?: string): BlogPost[] {
  const posts: BlogPost[] = [];
  const isProduction = isProductionRuntime();
  const truncateMarker = /<!--\s*truncate\s*-->/i;

  for (const [filepath, raw] of Object.entries(blogFiles)) {
    let frontmatter: ContentFrontmatter = {
      title: extractSlugFromBlogPath(filepath),
    };
    let contentAfterFm = raw;
    try {
      const parsed = matter(raw);
      frontmatter = parsed.data as ContentFrontmatter;
      contentAfterFm = parsed.content;
      frontmatter.image = resolveBlogPreviewImage(frontmatter, contentAfterFm);
    } catch {
      continue;
    }

    // Skip drafts in production
    if (isProduction && frontmatter.draft) continue;

    // Filter by tag if specified
    if (tag && (!frontmatter.tags || !frontmatter.tags.includes(tag))) continue;

    const date = extractDateFromBlogPath(filepath);
    const dirSlug = extractSlugFromBlogPath(filepath);
    const slug = (frontmatter.slug as string) || dirSlug;

    // Extract excerpt from raw content
    const truncateIdx = contentAfterFm.search(truncateMarker);
    const excerptRaw =
      truncateIdx >= 0
        ? contentAfterFm.slice(0, truncateIdx)
        : contentAfterFm.slice(0, 300);
    const excerpt = trimPlainExcerpt(
      excerptRaw
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .replace(/[*_~`>]/g, '')
        .replace(/\n+/g, ' ')
        .trim(),
      200,
    );

    const wordCount = contentAfterFm.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    posts.push({
      slug,
      date,
      frontmatter,
      excerpt,
      readingTime,
      imageBasePath: `/docs/blog/${dirSlug}`,
    });
  }

  // Sort by date descending
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

export async function getBlogPost(slug: string): Promise<BlogPostFull | null> {
  for (const [filepath, raw] of Object.entries(blogFiles)) {
    const dirSlug = extractSlugFromBlogPath(filepath);
    const folderSlug = extractBlogFolderFromPath(filepath);

    let parsedMatter: ReturnType<typeof matter> | null = null;
    let fmSlug = '';
    try {
      parsedMatter = matter(raw);
      fmSlug = (parsedMatter.data.slug as string) || '';
    } catch {
      fmSlug = '';
    }

    const effectiveSlug = fmSlug || dirSlug;
    const aliases = new Set(
      [effectiveSlug, dirSlug, folderSlug].filter(Boolean),
    );
    if (!aliases.has(slug)) continue;

    const imageBasePath = `/docs/blog/${dirSlug}`;
    const parsed = await renderMarkdown(
      raw,
      imageBasePath,
      `/blog/${effectiveSlug}`,
    );

    parsed.frontmatter.image = resolveBlogPreviewImage(
      parsed.frontmatter,
      parsedMatter?.content ?? '',
    );

    return {
      slug: effectiveSlug,
      date: extractDateFromBlogPath(filepath),
      frontmatter: parsed.frontmatter,
      excerpt: parsed.excerpt,
      readingTime: parsed.readingTime,
      imageBasePath,
      html: parsed.html,
      headings: parsed.headings,
    };
  }
  return null;
}

export function getAllTags(): TagInfo[] {
  const tagCounts = new Map<string, number>();
  const posts = listBlogPosts();

  for (const post of posts) {
    if (post.frontmatter.tags) {
      for (const tag of post.frontmatter.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
  }

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({tag, count}))
    .sort((a, b) => b.count - a.count);
}

// --- Docs functions ---

export function listDocsInSection(section: string): DocPage[] {
  const docs: DocPage[] = [];
  const isProduction = isProductionRuntime();

  for (const [filepath, raw] of Object.entries(docFiles)) {
    const docPath = extractDocPathFromFilePath(filepath);
    if (!docPath.startsWith(section + '/') && docPath !== section) continue;

    let frontmatter: ContentFrontmatter = {title: slugFromDocPath(docPath)};
    try {
      const parsed = matter(raw);
      frontmatter = parsed.data as ContentFrontmatter;
      if (!frontmatter.title) {
        frontmatter.title = slugFromDocPath(docPath);
      }
    } catch {
      // use default title
    }

    if (isProduction && frontmatter.draft) continue;

    docs.push({
      slug: slugFromDocPath(docPath),
      path: docPath,
      frontmatter,
    });
  }

  // Sort by sidebar_position, then alphabetically
  docs.sort((a, b) => {
    const posA = a.frontmatter.sidebar_position ?? 999;
    const posB = b.frontmatter.sidebar_position ?? 999;
    if (posA !== posB) return posA - posB;
    return (a.frontmatter.title ?? '').localeCompare(b.frontmatter.title ?? '');
  });

  return docs;
}

export async function getDocPage(docPath: string): Promise<DocPageFull | null> {
  const isProduction = isProductionRuntime();

  // Try exact path, then with /index suffix
  const candidates = [
    `../../content/docs/${docPath}.md`,
    `../../content/docs/${docPath}/index.md`,
  ];

  for (const candidate of candidates) {
    const raw = docFiles[candidate];
    if (!raw) continue;

    const section = sectionFromDocPath(docPath);
    const imageBasePath = `/docs/img/${section}`;
    const normalizedDocPath = docPath.replace(/\/index$/, '');
    const currentPath = normalizedDocPath
      ? `/docs/${normalizedDocPath}`
      : '/docs';
    const parsed = await renderMarkdown(raw, imageBasePath, currentPath);

    if (isProduction && parsed.frontmatter.draft) {
      return null;
    }

    return {
      slug: slugFromDocPath(docPath),
      path: docPath,
      frontmatter: parsed.frontmatter,
      html: parsed.html,
      headings: parsed.headings,
      readingTime: parsed.readingTime,
    };
  }

  return null;
}

export function hasDocPagePath(docPath: string): boolean {
  const candidates = [
    `../../content/docs/${docPath}.md`,
    `../../content/docs/${docPath}/index.md`,
  ];

  const isProduction = isProductionRuntime();

  for (const candidate of candidates) {
    const raw = docFiles[candidate];
    if (!raw) continue;

    // Draft pages never render in production (see `getDocPage`). If
    // we returned `true` here for a draft-only path, the hub tab
    // contract would surface a Manual tab that resolves to a 404 /
    // fallback page. Keep tab visibility aligned with renderability.
    if (isProduction) {
      try {
        const parsed = matter(raw);
        if ((parsed.data as ContentFrontmatter).draft) {
          continue;
        }
      } catch {
        // fall through: treat unreadable frontmatter as "exists"
      }
    }
    return true;
  }
  return false;
}

export function buildSidebar(section: string): SidebarItem[] {
  const docs = listDocsInSection(section);
  const tree: SidebarItem[] = [];
  const folders = new Map<string, SidebarItem>();

  for (const doc of docs) {
    // Calculate relative path within section
    const relativePath = doc.path.startsWith(section + '/')
      ? doc.path.slice(section.length + 1)
      : doc.path;

    const parts = relativePath.split('/');
    const docPosition = doc.frontmatter.sidebar_position ?? 999;

    if (parts.length === 1) {
      // Top-level doc in section
      tree.push({
        label: doc.frontmatter.title ?? doc.slug,
        slug: doc.slug,
        path: doc.path,
        position: docPosition,
      });
    } else {
      // Create or reuse folder nodes for all intermediate path segments
      let parentChildren = tree;
      let parentPath = section;

      for (let i = 0; i < parts.length - 1; i++) {
        const segment = parts[i] ?? '';
        const folderPath = `${parentPath}/${segment}`;

        let folder = folders.get(folderPath);
        if (!folder) {
          folder = {
            label: formatLabel(segment),
            slug: segment,
            path: folderPath,
            position: docPosition,
            children: [],
          };
          folders.set(folderPath, folder);
          parentChildren.push(folder);
        } else {
          folder.position = Math.min(folder.position, docPosition);
        }

        parentChildren = folder.children!;
        parentPath = folderPath;
      }

      parentChildren.push({
        label: doc.frontmatter.title ?? doc.slug,
        slug: doc.slug,
        path: doc.path,
        position: docPosition,
      });
    }
  }

  sortSidebarItems(tree);

  return tree;
}

function sortSidebarItems(items: SidebarItem[]) {
  items.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return a.label.localeCompare(b.label);
  });

  for (const item of items) {
    if (item.children?.length) {
      sortSidebarItems(item.children);
    }
  }
}

export function getPrevNext(
  section: string,
  currentPath: string,
): {prev: SidebarItem | null; next: SidebarItem | null} {
  const sidebar = buildSidebar(section);
  const flat = flattenSidebar(sidebar);
  const idx = flat.findIndex((item) => item.path === currentPath);

  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}

function flattenSidebar(items: SidebarItem[]): SidebarItem[] {
  const result: SidebarItem[] = [];
  for (const item of items) {
    if (item.children?.length) {
      result.push(...flattenSidebar(item.children));
    } else {
      result.push(item);
    }
  }
  return result;
}

// --- Utility for all content listing (sitemap, search index) ---

export function getAllContentPaths(): string[] {
  const paths: string[] = [];
  const isProduction = isProductionRuntime();

  // Blog posts
  for (const post of listBlogPosts()) {
    paths.push(`/blog/${post.slug}`);
  }

  // Docs
  for (const [filepath, raw] of Object.entries(docFiles)) {
    if (isProduction) {
      try {
        const parsed = matter(raw);
        if ((parsed.data as ContentFrontmatter).draft) {
          continue;
        }
      } catch {
        // keep path if frontmatter cannot be parsed
      }
    }

    const docPath = extractDocPathFromFilePath(filepath);
    paths.push(docPath ? `/docs/${docPath}` : '/docs');
  }

  return paths;
}

function formatLabel(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
