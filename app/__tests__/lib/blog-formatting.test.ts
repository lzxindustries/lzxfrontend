import {describe, expect, it} from 'vitest';
import {formatAuthorDisplay, formatBlogPostDate} from '~/lib/blog-formatting';

describe('blog-formatting', () => {
  it('formats ISO blog dates for display', () => {
    expect(formatBlogPostDate('2026-04-22')).toContain('April');
    expect(formatBlogPostDate('2026-04-22')).toContain('2026');
  });

  it('title-cases all-lowercase bylines', () => {
    expect(formatAuthorDisplay('kat')).toBe('Kat');
  });

  it('preserves mixed-case names', () => {
    expect(formatAuthorDisplay('LZX Industries')).toBe('LZX Industries');
  });
});
