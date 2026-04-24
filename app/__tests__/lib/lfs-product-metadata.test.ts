import {describe, expect, it} from 'vitest';

import {
  getExternalModuleListingEntries,
  getLfsModuleSeriesArchiveAssets,
  getLfsProductContentBySlug,
  getLegacyProductContentBySlug,
  getLegacyVisionaryModuleMetadataBySlug,
  getLegacyVisionaryModuleListingEntries,
  getLfsProductMetadataByName,
  getLfsProductSubtitle,
} from '~/data/lfs-product-metadata';

describe('LFS product metadata helpers', () => {
  it('recovers subtitles for legacy products from LFS metadata and overrides', () => {
    expect(getLfsProductSubtitle('Video Logic')).toBe(
      'Boolean Video Logic Processor',
    );
    expect(getLfsProductSubtitle('DC Distro 3A')).toBe('DC Power Distributor');
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

  it('omits Video Headroom (VH.S) products from the external module listing', () => {
    const slugs = getExternalModuleListingEntries().map((entry) => entry.slug);

    expect(slugs).not.toContain('baja');
    expect(slugs).not.toContain('channel');
    expect(slugs).not.toContain('crossfade');
    expect(slugs).not.toContain('scanners');
    expect(slugs).not.toContain('submixer');
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
    expect(slugs).not.toContain('scroll-position-controller');
  });

  it('parses rich fallback content for legacy Visionary module hubs', () => {
    const entry = getLegacyVisionaryModuleMetadataBySlug('color-video-encoder');

    expect(entry?.subtitle).toBe(
      'RGB to NTSC/PAL video encoder, clipping and blanking of input signals, RGB contrast, brightness and inversion processing',
    );
    expect(entry?.descriptionHtml).toContain(
      'Color Video Encoder is one of two required modules',
    );
    expect(entry?.specsHtml).toContain('<table>');
  });

  it('normalizes generalized legacy content for hidden products', () => {
    const liquidTv = getLegacyProductContentBySlug('liquid-tv');
    const andorAccessories = getLegacyProductContentBySlug(
      'andor-1-media-player-deluxe-accessories-pack',
    );

    expect(liquidTv?.descriptionHtml).toContain(
      'Liquid TV is a compact color video monitor',
    );
    expect(liquidTv?.specsHtml).toContain('16 HP');
    expect(liquidTv?.galleryImages.length).toBeGreaterThan(0);

    expect(andorAccessories?.downloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({fileName: 'andor-1-user-manual.pdf'}),
      ]),
    );
  });

  it('publishes web-safe download hrefs and retains archive-only source files', () => {
    const videomancer = getLfsProductContentBySlug('videomancer');
    const cadetPatch = getLfsProductContentBySlug(
      'cadet-series-embroidered-patch',
    );

    expect(videomancer?.downloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fileName: 'videomancer-1.0.0-rc.12.uf2',
          href: expect.stringContaining('videomancer-1.0.0-rc.12.uf2'),
        }),
      ]),
    );

    expect(cadetPatch?.archiveAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'lzx_video_cadet_patch_9color_3_x3.ai',
          href: null,
        }),
      ]),
    );
  });

  it('includes orphaned website images in the product archive inventory', () => {
    const andorAccessories = getLfsProductContentBySlug(
      'andor-1-media-player-deluxe-accessories-pack',
    );

    expect(andorAccessories?.archiveAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'website/andor1_screenshot1.jpg',
          href: expect.stringContaining('andor1_screenshot1.jpg'),
        }),
      ]),
    );
  });

  it('indexes previously orphaned non-image product files in the archive inventory', () => {
    const doubleVision = getLfsProductContentBySlug('double-vision-168');

    expect(doubleVision?.archiveAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'website/double-vision-expander-168.ai',
          href: null,
        }),
      ]),
    );
  });

  it('merges supplemental product roots into archive and gallery content', () => {
    const alternateFrontpanel = getLfsProductContentBySlug(
      'alternate-frontpanel',
    );
    const tbc2 = getLfsProductContentBySlug('tbc2');

    expect(alternateFrontpanel?.galleryImages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining('expedition-black-panels-group.png'),
        }),
      ]),
    );
    expect(alternateFrontpanel?.archiveAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'website/expedition-black-panels-group.png',
          href: expect.stringContaining('expedition-black-panels-group.png'),
        }),
      ]),
    );

    expect(tbc2?.archiveAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'panel-art/tbc2_fpn_revb.ai',
          href: null,
        }),
      ]),
    );
  });

  it('builds synthetic legacy content from metadata-only and root-only folders', () => {
    const audioFrequencyDecoder = getLegacyProductContentBySlug(
      'audio-frequency-decoder',
    );
    const bitvision = getLfsProductContentBySlug('bitvision');

    expect(audioFrequencyDecoder?.descriptionHtml).toContain(
      'audio frequency decoder is an eight channel audio envelope extraction tool',
    );
    expect(audioFrequencyDecoder?.archiveAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'panel-art/lzx_afd_frontpanel_1.0.ai',
          href: null,
        }),
      ]),
    );

    expect(bitvision?.archiveAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'panel-art/bitvision_doc_user_manual.ai',
          href: null,
        }),
      ]),
    );
  });

  it('indexes shared series-level module archive roots', () => {
    const visionaryShared = getLfsModuleSeriesArchiveAssets('visionary');
    const orionShared = getLfsModuleSeriesArchiveAssets('orion');

    expect(visionaryShared).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'brand/logos/visionary_logo_white_1024.png',
          href: expect.stringContaining('visionary_logo_white_1024.png'),
        }),
      ]),
    );

    expect(orionShared).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: 'packaging/orion_16hp_product_box_fantastapack.pdf',
          href: expect.stringContaining(
            'orion_16hp_product_box_fantastapack.pdf',
          ),
        }),
        expect.objectContaining({
          relativePath: '_ingest/panel-art/lzx_arc_fpn_v1.2.ai',
          href: null,
        }),
      ]),
    );
  });
});
