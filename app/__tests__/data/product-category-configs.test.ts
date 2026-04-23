import {describe, expect, it} from 'vitest';

import {accessoriesCategoryConfig} from '~/data/category-configs/accessories.config';
import {partsCategoryConfig} from '~/data/category-configs/parts.config';
import {merchandiseCategoryConfig} from '~/data/category-configs/merchandise.config';

function collectHandles(config: {getRawSections: () => Array<{groups: Array<{entries: Array<{canonical: string}>}>}>}) {
  const handles: string[] = [];
  for (const section of config.getRawSections()) {
    for (const group of section.groups) {
      for (const entry of group.entries) {
        handles.push(entry.canonical);
      }
    }
  }
  return handles;
}

describe('new product category configs', () => {
  it('puts cables and sd cards under accessories', () => {
    const handles = collectHandles(accessoriesCategoryConfig);

    expect(handles).toContain('dc-power-cable');
    expect(handles).toContain('patch-cable');
    expect(handles).toContain('video-sync-distribution-cable');
    expect(handles).toContain('8gb-microsd-card');
  });

  it('puts power entry boards and knobs under parts', () => {
    const handles = collectHandles(partsCategoryConfig);

    expect(handles).toContain('power-entry-module-8hp');
    expect(handles).toContain('power-sync-entry-12hp');
    expect(handles).toContain('video-knob');
    expect(handles).not.toContain('video-knob-enamel-pin');
  });

  it('puts stickers, patches, tees, and pins under merchandise', () => {
    const handles = collectHandles(merchandiseCategoryConfig);

    expect(handles).toContain('videomancer-vinyl-sticker');
    expect(handles).toContain('cadet-series-embroidered-patch');
    expect(handles).toContain('videomancer-tee');
    expect(handles).toContain('video-knob-enamel-pin');
    expect(handles).not.toContain('patch-cable');
  });
});
