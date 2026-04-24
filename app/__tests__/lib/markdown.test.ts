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

  it('strips YAML frontmatter so keys are not rendered as a heading', () => {
    const input = [
      '---',
      "title: 'Start with Modular'",
      "description: 'Set up your first eurorack video synthesis system.'",
      'sidebar_position: 3',
      '---',
      '',
      '# Start with Modular',
      '',
      'Body copy.',
    ].join('\n');
    const result = getMarkdownToHTML(input);
    expect(result).not.toContain('title:');
    expect(result).not.toContain('sidebar_position');
    expect(result).not.toMatch(/<h2>[^<]*title:/);
    expect(result).toContain('<h1>');
    expect(result).toContain('Start with Modular');
  });
});
