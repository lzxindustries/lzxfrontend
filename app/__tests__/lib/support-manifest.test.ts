import {describe, expect, it} from 'vitest';
import {
  SUPPORT_MANIFEST,
  type ProductSupportRecord,
  shouldShowGuidedUpdaterOnDownloads,
} from '~/data/support-manifest';
import {loadSupportContent} from '~/data/support-content.server';
import {
  getSlugEntry,
  getAllModuleSlugs,
  getAllInstrumentEntries,
} from '~/data/product-slugs';

describe('SUPPORT_MANIFEST structure', () => {
  it('is a non-empty record', () => {
    const keys = Object.keys(SUPPORT_MANIFEST);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('each entry has a slug matching its key', () => {
    for (const [key, entry] of Object.entries(SUPPORT_MANIFEST)) {
      expect(entry.slug).toBe(key);
    }
  });

  it('each entry has manuals as an array', () => {
    for (const entry of Object.values(SUPPORT_MANIFEST)) {
      expect(Array.isArray(entry.manuals)).toBe(true);
    }
  });

  it('each entry has relatedProductSlugs as an array', () => {
    for (const entry of Object.values(SUPPORT_MANIFEST)) {
      expect(Array.isArray(entry.relatedProductSlugs)).toBe(true);
    }
  });

  it('each manual version has required fields', () => {
    for (const entry of Object.values(SUPPORT_MANIFEST)) {
      for (const manual of entry.manuals) {
        expect(typeof manual.version).toBe('string');
        expect(typeof manual.date).toBe('string');
        expect(typeof manual.url).toBe('string');
        expect(manual.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('each faqItem from loaded support content has question and answer strings', () => {
    for (const slug of Object.keys(SUPPORT_MANIFEST)) {
      const content = loadSupportContent(slug);
      if (content.faqItems) {
        for (const faq of content.faqItems) {
          expect(typeof faq.question).toBe('string');
          expect(typeof faq.answer).toBe('string');
          expect(faq.question.length).toBeGreaterThan(0);
          expect(faq.answer.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('setupPrerequisites from loaded support content is an array of strings when present', () => {
    for (const slug of Object.keys(SUPPORT_MANIFEST)) {
      const content = loadSupportContent(slug);
      if (content.setupPrerequisites) {
        expect(Array.isArray(content.setupPrerequisites)).toBe(true);
        for (const prereq of content.setupPrerequisites) {
          expect(typeof prereq).toBe('string');
        }
      }
    }
  });

  it('connectSupported is a boolean when present', () => {
    for (const entry of Object.values(SUPPORT_MANIFEST)) {
      if (entry.connectSupported !== undefined) {
        expect(typeof entry.connectSupported).toBe('boolean');
      }
    }
  });

  it('showGuidedUpdaterOnDownloads is a boolean when present', () => {
    for (const entry of Object.values(SUPPORT_MANIFEST)) {
      if (entry.showGuidedUpdaterOnDownloads !== undefined) {
        expect(typeof entry.showGuidedUpdaterOnDownloads).toBe('boolean');
      }
    }
  });
});

describe('SUPPORT_MANIFEST slug consistency', () => {
  it('every manifest slug exists in product-slugs', () => {
    for (const slug of Object.keys(SUPPORT_MANIFEST)) {
      const entry = getSlugEntry(slug);
      expect(entry).not.toBeNull();
    }
  });

  it('every relatedProductSlug is a valid product slug', () => {
    for (const [slug, record] of Object.entries(SUPPORT_MANIFEST)) {
      for (const related of record.relatedProductSlugs) {
        const entry = getSlugEntry(related);
        expect(
          entry,
          `Related product "${related}" in manifest entry "${slug}" is not a valid slug`,
        ).not.toBeNull();
      }
    }
  });
});

describe('SUPPORT_MANIFEST coverage', () => {
  it('covers all active (non-hidden) instruments', () => {
    const instrumentEntries = getAllInstrumentEntries();
    const activeInstruments = instrumentEntries.filter((e) => !e.isHidden);
    for (const entry of activeInstruments) {
      expect(
        SUPPORT_MANIFEST[entry.canonical],
        `Active instrument "${entry.canonical}" missing from SUPPORT_MANIFEST`,
      ).toBeDefined();
    }
  });

  it('covers all active (non-hidden) modules without externalUrl', () => {
    const moduleSlugs = getAllModuleSlugs();
    for (const slug of moduleSlugs) {
      const entry = getSlugEntry(slug);
      if (!entry || entry.isHidden || entry.externalUrl) continue;
      expect(
        SUPPORT_MANIFEST[slug],
        `Active module "${slug}" missing from SUPPORT_MANIFEST`,
      ).toBeDefined();
    }
  });
});

describe('SUPPORT_MANIFEST key products', () => {
  it('videomancer has FAQ items in support content', () => {
    const content = loadSupportContent('videomancer');
    expect(content.faqItems).toBeDefined();
    expect(content.faqItems!.length).toBeGreaterThan(0);
  });

  it('videomancer has setup prerequisites in support content', () => {
    const content = loadSupportContent('videomancer');
    expect(content.setupPrerequisites).toBeDefined();
    expect(content.setupPrerequisites!.length).toBeGreaterThan(0);
  });

  it('videomancer has connectSupported = true', () => {
    expect(SUPPORT_MANIFEST['videomancer'].connectSupported).toBe(true);
  });

  it('videomancer has manual entries', () => {
    expect(SUPPORT_MANIFEST['videomancer'].manuals.length).toBeGreaterThan(0);
  });

  it('videomancer manual points at the product hub, not a legacy /docs path', () => {
    const url = SUPPORT_MANIFEST['videomancer'].manuals[0]?.url;
    expect(url).toMatch(/^\/instruments\/videomancer\/manual\//);
  });

  it('proc, fkg3, and smx3 have optional support markdown with FAQ', () => {
    for (const slug of ['proc', 'fkg3', 'smx3'] as const) {
      const content = loadSupportContent(slug);
      expect(content.faqItems?.length).toBeGreaterThan(0);
    }
  });

  it('does not show guided updater on product downloads for connect-supported instruments', () => {
    expect(shouldShowGuidedUpdaterOnDownloads('videomancer')).toBe(false);
    expect(shouldShowGuidedUpdaterOnDownloads('chromagnon')).toBe(false);
  });

  it('shows guided updater on product downloads only when a module opts in', () => {
    const manifest: Record<string, ProductSupportRecord> = {
      ...SUPPORT_MANIFEST,
      esg3: {
        ...SUPPORT_MANIFEST['esg3'],
        showGuidedUpdaterOnDownloads: true,
      },
      videomancer: {
        ...SUPPORT_MANIFEST['videomancer'],
        showGuidedUpdaterOnDownloads: true,
      },
    };

    expect(shouldShowGuidedUpdaterOnDownloads('esg3', manifest)).toBe(true);
    expect(shouldShowGuidedUpdaterOnDownloads('videomancer', manifest)).toBe(
      false,
    );
  });
});
