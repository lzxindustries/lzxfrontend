import {describe, expect, it} from 'vitest';

import {
  buildInstrumentTabs,
  buildModuleTabs,
  MANUAL_LABEL,
  DOWNLOADS_LABEL,
} from '~/data/hub-tabs';

/**
 * Verifies the canonical Hub tab contract:
 *
 * - Reference documentation is always labelled "Manual" (never
 *   "Docs") in both hub types. The old "Docs" label now only refers
 *   to the site-wide `/docs` hub.
 * - The downloads tab is always labelled "Downloads" (never
 *   "Software & Downloads").
 * - Learn and Setup surface only when meaningful per-product content
 *   exists. Empty defaults must not promote a tab.
 * - Instrument hubs omit Manual, Downloads, Specs, and Support from the
 *   nav when empty; Overview is always shown. (No Videos tab — use `/videos` URL.)
 * - Module tab ordering is deterministic with Patches in the educational slot.
 */

describe('buildInstrumentTabs', () => {
  const base = {
    slug: 'videomancer',
    hasManual: true,
    hasCuratedLearn: true,
    hasSetupContent: true,
    downloadCount: 2,
    hasSpecs: true,
    hasSupport: true,
  };

  it('uses canonical labels', () => {
    const tabs = buildInstrumentTabs(base);
    const labels = tabs.map((t) => t.label);

    expect(labels).toContain(MANUAL_LABEL);
    expect(labels).toContain(DOWNLOADS_LABEL);
    expect(labels).not.toContain('Docs');
    expect(labels).not.toContain('Software & Downloads');
  });

  it('preserves expected tab ordering', () => {
    const tabs = buildInstrumentTabs(base).filter((t) => !t.hidden);
    expect(tabs.map((t) => t.label)).toEqual([
      'Overview',
      'Learn',
      'Setup',
      'Manual',
      'Downloads',
      'Specs',
      'Support',
    ]);
  });

  it('hides Manual when no manual is published', () => {
    const tabs = buildInstrumentTabs({...base, hasManual: false});
    const manual = tabs.find((t) => t.label === MANUAL_LABEL);
    expect(manual?.hidden).toBe(true);
  });

  it('hides Learn when no curated cards exist', () => {
    const tabs = buildInstrumentTabs({...base, hasCuratedLearn: false});
    const learn = tabs.find((t) => t.label === 'Learn');
    expect(learn?.hidden).toBe(true);
  });

  it('hides Setup when no first-run content exists', () => {
    const tabs = buildInstrumentTabs({...base, hasSetupContent: false});
    const setup = tabs.find((t) => t.label === 'Setup');
    expect(setup?.hidden).toBe(true);
  });

  it('hides content tabs when their data is empty', () => {
    const tabs = buildInstrumentTabs({
      ...base,
      downloadCount: 0,
      hasSpecs: false,
    });
    const hidden = new Set(tabs.filter((t) => t.hidden).map((t) => t.label));
    expect(hidden.has(DOWNLOADS_LABEL)).toBe(true);
    expect(hidden.has('Specs')).toBe(true);
  });

  it('hides Support when hasSupport is false', () => {
    const tabs = buildInstrumentTabs({...base, hasSupport: false});
    expect(tabs.find((t) => t.label === 'Support')?.hidden).toBe(true);
  });

  it('always surfaces Overview', () => {
    const tabs = buildInstrumentTabs({
      slug: 'videomancer',
      hasManual: false,
      hasCuratedLearn: false,
      hasSetupContent: false,
      downloadCount: 0,
      hasSpecs: false,
      hasSupport: false,
    });
    const visible = tabs.filter((t) => !t.hidden).map((t) => t.label);
    expect(visible).toEqual(['Overview']);
  });

  it('uses /instruments/<slug> as the base path', () => {
    const tabs = buildInstrumentTabs(base);
    expect(tabs[0]!.to).toBe('/instruments/videomancer');
    expect(tabs.find((t) => t.label === MANUAL_LABEL)?.to).toBe(
      '/instruments/videomancer/manual',
    );
  });
});

describe('buildModuleTabs', () => {
  const base = {
    slug: 'esg3',
    hasLocalDocumentation: true,
    patchCount: 5,
    videoCount: 2,
    downloadCount: 3,
    hasSpecs: true,
  };

  it('uses canonical labels', () => {
    const tabs = buildModuleTabs(base);
    const labels = tabs.map((t) => t.label);
    expect(labels).toContain(MANUAL_LABEL);
    expect(labels).toContain(DOWNLOADS_LABEL);
    expect(labels).not.toContain('Docs');
  });

  it('does not include Learn or Setup', () => {
    const tabs = buildModuleTabs(base);
    const labels = tabs.map((t) => t.label);
    expect(labels).not.toContain('Learn');
    expect(labels).not.toContain('Setup');
  });

  it('preserves expected tab ordering', () => {
    const tabs = buildModuleTabs(base).filter((t) => !t.hidden);
    expect(tabs.map((t) => t.label)).toEqual([
      'Overview',
      'Manual',
      'Patches',
      'Videos',
      'Downloads',
      'Specs',
      'Support',
    ]);
  });

  it('hides Patches when none exist', () => {
    const tabs = buildModuleTabs({...base, patchCount: 0});
    const patches = tabs.find((t) => t.label === 'Patches');
    expect(patches?.hidden).toBe(true);
  });

  it('uses /modules/<slug> as the base path', () => {
    const tabs = buildModuleTabs(base);
    expect(tabs[0]!.to).toBe('/modules/esg3');
    expect(tabs.find((t) => t.label === MANUAL_LABEL)?.to).toBe(
      '/modules/esg3/manual',
    );
  });
});
