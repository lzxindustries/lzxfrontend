import {Remarkable} from 'remarkable';

export function getMarkdownToHTML(markdownString: string) {
  const markdownRenderer = new Remarkable({html: false, xhtmlOut: true});
  return markdownRenderer.render(markdownString);
}
