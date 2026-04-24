import {describe, expect, it} from 'vitest';

import {systemsCategoryConfig} from '~/data/category-configs/systems.config';
import {getSystemProductHandle} from '~/data/product-slugs';
import {getProductRecord} from '~/data/product-catalog';

describe('systemsCategoryConfig', () => {
  it('links system cards to the system overview route', () => {
    const sections = systemsCategoryConfig.getRawSections();
    const entries = sections.flatMap((section) =>
      section.groups.flatMap((group) => group.entries),
    );

    expect(entries.map((entry) => entry.canonical)).toEqual([
      'double-vision',
      'double-vision-168',
      'double-vision-expander',
    ]);

    for (const entry of entries) {
      expect(
        systemsCategoryConfig.detailHref(entry, {
          sectionKey: 'gen3',
          groupKey: 'gen3',
        }),
      ).toBe(`/systems/${entry.canonical}`);
    }
  });
});

describe('getSystemProductHandle', () => {
  it('maps canonical slugs that differ from their Shopify handle', () => {
    expect(getSystemProductHandle('double-vision')).toBe(
      'double-vision-system',
    );
    expect(getSystemProductHandle('double-vision-168')).toBe(
      'double-vision-complete',
    );
  });

  it('returns the canonical slug when it matches the Shopify handle', () => {
    expect(getSystemProductHandle('double-vision-expander')).toBe(
      'double-vision-expander',
    );
  });

  it('returns null for non-system slugs', () => {
    expect(getSystemProductHandle('esg3')).toBeNull();
    expect(getSystemProductHandle('videomancer')).toBeNull();
    expect(getSystemProductHandle('not-a-real-slug')).toBeNull();
  });

  it('resolves every system canonical slug to an existing ProductRecord', () => {
    // Guards against catalog/slug drift: every card on /systems must
    // reach a real product entry without relying on the GID fallback.
    const sections = systemsCategoryConfig.getRawSections();
    const entries = sections.flatMap((section) =>
      section.groups.flatMap((group) => group.entries),
    );

    for (const entry of entries) {
      const handle = getSystemProductHandle(entry.canonical);
      expect(handle, `missing mapping for ${entry.canonical}`).not.toBeNull();
      const record = getProductRecord(handle!);
      expect(
        record,
        `no catalog record for ${entry.canonical} -> ${handle}`,
      ).not.toBeNull();
    }
  });
});
