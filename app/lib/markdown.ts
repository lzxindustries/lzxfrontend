import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export function getMarkdownToHTML(markdownString: string) {
  if (!markdownString) return '';

  return String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, {allowDangerousHtml: false})
      .use(rehypeStringify)
      .processSync(markdownString),
  );
}
