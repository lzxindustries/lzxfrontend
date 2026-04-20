import {describe, expect, it} from 'vitest';

import {
  getExternalModuleListingEntries,
  getLegacyVisionaryModuleListingEntries,
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
    expect(getLfsProductSubtitle('Cyclops')).toBe(
      'EuroRack-to-ILDA Laser Display Interface',
    );
    expect(getLfsProductSubtitle('Pendulum')).toBe(
      'Dual Animator with Crossfader and Router',
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

  it('exposes the requested legacy Visionary modules from ModularGrid metadata', () => {
    const entries = getLegacyVisionaryModuleListingEntries();
    const slugs = entries.map((entry) => entry.slug);

    expect(slugs).toEqual(
      expect.arrayContaining([
        'color-video-encoder',
        'octal-video-quantizer-sequencer',
        'triple-video-multimode-filter',
        'video-flip-flops',
        'video-ramps',
        'video-sync-generator',
      ]),
    );

    expect(
      entries.find((entry) => entry.slug === 'color-video-encoder')
        ?.externalUrl,
    ).toBe('https://www.modulargrid.net/e/lzx-industries-color-video-encoder');
  });
});
