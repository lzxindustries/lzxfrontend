import {describe, expect, it} from 'vitest';
import {
  buildSidebar,
  getBlogPost,
  getDocPage,
  getPrevNext,
  listBlogPosts,
} from '~/lib/content.server';

describe('content.server blog and docs integration', () => {
  it('uses frontmatter blog slugs in blog listings', () => {
    const post = listBlogPosts().find(
      (entry) => entry.slug === 'videomancer-preview-release',
    );

    expect(post).toBeDefined();
    expect(post?.date).toBe('2026-03-12');
  });

  it('resolves legacy dated blog folder slugs to the canonical slug', async () => {
    const post = await getBlogPost('2026-03-12-videomancer-preview-release');

    expect(post).not.toBeNull();
    expect(post?.slug).toBe('videomancer-preview-release');
    expect(post?.frontmatter.title).toContain('Preview');
  });

  it('loads a nested docs page and renders HTML', async () => {
    const doc = await getDocPage('instruments/videomancer/user-manual');

    expect(doc).not.toBeNull();
    expect(doc?.frontmatter.title).toBeTruthy();
    expect(doc?.html).toContain('<h2');
  });

  it('builds sidebar navigation and computes prev/next links', () => {
    const sidebar = buildSidebar('case-and-power');
    const nav = getPrevNext('case-and-power', 'case-and-power/dc-distro');

    expect(sidebar.length).toBeGreaterThan(0);
    expect(nav.prev).not.toBeNull();
    expect(nav.next).not.toBeNull();
  });
});
