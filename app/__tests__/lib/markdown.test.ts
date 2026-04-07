import {describe, expect, it} from 'vitest';
import {getMarkdownToHTML} from '~/lib/markdown';

describe('getMarkdownToHTML', () => {
  it('converts basic markdown to HTML', () => {
    const result = getMarkdownToHTML('# Hello World');
    expect(result).toContain('<h1>');
    expect(result).toContain('Hello World');
  });

  it('converts paragraphs', () => {
    const result = getMarkdownToHTML('This is a paragraph.');
    expect(result).toContain('<p>');
    expect(result).toContain('This is a paragraph.');
  });

  it('converts bold text', () => {
    const result = getMarkdownToHTML('**bold text**');
    expect(result).toContain('<strong>');
    expect(result).toContain('bold text');
  });

  it('converts links', () => {
    const result = getMarkdownToHTML('[LZX](https://lzxindustries.net)');
    expect(result).toContain('<a');
    expect(result).toContain('https://lzxindustries.net');
    expect(result).toContain('LZX');
  });

  it('converts lists', () => {
    const result = getMarkdownToHTML('- Item 1\n- Item 2\n- Item 3');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('Item 1');
  });

  it('handles empty string', () => {
    const result = getMarkdownToHTML('');
    expect(result).toBe('');
  });
});
