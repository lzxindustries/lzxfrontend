import {Remarkable} from 'remarkable';
import {useEffect, useState} from 'react';

export function getMarkdownURLToHTML(url: string) {
  const [markdownString, setMarkdownString] = useState('');
  useEffect(() => {
    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        setMarkdownString(text);
      });
  }, []);

  const markdownRenderer = new Remarkable();
  const response = markdownRenderer.render(markdownString);
  return response;
}

export function getMarkdownToHTML(markdownString: string) {
  const markdownRenderer = new Remarkable();
  const response = markdownRenderer.render(markdownString);
  return response;
}
