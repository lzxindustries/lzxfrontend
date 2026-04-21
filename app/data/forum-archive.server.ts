import type {ContentFrontmatter, TocHeading} from '~/lib/markdown.server';

type RawForumTag = {
  id?: number;
  name?: string;
  slug?: string;
};

type RawForumPost = {
  id?: number;
  post_number?: number;
  username?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  cooked?: string;
  like_count?: number;
  reply_to_post_number?: number | null;
  is_wiki?: boolean;
};

type RawForumTopic = {
  id?: number;
  title?: string;
  slug?: string;
  category_id?: number;
  tags?: RawForumTag[];
  created_at?: string;
  views?: number;
  like_count?: number;
  posts_count?: number;
  posts?: RawForumPost[];
};

export interface ForumArchivePost {
  id: number;
  postNumber: number;
  authorName: string;
  authorUsername: string;
  createdAt: string | null;
  updatedAt: string | null;
  html: string;
  excerpt: string;
  imageUrls: string[];
  embeddedVideoUrls: string[];
  likeCount: number;
  replyToPostNumber: number | null;
  isWiki: boolean;
}

export interface ForumArchiveSection {
  title: string;
  id: string;
  html: string;
}

export interface ForumArchiveTopic {
  id: number;
  title: string;
  slug: string;
  url: string;
  createdAt: string | null;
  views: number;
  likeCount: number;
  postsCount: number;
  tags: string[];
  excerpt: string;
  introHtml: string;
  sections: ForumArchiveSection[];
  imageUrls: string[];
  embeddedVideoUrls: string[];
  posts: ForumArchivePost[];
}

export interface ProductForumArchive {
  officialTopic: ForumArchiveTopic | null;
  relatedTopics: ForumArchiveTopic[];
}

export interface ForumArchiveDoc {
  slug: string;
  path: string;
  frontmatter: ContentFrontmatter;
  html: string;
  headings: TocHeading[];
  readingTime: number;
}

const forumTopicModules = import.meta.glob<RawForumTopic>(
  '../../lfs/library/scrape/community/topics/*.json',
  {import: 'default'},
);

const GENERIC_PRODUCT_TAGS = new Set([
  'eurorack',
  'expedition',
  'orion',
  'visionary',
  'legacy',
  'legacy1',
  'lzx',
  'news',
]);

let forumTopicsPromise: Promise<ForumArchiveTopic[]> | null = null;

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function stripHtml(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' '),
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function uniqueStrings(values: Iterable<string>): string[] {
  return [...new Set([...values].filter(Boolean))];
}

function extractImageUrls(html: string): string[] {
  return uniqueStrings(
    [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(
      (match) => match[1] ?? '',
    ),
  );
}

function extractEmbeddedVideoUrls(html: string): string[] {
  return uniqueStrings(
    [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(
      (match) => match[1] ?? '',
    ),
  );
}

function buildTopicUrl(topic: {slug: string; id: number}): string {
  return `https://community.lzxindustries.net/t/${topic.slug}/${topic.id}`;
}

function buildExcerpt(html: string): string {
  const excerpt = stripHtml(html);
  return excerpt.length > 280
    ? `${excerpt.slice(0, 277).trimEnd()}...`
    : excerpt;
}

function normalizePost(raw: RawForumPost): ForumArchivePost | null {
  const id = Number(raw.id);
  const postNumber = Number(raw.post_number);
  const html = stringValue(raw.cooked) ?? '';

  if (!Number.isFinite(id) || !Number.isFinite(postNumber) || !html) {
    return null;
  }

  return {
    id,
    postNumber,
    authorName: stringValue(raw.name) ?? stringValue(raw.username) ?? 'Community Member',
    authorUsername: stringValue(raw.username) ?? 'community-member',
    createdAt: stringValue(raw.created_at),
    updatedAt: stringValue(raw.updated_at),
    html,
    excerpt: buildExcerpt(html),
    imageUrls: extractImageUrls(html),
    embeddedVideoUrls: extractEmbeddedVideoUrls(html),
    likeCount: Number(raw.like_count) || 0,
    replyToPostNumber:
      typeof raw.reply_to_post_number === 'number' ? raw.reply_to_post_number : null,
    isWiki: raw.is_wiki === true,
  };
}

function splitCookedIntoSections(html: string): {
  introHtml: string;
  sections: ForumArchiveSection[];
} {
  const headingMatches = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];

  if (headingMatches.length === 0) {
    return {introHtml: html.trim(), sections: []};
  }

  const introEnd = headingMatches[0]?.index ?? 0;
  const introHtml = html.slice(0, introEnd).trim();
  const sections: ForumArchiveSection[] = [];

  for (let index = 0; index < headingMatches.length; index += 1) {
    const current = headingMatches[index];
    if (!current) continue;

    const title = stripHtml(current[1] ?? '');
    const start = (current.index ?? 0) + current[0].length;
    const end = headingMatches[index + 1]?.index ?? html.length;
    const bodyHtml = html.slice(start, end).trim();

    if (!title || !bodyHtml) continue;

    sections.push({
      title,
      id: slugify(title),
      html: bodyHtml,
    });
  }

  return {introHtml, sections};
}

function normalizeTopic(raw: RawForumTopic): ForumArchiveTopic | null {
  const id = Number(raw.id);
  const slug = stringValue(raw.slug);
  const title = stringValue(raw.title);
  if (!Number.isFinite(id) || !slug || !title) return null;

  const posts = [...(raw.posts ?? [])]
    .sort((left, right) => (left.post_number ?? 0) - (right.post_number ?? 0))
    .map((post) => normalizePost(post))
    .filter((post): post is ForumArchivePost => post != null);
  const firstPost = posts[0] ?? null;
  const cooked = firstPost?.html ?? '';
  const {introHtml, sections} = splitCookedIntoSections(cooked);
  const excerptSource = stripHtml(introHtml || cooked);

  return {
    id,
    title,
    slug,
    url: buildTopicUrl({slug, id}),
    createdAt: stringValue(raw.created_at),
    views: Number(raw.views) || 0,
    likeCount: Number(raw.like_count) || 0,
    postsCount: Number(raw.posts_count) || 0,
    tags: uniqueStrings(
      (raw.tags ?? []).map((tag) => stringValue(tag.slug) ?? ''),
    ),
    excerpt:
      excerptSource.length > 280
        ? `${excerptSource.slice(0, 277).trimEnd()}...`
        : excerptSource,
    introHtml,
    sections,
    imageUrls: uniqueStrings(posts.flatMap((post) => post.imageUrls)),
    embeddedVideoUrls: uniqueStrings(
      posts.flatMap((post) => post.embeddedVideoUrls),
    ),
    posts,
  };
}

async function loadForumTopics(): Promise<ForumArchiveTopic[]> {
  if (!forumTopicsPromise) {
    forumTopicsPromise = Promise.all(
      Object.values(forumTopicModules).map(async (loadTopic) => normalizeTopic(await loadTopic())),
    ).then((topics) =>
      topics
        .filter((topic): topic is ForumArchiveTopic => topic != null)
        .sort((left, right) => left.slug.localeCompare(right.slug)),
    );
  }

  return forumTopicsPromise;
}

function parseForumTopicSlugFromUrl(url: string | null | undefined): string | null {
  const value = stringValue(url);
  if (!value) return null;

  const match = value.match(/community\.lzxindustries\.net\/t\/([^/?#]+)/i);
  return stringValue(match?.[1] ?? null);
}

function candidateTopicSlugs(productSlug: string): string[] {
  const compact = productSlug.replace(/-/g, '');

  return uniqueStrings([
    `all-about-${productSlug}`,
    `all-about-${compact}`,
    productSlug,
    compact,
  ]);
}

function candidateTagSlugs(productSlug: string): string[] {
  const compact = productSlug.replace(/-/g, '');
  const tokens = productSlug.split('-').filter(Boolean);

  return uniqueStrings([productSlug, compact, ...tokens]);
}

function getPreferredTopicTags(
  officialTopic: ForumArchiveTopic | null,
  productSlug: string,
): string[] {
  const preferred = officialTopic
    ? officialTopic.tags.filter((tag) => !GENERIC_PRODUCT_TAGS.has(tag))
    : [];

  return preferred.length > 0 ? preferred : candidateTagSlugs(productSlug);
}

function topicMatchScore(topic: ForumArchiveTopic, preferredTags: Set<string>): number {
  const sharedTagCount = topic.tags.filter((tag) => preferredTags.has(tag)).length;
  const recency = topic.createdAt ? Date.parse(topic.createdAt) / 1_000_000_000 : 0;

  return sharedTagCount * 1000 + topic.postsCount * 10 + topic.views + recency;
}

export async function getProductForumArchive(
  productSlug: string,
  externalUrl?: string | null,
): Promise<ProductForumArchive> {
  const topics = await loadForumTopics();
  const bySlug = new Map(topics.map((topic) => [topic.slug, topic]));

  const officialTopic =
    (parseForumTopicSlugFromUrl(externalUrl)
      ? bySlug.get(parseForumTopicSlugFromUrl(externalUrl) as string) ?? null
      : null) ??
    candidateTopicSlugs(productSlug)
      .map((slug) => bySlug.get(slug) ?? null)
      .find((topic): topic is ForumArchiveTopic => topic != null) ??
    null;

  const preferredTags = new Set(getPreferredTopicTags(officialTopic, productSlug));
  const relatedTopics = topics
    .filter((topic) => topic.slug !== officialTopic?.slug)
    .filter((topic) => {
      const sharedTags = topic.tags.some((tag) => preferredTags.has(tag));
      if (sharedTags) return true;

      const compactSlug = productSlug.replace(/-/g, '');
      return topic.slug.includes(productSlug) || topic.slug.includes(compactSlug);
    })
    .sort((left, right) => topicMatchScore(right, preferredTags) - topicMatchScore(left, preferredTags))
    ;

  return {
    officialTopic,
    relatedTopics,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatArchiveDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function renderForumPost(post: ForumArchivePost): string {
  const replyText =
    post.replyToPostNumber != null ? ` in reply to #${post.replyToPostNumber}` : '';
  const dateText = formatArchiveDate(post.createdAt);

  return [
    '<article class="rounded-lg border border-base-300 bg-base-100/60 p-4 mb-4">',
    '<div class="mb-3 text-sm text-base-content/60">',
    `<strong>${escapeHtml(post.authorName)}</strong>`,
    ` posted #${post.postNumber}${replyText}`,
    dateText ? ` on ${escapeHtml(dateText)}` : '',
    post.isWiki ? ' · wiki post' : '',
    '</div>',
    post.html,
    '</article>',
  ].join('');
}

function renderForumTopic(
  topic: ForumArchiveTopic,
  options: {
    includeTopicHeading: boolean;
    topicHeadingDepth: 2 | 3;
    sectionHeadingDepth: 2 | 3 | 4;
    sectionIdPrefix: string;
  },
): string {
  const topicHeadingTag = `h${options.topicHeadingDepth}`;
  const sectionHeadingTag = `h${options.sectionHeadingDepth}`;
  const parts: string[] = [];

  if (options.includeTopicHeading) {
    parts.push(
      `<${topicHeadingTag} id="${escapeHtml(topic.slug)}">${escapeHtml(topic.title)}</${topicHeadingTag}>`,
    );
  }

  parts.push(
    `<p><a href="${escapeHtml(topic.url)}" target="_blank" rel="noreferrer noopener">Open original thread</a></p>`,
  );

  if (topic.introHtml) {
    parts.push(topic.introHtml);
  }

  for (const section of topic.sections) {
    const sectionId = `${options.sectionIdPrefix}${section.id}`;
    parts.push(
      `<${sectionHeadingTag} id="${escapeHtml(sectionId)}">${escapeHtml(section.title)}</${sectionHeadingTag}>${section.html}`,
    );
  }

  if (topic.posts.length > 1) {
    parts.push(
      `<${sectionHeadingTag} id="${escapeHtml(`${options.sectionIdPrefix}thread-replies`)}">Thread Replies</${sectionHeadingTag}>`,
    );
    for (const post of topic.posts.slice(1)) {
      parts.push(renderForumPost(post));
    }
  }

  return parts.join('\n');
}

export async function getForumArchiveDocForProduct(
  productSlug: string,
  productTitle: string,
  externalUrl?: string | null,
): Promise<ForumArchiveDoc | null> {
  const archive = await getProductForumArchive(productSlug, externalUrl);
  const topic = archive.officialTopic;
  if (!topic && archive.relatedTopics.length === 0) return null;

  const headings: TocHeading[] = [];

  if (topic) {
    headings.push(
      ...topic.sections.map((section) => ({
        depth: 2,
        id: section.id,
        text: section.title,
      })),
    );

    if (topic.posts.length > 1) {
      headings.push({
        depth: 2,
        id: 'thread-replies',
        text: 'Thread Replies',
      });
    }
  }

  if (archive.relatedTopics.length > 0) {
    headings.push({
      depth: topic ? 2 : 1,
      id: 'related-archived-discussions',
      text: topic ? 'Related Archived Discussions' : 'Community Discussions',
    });

    for (const relatedTopic of archive.relatedTopics) {
      headings.push({
        depth: topic ? 3 : 2,
        id: relatedTopic.slug,
        text: relatedTopic.title,
      });

      headings.push(
        ...relatedTopic.sections.map((section) => ({
          depth: topic ? 4 : 3,
          id: `${relatedTopic.slug}-${section.id}`,
          text: section.title,
        })),
      );

      if (relatedTopic.posts.length > 1) {
        headings.push({
          depth: topic ? 4 : 3,
          id: `${relatedTopic.slug}-thread-replies`,
          text: `${relatedTopic.title} Replies`,
        });
      }
    }
  }

  const htmlParts = [
    '<div class="rounded-lg border border-base-300 bg-base-200/60 p-4 mb-6">',
    topic
      ? `<p><strong>Archived community reference.</strong> This page preserves the official LZX Community forum thread for ${escapeHtml(productTitle)} inside the new documentation site.</p>`
      : `<p><strong>Archived community reference.</strong> This page compiles related LZX Community forum discussions for ${escapeHtml(productTitle)} inside the new documentation site.</p>`,
    archive.relatedTopics.length > 0
      ? `<p>${topic ? 'Additional related discussions are included below.' : 'Related discussions are compiled below.'}</p>`
      : '',
    '</div>',
  ];

  if (topic) {
    htmlParts.push(
      renderForumTopic(topic, {
        includeTopicHeading: false,
        topicHeadingDepth: 2,
        sectionHeadingDepth: 2,
        sectionIdPrefix: '',
      }),
    );
  }

  if (archive.relatedTopics.length > 0) {
    htmlParts.push(
      topic
        ? '<h2 id="related-archived-discussions">Related Archived Discussions</h2>'
        : '<h1 id="related-archived-discussions">Community Discussions</h1>',
    );

    for (const relatedTopic of archive.relatedTopics) {
      htmlParts.push(
        renderForumTopic(relatedTopic, {
          includeTopicHeading: true,
          topicHeadingDepth: topic ? 3 : 2,
          sectionHeadingDepth: topic ? 4 : 3,
          sectionIdPrefix: `${relatedTopic.slug}-`,
        }),
      );
    }
  }

  const wordCount = stripHtml(
    [topic, ...archive.relatedTopics]
      .filter((entry): entry is ForumArchiveTopic => entry != null)
      .flatMap((entry) => entry.posts.map((post) => post.html))
      .join(' '),
  )
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    slug: topic?.slug ?? `${productSlug}-community-archive`,
    path: `forum-archive/${productSlug}`,
    frontmatter: {
      title: `${productTitle} Archive`,
      description: topic?.excerpt ?? archive.relatedTopics[0]?.excerpt ?? '',
    },
    html: htmlParts.filter(Boolean).join('\n'),
    headings,
    readingTime: Math.max(1, Math.ceil(wordCount / 200)),
  };
}