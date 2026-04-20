import {describe, expect, it} from 'vitest';
import {
  getSlugEntry,
  getCanonicalSlug,
  getAllModuleSlugs,
  getAllInstrumentEntries,
  getModulesBySeries,
} from '~/data/product-slugs';
import {getModuleArtworkPath} from '~/data/module-artwork';
import {getInstrumentArtworkPath} from '~/data/instrument-artwork';

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

  it('returns a SlugEntry for TBC2 Expander as a module', () => {
    const entry = getSlugEntry('tbc2-expander');
    expect(entry).not.toBeNull();
    expect(entry!.canonical).toBe('tbc2-expander');
    expect(entry!.hubType).toBe('module');
    expect(entry!.series).toBe('gen3');
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

  it('includes the TBC2 expander', () => {
    expect(getAllModuleSlugs()).toContain('tbc2-expander');
  });
});

describe('getModulesBySeries', () => {
  it('groups TBC2 Expander with the Gen3 modules', () => {
    const gen3Modules = getModulesBySeries().get('gen3') ?? [];
    expect(gen3Modules.map((entry) => entry.canonical)).toContain(
      'tbc2-expander',
    );
  });
});

describe('getModuleArtworkPath', () => {
  it('uses the correct TBC2 artwork overrides', () => {
    expect(getModuleArtworkPath('tbc2')).toBe(
      '/images/tbc2-mk2-front-panel-square.png',
    );
    expect(getModuleArtworkPath('tbc2-expander')).toBe(
      '/images/tbc2-expander-front-panel-square.png',
    );
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

  it('has local artwork fallbacks for all instrument listing slugs', () => {
    const entries = getAllInstrumentEntries();
    for (const entry of entries) {
      expect(getInstrumentArtworkPath(entry.canonical)).toBeTruthy();
    }
  });
});
