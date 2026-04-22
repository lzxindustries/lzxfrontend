import {describe, expect, it} from 'vitest';

import {systemsCategoryConfig} from '~/data/category-configs/systems.config';

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
      expect(systemsCategoryConfig.detailHref(entry, {sectionKey: 'gen3', groupKey: 'gen3'})).toBe(
        `/systems/${entry.canonical}`,
      );
    }
  });
});