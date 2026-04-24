import {describe, expect, it} from 'vitest';

import {
  categorizeProductDownload,
  filterDownloadRowsForPublicSite,
  isPublicProductDownload,
} from '~/data/download-visibility';

describe('download-visibility', () => {
  it('classifies firmware and UF2', () => {
    expect(
      categorizeProductDownload('videomancer-1.0.0-rc.12.uf2', 'UF2', 'FW'),
    ).toBe('firmware_updates');
    expect(
      categorizeProductDownload('tbc2-firmware_1.0.3.zip', 'ZIP', 'TBC2 FW'),
    ).toBe('firmware_updates');
    expect(
      categorizeProductDownload('scrolls-1.0.1-stm32f411rc.zip', 'ZIP', 'S'),
    ).toBe('firmware_updates');
    expect(
      categorizeProductDownload('tbc2_1.0.7.zip', 'ZIP', 'TBC2 Firmware'),
    ).toBe('firmware_updates');
  });

  it('classifies program libraries and checksums', () => {
    expect(
      categorizeProductDownload(
        'videomancer-program-library-0.1.0-rc.1.zip',
        'ZIP',
        'Lib',
      ),
    ).toBe('program_or_media_library');
    expect(
      categorizeProductDownload(
        'videomancer-program-library-0.1.0-rc.1.zip.sha256',
        'SHA256',
        'Sum',
      ),
    ).toBe('program_or_media_library');
  });

  it('classifies PDFs and CSVs', () => {
    expect(
      categorizeProductDownload(
        'andor-1-user-manual.pdf',
        'PDF',
        'Manual',
      ),
    ).toBe('end_user_pdf_docs');
    expect(
      categorizeProductDownload(
        '940010-D0001-tbc2-mk2-low-noise-fan-upgrade-kit-instructions.pdf',
        'PDF',
        'Instructions',
      ),
    ).toBe('end_user_pdf_docs');
    expect(
      categorizeProductDownload(
        'castle-000-schematic_RevE.pdf',
        'PDF',
        'Schematic',
      ),
    ).toBe('schematic_pdf');
    expect(
      categorizeProductDownload('BUS168-SHIELD-REVB.pdf', 'PDF', 'Drawing'),
    ).toBe('mechanical_tech_pdf');
    expect(
      categorizeProductDownload('castle-000-bom_RevE.csv', 'CSV', 'BOM'),
    ).toBe('bom_csv');
  });

  it('hides non-whitelisted files', () => {
    expect(isPublicProductDownload('mystery-bundle.zip', 'ZIP', 'Extra')).toBe(
      false,
    );
    expect(isPublicProductDownload('parts-list.csv', 'CSV', 'Parts')).toBe(
      false,
    );
    expect(isPublicProductDownload('marketing-onepager.pdf', 'PDF', 'Ad')).toBe(
      false,
    );
    expect(isPublicProductDownload('panel.ai', 'AI', 'Panel')).toBe(false);
  });

  it('filters rows', () => {
    const rows = [
      {name: 'A', fileName: 'a-firmware.zip', fileType: 'ZIP'},
      {name: 'B', fileName: 'b-source.zip', fileType: 'ZIP'},
    ];
    expect(filterDownloadRowsForPublicSite(rows)).toEqual([rows[0]]);
  });
});
