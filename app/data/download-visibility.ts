/**
 * Product Hub download visibility for the public site.
 *
 * Full inventory remains in loaders and LFS metadata; only rows matching
 * these categories are shown until an admin/session gate exists.
 */

export const PUBLIC_PRODUCT_DOWNLOAD_CATEGORIES = [
  'firmware_updates',
  'end_user_pdf_docs',
  'schematic_pdf',
  'bom_csv',
  'mechanical_tech_pdf',
  'program_or_media_library',
] as const;

export type PublicProductDownloadCategory =
  (typeof PUBLIC_PRODUCT_DOWNLOAD_CATEGORIES)[number];

const PUBLIC_CATEGORY_SET = new Set<string>(PUBLIC_PRODUCT_DOWNLOAD_CATEGORIES);

export function categorizeProductDownload(
  fileName: string,
  fileType: string | undefined,
  name: string | undefined,
): PublicProductDownloadCategory | null {
  const stem = fileName.replace(/\.[^.]+$/, '');
  const combined = `${name ?? ''} ${fileName} ${stem}`.toLowerCase();
  const ext = (
    fileName.split('.').pop() ??
    fileType ??
    ''
  )
    .toLowerCase()
    .replace(/^\./, '');

  if (ext === 'uf2') return 'firmware_updates';

  if (ext === 'zip') {
    const fn = fileName.toLowerCase();
    if (
      fn.includes('firmware') ||
      fn.includes('stm32') ||
      /^tbc2-firmware[-_]/.test(fn) ||
      /^tbc2_\d+\.\d+/.test(fn)
    ) {
      return 'firmware_updates';
    }
    if (fn.includes('program-library') || fn.includes('program_library')) {
      return 'program_or_media_library';
    }
    return null;
  }

  if (ext === 'sha256') {
    const base = stem.toLowerCase();
    if (base.includes('program-library') || base.includes('program_library')) {
      return 'program_or_media_library';
    }
    return null;
  }

  if (ext === 'csv') {
    if (combined.includes('bom')) return 'bom_csv';
    return null;
  }

  if (ext === 'pdf') {
    if (combined.includes('schematic')) return 'schematic_pdf';
    if (
      combined.includes('manual') ||
      combined.includes('user guide') ||
      combined.includes('user-guide') ||
      combined.includes('quickstart') ||
      combined.includes('quick start') ||
      combined.includes('instruction')
    ) {
      return 'end_user_pdf_docs';
    }
    if (
      combined.includes('shield') ||
      combined.includes('dimensional') ||
      combined.includes('bus168') ||
      combined.includes('mechanical')
    ) {
      return 'mechanical_tech_pdf';
    }
    return null;
  }

  return null;
}

export function isPublicProductDownload(
  fileName: string,
  fileType?: string,
  name?: string,
): boolean {
  const cat = categorizeProductDownload(fileName, fileType, name);
  return cat != null && PUBLIC_CATEGORY_SET.has(cat);
}

export function filterDownloadRowsForPublicSite<
  T extends {fileName: string; fileType?: string; name: string},
>(rows: T[]): T[] {
  return rows.filter((row) =>
    isPublicProductDownload(row.fileName, row.fileType, row.name),
  );
}
