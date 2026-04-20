import {describe, expect, it} from 'vitest';

import {
  getExternalModuleListingEntries,
  getLfsProductMetadataByName,
  getLfsProductSubtitle,
} from '~/data/lfs-product-metadata';

describe('LFS product metadata helpers', () => {
  it('recovers subtitles for legacy products from LFS metadata and overrides', () => {
    expect(getLfsProductSubtitle('Video Logic')).toBe(
      'Boolean Video Logic Processor',
    );
    expect(getLfsProductSubtitle('DC Distro 3A')).toBe(
      'DC Power Distributor',
    );
    expect(getLfsProductSubtitle('Color Chords')).toBe(
      'Four Channel Summing Matrix',
    );
  });

  it('exposes external module listing entries for VH.S products', () => {
    const slugs = getExternalModuleListingEntries().map((entry) => entry.slug);

    expect(slugs).toContain('baja');
    expect(slugs).toContain('channel');
    expect(slugs).toContain('crossfade');
    expect(slugs).toContain('scanners');
    expect(slugs).toContain('submixer');
  });

  it('preserves external URLs for external-only modules', () => {
    const baja = getLfsProductMetadataByName('BAJA');

    expect(baja?.externalUrl).toBe(
      'https://www.videoheadroom.systems/video-synthesizers/p/baja',
    );
  });
});
