import {describe, expect, it} from 'vitest';
import {SECTIONS as SUPPORT_SECTIONS} from '~/routes/($lang).support';
import {SECTIONS as DOCS_SECTIONS} from '~/routes/($lang).docs._index';
import {PATHS} from '~/routes/($lang).getting-started._index';
import {
  getLearnCards,
  getLearnCardHref,
  DEFAULT_LEARN_CARDS,
  INSTRUMENT_LEARN_CARDS,
} from '~/routes/($lang).instruments.$slug.learn';
import {rewriteLegacyDocsLinks} from '~/routes/($lang).instruments.$slug.specs';

describe('Support page SECTIONS', () => {
  it('has 6 sections', () => {
    expect(SUPPORT_SECTIONS).toHaveLength(6);
  });

  it('each section has title, description, to, and icon', () => {
    for (const section of SUPPORT_SECTIONS) {
      expect(typeof section.title).toBe('string');
      expect(typeof section.description).toBe('string');
      expect(typeof section.to).toBe('string');
      expect(typeof section.icon).toBe('string');
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.to).toMatch(/^\//);
    }
  });

  it('titles are task-oriented ("I need...")', () => {
    for (const section of SUPPORT_SECTIONS) {
      expect(section.title).toMatch(/^I need/);
    }
  });
});

describe('Docs index SECTIONS', () => {
  it('has 7 sections', () => {
    expect(DOCS_SECTIONS).toHaveLength(7);
  });

  it('each section has title, description, to, and icon', () => {
    for (const section of DOCS_SECTIONS) {
      expect(typeof section.title).toBe('string');
      expect(typeof section.description).toBe('string');
      expect(typeof section.to).toBe('string');
      expect(typeof section.icon).toBe('string');
    }
  });

  it('includes Videomancer section', () => {
    const vm = DOCS_SECTIONS.find((s: {title: string}) =>
      s.title.toLowerCase().includes('videomancer'),
    );
    expect(vm).toBeDefined();
  });

  it('includes Eurorack Modules section', () => {
    const modules = DOCS_SECTIONS.find((s: {title: string}) =>
      s.title.toLowerCase().includes('module'),
    );
    expect(modules).toBeDefined();
  });
});

describe('Getting Started PATHS', () => {
  it('has 3 paths', () => {
    expect(PATHS).toHaveLength(3);
  });

  it('each path has title, description, to, icon, and cta', () => {
    for (const path of PATHS) {
      expect(typeof path.title).toBe('string');
      expect(typeof path.description).toBe('string');
      expect(typeof path.to).toBe('string');
      expect(typeof path.icon).toBe('string');
      expect(typeof path.cta).toBe('string');
    }
  });

  it('includes the three expected paths', () => {
    const titles = PATHS.map((p: {title: string}) => p.title);
    expect(titles).toContain('Learn Video Synthesis');
    expect(titles).toContain('Start with Modular');
    expect(titles).toContain('Start with Videomancer');
  });

  it('Videomancer path links to instrument setup', () => {
    const vm = PATHS.find(
      (p: {title: string}) => p.title === 'Start with Videomancer',
    );
    expect(vm!.to).toContain('/instruments/videomancer');
  });
});

describe('Instrument Learn Cards', () => {
  it('default cards have at least 5 cards', () => {
    expect(DEFAULT_LEARN_CARDS.length).toBeGreaterThanOrEqual(5);
  });

  it('each default card has title, description, and icon', () => {
    for (const card of DEFAULT_LEARN_CARDS) {
      expect(typeof card.title).toBe('string');
      expect(typeof card.description).toBe('string');
      expect(typeof card.icon).toBe('string');
    }
  });

  it('each default card has either to or toKey', () => {
    for (const card of DEFAULT_LEARN_CARDS) {
      const hasDest = 'to' in card || 'toKey' in card;
      expect(hasDest).toBe(true);
    }
  });

  it('default cards include Getting Started card', () => {
    const gs = DEFAULT_LEARN_CARDS.find((c) => c.title === 'Getting Started');
    expect(gs).toBeDefined();
  });

  it('default cards include Community Forum as external', () => {
    const forum = DEFAULT_LEARN_CARDS.find(
      (c) => c.title === 'Community Forum',
    );
    expect(forum).toBeDefined();
    expect(forum!.external).toBe(true);
  });

  it('getLearnCards returns Videomancer-specific cards for videomancer', () => {
    const cards = getLearnCards('videomancer');
    expect(cards).toBe(INSTRUMENT_LEARN_CARDS['videomancer']);
    expect(cards.length).toBeGreaterThanOrEqual(7);
  });

  it('Videomancer cards include Quick Start Guide', () => {
    const cards = getLearnCards('videomancer');
    expect(cards.find((c) => c.title === 'Quick Start Guide')).toBeDefined();
  });

  it('Videomancer cards include Modulation Guide', () => {
    const cards = getLearnCards('videomancer');
    expect(cards.find((c) => c.title === 'Modulation Guide')).toBeDefined();
  });

  it('Videomancer cards include Fault Codes Reference', () => {
    const cards = getLearnCards('videomancer');
    expect(
      cards.find((c) => c.title === 'Fault Codes Reference'),
    ).toBeDefined();
  });

  it('Videomancer cards include Serial Port Guide', () => {
    const cards = getLearnCards('videomancer');
    expect(cards.find((c) => c.title === 'Serial Port Guide')).toBeDefined();
  });

  it('Videomancer cards include Historic Device References', () => {
    const cards = getLearnCards('videomancer');
    expect(
      cards.find((c) => c.title === 'Historic Device References'),
    ).toBeDefined();
  });

  it('getLearnCards falls back to defaults for unknown instrument', () => {
    const cards = getLearnCards('some-unknown-instrument');
    expect(cards).toBe(DEFAULT_LEARN_CARDS);
  });

  it('single-manual instruments have curated cards with Support & FAQ', () => {
    for (const slug of [
      'chromagnon',
      'vidiot',
      'andor-1-media-player',
      'double-vision',
      'double-vision-168',
      'double-vision-expander',
    ] as const) {
      const cards = getLearnCards(slug);
      expect(cards).toBe(INSTRUMENT_LEARN_CARDS[slug]);
      expect(cards.find((c) => c.title === 'Support & FAQ')).toBeDefined();
    }
  });
});

describe('getLearnCardHref', () => {
  const basePath = '/instruments/chromagnon';

  it('returns the raw URL for external cards', () => {
    const href = getLearnCardHref(
      {
        title: 'Community Forum',
        description: 'x',
        icon: 'forum',
        to: 'https://community.lzxindustries.net',
        external: true,
      },
      basePath,
    );
    expect(href).toBe('https://community.lzxindustries.net');
  });

  it('leaves absolute same-origin `to` paths alone', () => {
    const href = getLearnCardHref(
      {title: 't', description: 'd', icon: 'i', to: '/getting-started'},
      basePath,
    );
    expect(href).toBe('/getting-started');
  });

  it('resolves relative `to` against basePath (regression: /learn/setup 404)', () => {
    const href = getLearnCardHref(
      {title: 't', description: 'd', icon: 'i', to: 'setup'},
      basePath,
    );
    expect(href).toBe('/instruments/chromagnon/setup');
    expect(href).not.toContain('/learn/');
  });

  it('uses toKey as a basePath-relative segment when no `to` is provided', () => {
    const href = getLearnCardHref(
      {title: 't', description: 'd', icon: 'i', toKey: 'manual'},
      basePath,
    );
    expect(href).toBe('/instruments/chromagnon/manual');
  });

  it('every DEFAULT_LEARN_CARD resolves to an absolute URL or path', () => {
    for (const card of DEFAULT_LEARN_CARDS) {
      const href = getLearnCardHref(card, basePath);
      expect(href.startsWith('/') || /^https?:\/\//.test(href)).toBe(true);
    }
  });
});

describe('rewriteLegacyDocsLinks', () => {
  it('rewrites docs.lzxindustries.net URLs to local paths', () => {
    const input =
      '<a href="https://docs.lzxindustries.net/docs/modules/esg3">ESG3</a>';
    const result = rewriteLegacyDocsLinks(input);
    expect(result).toBe('<a href="/docs/modules/esg3">ESG3</a>');
  });

  it('rewrites http:// variant', () => {
    const input =
      '<a href="http://docs.lzxindustries.net/docs/guides/standards">Standards</a>';
    const result = rewriteLegacyDocsLinks(input);
    expect(result).toBe('<a href="/docs/guides/standards">Standards</a>');
  });

  it('leaves non-docs URLs unchanged', () => {
    const input = '<a href="https://example.com/page">Link</a>';
    const result = rewriteLegacyDocsLinks(input);
    expect(result).toBe(input);
  });

  it('leaves community.lzxindustries.net URLs unchanged', () => {
    const input =
      '<a href="https://community.lzxindustries.net/topic/123">Topic</a>';
    const result = rewriteLegacyDocsLinks(input);
    expect(result).toBe(input);
  });

  it('handles multiple legacy URLs in one string', () => {
    const input =
      '<a href="https://docs.lzxindustries.net/docs/a">A</a> and <a href="https://docs.lzxindustries.net/docs/b">B</a>';
    const result = rewriteLegacyDocsLinks(input);
    expect(result).not.toContain('docs.lzxindustries.net');
    expect(result).toContain('/docs/a');
    expect(result).toContain('/docs/b');
  });

  it('returns empty string for empty input', () => {
    expect(rewriteLegacyDocsLinks('')).toBe('');
  });
});
