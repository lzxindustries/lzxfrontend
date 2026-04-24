import {describe, expect, it} from 'vitest';
import {
  buildSidebar,
  getBlogPost,
  getDocPage,
  getPrevNext,
  hasDocPagePath,
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

  it('keeps explicit frontmatter blog image when present', () => {
    const post = listBlogPosts().find((entry) => entry.slug === 'code-cave');

    expect(post).toBeDefined();
    expect(post?.frontmatter.image).toBe('./chromagnon.png');
  });

  it('resolves explicit social-card image declared in updated frontmatter', () => {
    const post = listBlogPosts().find(
      (entry) => entry.slug === 'videomancer-preview-release',
    );

    expect(post).toBeDefined();
    expect(post?.frontmatter.image).toBe('/docs/img/social-card.jpg');
  });

  it('resolves legacy dated blog folder slugs to the canonical slug', async () => {
    const post = await getBlogPost('2026-03-12-videomancer-preview-release');

    expect(post).not.toBeNull();
    expect(post?.slug).toBe('videomancer-preview-release');
    expect(post?.frontmatter.title).toContain('Preview');
  });

  it('applies fallback blog image in detail loader when declared as social-card', async () => {
    const post = await getBlogPost('videomancer-preview-release');

    expect(post).not.toBeNull();
    expect(post?.frontmatter.image).toBe('/docs/img/social-card.jpg');
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

  it('resolves Videomancer program pages via their frontmatter slug alias', async () => {
    const doc = await getDocPage('instruments/videomancer/bitcullis');

    expect(doc).not.toBeNull();
    expect(doc?.frontmatter.title).toContain('Bitcullis');
    expect(doc?.urlPath).toBe('instruments/videomancer/bitcullis');
    expect(hasDocPagePath('instruments/videomancer/bitcullis')).toBe(true);
  });

  it('resolves the year-in-review blog post to its own content', async () => {
    const post = await getBlogPost('the-year-in-review');
    expect(post).not.toBeNull();
    expect(post?.slug).toBe('the-year-in-review');
    expect(post?.frontmatter.title).toBe('The Year In Review');
    expect(post?.date).toBe('2023-12-30');
  });

  it('finds Videomancer program pages in the hub sidebar prev/next', () => {
    const nav = getPrevNext(
      'instruments/videomancer',
      'instruments/videomancer/bitcullis',
    );
    expect(nav.prev || nav.next).toBeTruthy();
  });

  it('does not wrap the Videomancer section-root in a bogus Instruments folder', () => {
    const sidebar = buildSidebar('instruments/videomancer');

    // Before the fix, the root index.md surfaced as
    //   Instruments (folder) → Videomancer Manual (leaf)
    // in a sidebar already scoped to Videomancer. Keep the section root
    // as a top-level leaf and ensure no wrapper folder is emitted.
    const topLabels = sidebar.map((item) => item.label);
    expect(topLabels).not.toContain('Instruments');

    const rootItem = sidebar.find(
      (item) => item.path === 'instruments/videomancer',
    );
    expect(rootItem).toBeDefined();
    expect(rootItem?.children).toBeUndefined();
  });
});
