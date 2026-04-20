import {describe, expect, it} from 'vitest';
import {
  getSlugEntry,
  getCanonicalSlug,
  getAllModuleSlugs,
  getAllInstrumentEntries,
} from '~/data/product-slugs';

describe('getSlugEntry', () => {
  it('returns null for non-existent slug', () => {
    expect(getSlugEntry('xxxxx-nonexistent')).toBeNull();
  });

  it('returns a SlugEntry for a known module slug', () => {
    const entry = getSlugEntry('esg3');
    expect(entry).not.toBeNull();
    expect(entry!.canonical).toBe('esg3');
    expect(entry!.hubType).toBe('module');
  });

  it('returns a SlugEntry for a known instrument slug', () => {
    const entry = getSlugEntry('videomancer');
    expect(entry).not.toBeNull();
    expect(entry!.canonical).toBe('videomancer');
    expect(entry!.hubType).toBe('instrument');
  });

  it('has name field for all entries', () => {
    const entry = getSlugEntry('videomancer');
    expect(entry).not.toBeNull();
    expect(typeof entry!.name).toBe('string');
    expect(entry!.name.length).toBeGreaterThan(0);
  });
});

describe('getCanonicalSlug', () => {
  it('returns null for non-existent slug', () => {
    expect(getCanonicalSlug('xxxxx-nonexistent')).toBeNull();
  });

  it('returns canonical for known slug', () => {
    expect(getCanonicalSlug('esg3')).toBe('esg3');
  });
});

describe('getAllModuleSlugs', () => {
  it('returns an array of strings', () => {
    const slugs = getAllModuleSlugs();
    expect(Array.isArray(slugs)).toBe(true);
    expect(slugs.length).toBeGreaterThan(0);
    for (const s of slugs) {
      expect(typeof s).toBe('string');
    }
  });

  it('all module slugs resolve via getSlugEntry', () => {
    const slugs = getAllModuleSlugs();
    for (const slug of slugs) {
      const entry = getSlugEntry(slug);
      expect(entry).not.toBeNull();
      expect(entry!.hubType).toBe('module');
    }
  });
});

describe('getAllInstrumentEntries', () => {
  it('returns an array of SlugEntry objects', () => {
    const entries = getAllInstrumentEntries();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      expect(e.hubType).toBe('instrument');
      expect(typeof e.canonical).toBe('string');
    }
  });

  it('includes videomancer', () => {
    const entries = getAllInstrumentEntries();
    const vm = entries.find((e) => e.canonical === 'videomancer');
    expect(vm).toBeDefined();
  });
});
