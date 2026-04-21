import {describe, expect, it} from 'vitest';

import {
  getForumArchiveDocForProduct,
  getProductForumArchive,
} from '~/data/forum-archive.server';

describe('forum archive helpers', () => {
  it('resolves official all-about topics and extracts sections', async () => {
    const archive = await getProductForumArchive(
      'vidiot',
      'https://community.lzxindustries.net/t/all-about-vidiot/1344',
    );

    expect(archive.officialTopic?.slug).toBe('all-about-vidiot');
    expect(archive.officialTopic?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({title: 'Downloads'}),
        expect.objectContaining({title: 'Other Resources'}),
      ]),
    );
    expect(archive.officialTopic?.imageUrls.length).toBeGreaterThan(0);
  });

  it('finds related product discussions when no official all-about topic exists', async () => {
    const archive = await getProductForumArchive('liquid-tv');

    expect(archive.officialTopic).toBeNull();
    expect(archive.relatedTopics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({slug: 'connecting-liquid-tv-to-visual-cortex'}),
      ]),
    );
    expect(
      archive.relatedTopics.find(
        (topic) => topic.slug === 'connecting-liquid-tv-to-visual-cortex',
      )?.posts.length,
    ).toBeGreaterThan(1);
  });

  it('builds a documentation fallback from the official topic', async () => {
    const doc = await getForumArchiveDocForProduct(
      'fortress',
      'Fortress',
      'https://community.lzxindustries.net/t/all-about-fortress/1392',
    );

    expect(doc?.frontmatter.title).toBe('Fortress Archive');
    expect(doc?.html).toContain('Archived community reference');
    expect(doc?.html).toContain('Palette Selection Reference');
    expect(doc?.headings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({text: 'Features'}),
      ]),
    );
  });

  it('builds a documentation fallback from related discussions when no official topic exists', async () => {
    const doc = await getForumArchiveDocForProduct('liquid-tv', 'Liquid TV');

    expect(doc?.frontmatter.title).toBe('Liquid TV Archive');
    expect(doc?.html).toContain('Community Discussions');
    expect(doc?.html).toContain('Connecting Liquid TV to Visual Cortex');
    expect(doc?.html).toContain('posted #2');
  });
});