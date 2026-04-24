import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// Strip a leading YAML frontmatter block. Without this, the closing `---`
// is parsed as a setext H2 underline for the preceding YAML lines, rendering
// the frontmatter keys as a heading on the page.
function stripFrontmatter(markdownString: string): string {
  return markdownString.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

export function getMarkdownToHTML(markdownString: string) {
  if (!markdownString) return '';

  return String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, {allowDangerousHtml: false})
      .use(rehypeStringify)
      .processSync(stripFrontmatter(markdownString)),
  );
}
