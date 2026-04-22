/**
 * Loads per-product support content (FAQ items, setup prerequisites)
 * from `content/support/<slug>.md` markdown files.
 *
 * Frontmatter shape:
 *   ---
 *   slug: videomancer
 *   setupPrerequisites: [string]
 *   faqItems:
 *     - question: string
 *       answer: string  # markdown allowed
 *   ---
 */
import matter from 'gray-matter';
import {getMarkdownToHTML} from '~/lib/markdown';

export interface SupportFaqItem {
  question: string;
  /** Pre-rendered HTML (from markdown source). */
  answer: string;
}

export interface SupportContent {
  faqItems?: SupportFaqItem[];
  setupPrerequisites?: string[];
}

interface SupportFrontmatter {
  slug?: string;
  setupPrerequisites?: string[];
  faqItems?: Array<{question: string; answer: string}>;
}

const supportFiles = import.meta.glob<string>('../../content/support/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const cache = new Map<string, SupportContent>();

function pathFor(slug: string): string {
  return `../../content/support/${slug}.md`;
}

/**
 * Trim a single trailing newline that gray-matter leaves on YAML
 * block-scalar values. Markdown answers should be inline-rendered.
 */
function normalizeAnswer(answer: string): string {
  return answer.trim();
}

export function loadSupportContent(slug: string): SupportContent {
  const cached = cache.get(slug);
  if (cached) return cached;

  const raw = supportFiles[pathFor(slug)];
  if (!raw) {
    const empty: SupportContent = {};
    cache.set(slug, empty);
    return empty;
  }

  let frontmatter: SupportFrontmatter = {};
  try {
    frontmatter = matter(raw).data as SupportFrontmatter;
  } catch {
    cache.set(slug, {});
    return {};
  }

  const result: SupportContent = {
    setupPrerequisites: frontmatter.setupPrerequisites,
    faqItems: frontmatter.faqItems?.map((item) => ({
      question: item.question,
      answer: getMarkdownToHTML(normalizeAnswer(item.answer)),
    })),
  };

  cache.set(slug, result);
  return result;
}
