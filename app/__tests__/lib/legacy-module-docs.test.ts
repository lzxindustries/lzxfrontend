import {describe, expect, it} from 'vitest';

import {buildSyntheticLegacyModuleManualDoc} from '~/data/legacy-module-docs';
import type {LegacyProductContent} from '~/data/lfs-product-metadata';

describe('legacy module doc builder', () => {
  it('builds structured sections from legacy metadata including summaries and gallery images', () => {
    const content: LegacyProductContent = {
      slug: 'demo-module',
      name: 'Demo Module',
      subtitle: 'Voltage-addressable legacy processor',
      description: 'Legacy description',
      productType: 'eurorack_module',
      category: 'module',
      company: 'LZX Industries',
      shopifyId: null,
      externalUrl: null,
      isActive: false,
      isHidden: true,
      sourcePath: 'products/demo-module/product.json',
      descriptionHtml: '<p>Primary overview copy.</p>',
      descriptionText: 'Primary overview copy.',
      specsHtml: '<table><tr><td>Width</td><td>12 HP</td></tr></table>',
      galleryImages: [
        {
          src: 'https://example.com/demo-frontpanel.png',
          path: 'website/demo-frontpanel.png',
          alt: 'Demo front panel',
        },
      ],
      downloads: [
        {
          id: 'download-1',
          name: 'Demo Manual',
          fileName: 'demo-manual.pdf',
          fileType: 'PDF',
          description: 'Reference manual',
          version: '1.0',
          platform: null,
          releaseDate: null,
          href: 'https://example.com/demo-manual.pdf',
          sourcePath: 'downloads/demo-manual.pdf',
        },
      ],
      archiveAssets: [
        {
          id: 'archive-1',
          name: 'Panel Artwork',
          fileName: 'demo-panel.ai',
          fileType: 'AI',
          description: 'Illustrator source',
          href: null,
          sourcePath: 'panel-art/demo-panel.ai',
          relativePath: 'panel-art/demo-panel.ai',
          category: 'panel-art',
          categoryLabel: 'Panel Art',
          previewSrc: null,
          note: null,
          isDownload: false,
        },
      ],
    };

    const doc = buildSyntheticLegacyModuleManualDoc(
      'demo-module',
      'Demo Module',
      content,
      'https://example.com/external-reference',
    );

    expect(doc).not.toBeNull();
    expect(doc?.headings.map((heading) => heading.text)).toEqual(
      expect.arrayContaining([
        'At a Glance',
        'Overview',
        'Specifications',
        'Gallery',
        'Downloads',
        'Product Library Archive',
        'Additional References',
      ]),
    );
    expect(doc?.html).toContain('Voltage-addressable legacy processor');
    expect(doc?.html).toContain('demo-frontpanel.png');
    expect(doc?.html).toContain('Demo Manual');
    expect(doc?.html).toContain('Open external reference');
  });
});
