import {getMarkdownToHTML} from '~/lib/markdown';

type RawManifestFile = {
  path?: string;
  extension?: string;
  note?: string;
};

interface RawManifestObject {
  [key: string]: RawManifestValue;
}

type RawManifestValue =
  | RawManifestFile[]
  | RawManifestObject
  | null
  | undefined;

type RawLfsProduct = {
  slug?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  product_type?: string;
  category?: string;
  company?: string;
  shopify_id?: string;
  images?: {
    external_url?: string;
    frontpanel?: string;
  };
  specs?: Record<string, string | number | boolean | null>;
  file_manifest?: {
    website?: RawManifestFile[];
    modulargrid?: RawManifestFile[];
    photos?: RawManifestFile[];
    downloads?: RawManifestFile[];
    [key: string]: RawManifestValue;
  };
  status?: {
    is_active?: boolean;
    is_hidden?: boolean;
  };
};

export interface LfsProductMetadata {
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  productType: string | null;
  category: string | null;
  company: string | null;
  shopifyId: string | null;
  externalUrl: string | null;
  isActive: boolean;
  isHidden: boolean;
  sourcePath: string;
}

export interface LegacyModuleListingEntry {
  slug: string;
  name: string;
  subtitle: string | null;
  externalUrl: string | null;
  isHidden: boolean;
  sourcePath: string;
}

export interface LegacyVisionaryModuleMetadata
  extends LegacyModuleListingEntry {
  descriptionHtml: string | null;
  descriptionText: string | null;
  specsHtml: string | null;
}

export interface LfsProductGalleryImage {
  src: string;
  path: string;
  alt: string;
}

export interface LfsProductDownload {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  description: string;
  version: string | null;
  platform: string | null;
  releaseDate: string | null;
  href: string;
  sourcePath: string;
}

export interface LfsProductAsset {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  description: string;
  href: string | null;
  sourcePath: string;
  relativePath: string;
  category: string;
  categoryLabel: string;
  previewSrc: string | null;
  note: string | null;
  isDownload: boolean;
}

export interface LfsProductContent extends LfsProductMetadata {
  descriptionHtml: string | null;
  descriptionText: string | null;
  specsHtml: string | null;
  galleryImages: LfsProductGalleryImage[];
  downloads: LfsProductDownload[];
  archiveAssets: LfsProductAsset[];
}

export type LegacyProductContent = LfsProductContent;

const lfsProductFiles = import.meta.glob<RawLfsProduct>(
  '../../lfs/library/products/**/*.json',
  {eager: true, import: 'default'},
);

const lfsProductImageFiles = import.meta.glob<string>(
  '../../lfs/library/products/**/*.{avif,AVIF,gif,GIF,jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}',
  {eager: true, import: 'default', query: '?url'},
);

const lfsProductPublishedFiles = import.meta.glob<string>(
  '../../lfs/library/products/**/*.{csv,CSV,pdf,PDF,sha256,SHA256,svg,SVG,uf2,UF2,zip,ZIP}',
  {eager: true, import: 'default', query: '?url'},
);

/** Illustrator sources — served as static URLs for archive downloads. */
const lfsProductDesignFiles = import.meta.glob<string>(
  '../../lfs/library/products/**/*.{ai,AI}',
  {eager: true, import: 'default', query: '?url'},
);

const LFS_PRODUCTS_ROOT = '../../lfs/library/products';

const SUPPLEMENTAL_PRODUCT_ROOTS: Record<string, string[]> = {
  'alternate-frontpanel': [
    `${LFS_PRODUCTS_ROOT}/accessories/alternate-frontpanels`,
  ],
  bitvision: [`${LFS_PRODUCTS_ROOT}/instruments/bitvision`],
  'cadet-ix-vco': [
    `${LFS_PRODUCTS_ROOT}/eurorack-modules/cadet/cadet-ix-voltage-controlled-oscillator`,
  ],
  'scroll-position-controller': [
    `${LFS_PRODUCTS_ROOT}/eurorack-modules/visionary/scroll-position-controller`,
  ],
  tbc2: [`${LFS_PRODUCTS_ROOT}/eurorack-modules/orion/tbc2`],
  'triple-video-interface': [
    `${LFS_PRODUCTS_ROOT}/eurorack-modules/expedition/triple-video-interface`,
  ],
};

const MODULE_SERIES_SHARED_ROOTS: Record<string, string[]> = {
  cadet: [`${LFS_PRODUCTS_ROOT}/eurorack-modules/cadet/brand`],
  expedition: [`${LFS_PRODUCTS_ROOT}/eurorack-modules/expedition/packaging`],
  gen3: [`${LFS_PRODUCTS_ROOT}/eurorack-modules/gen3/panel-art`],
  orion: [
    `${LFS_PRODUCTS_ROOT}/eurorack-modules/orion/_ingest`,
    `${LFS_PRODUCTS_ROOT}/eurorack-modules/orion/packaging`,
  ],
  visionary: [`${LFS_PRODUCTS_ROOT}/eurorack-modules/visionary/brand`],
};

const modulargridMetadataFiles = import.meta.glob<string>(
  '../../lfs/library/products/**/modulargrid/metadata.md',
  {eager: true, import: 'default', query: '?raw'},
);

const legacyVisionaryMetadataFiles = import.meta.glob<string>(
  '../../lfs/library/products/eurorack-modules/visionary/**/modulargrid/metadata.md',
  {eager: true, import: 'default', query: '?raw'},
);

/** Product paths for gallery + archive discovery (merged known globs; avoids a catch-all tree walk in Vite). */
const lfsProductInventoryFiles = [
  ...new Set([
    ...Object.keys(lfsProductFiles),
    ...Object.keys(lfsProductImageFiles),
    ...Object.keys(lfsProductPublishedFiles),
    ...Object.keys(lfsProductDesignFiles),
    ...Object.keys(modulargridMetadataFiles),
    ...Object.keys(legacyVisionaryMetadataFiles),
  ]),
];

const LEGACY_VISIONARY_LISTING_SLUGS = new Set([
  'color-video-encoder',
  'octal-video-quantizer-sequencer',
  'triple-video-multimode-filter',
  'video-flip-flops',
  'video-ramps',
  'video-sync-generator',
]);

const LEGACY_VISIONARY_EXCLUDED_SLUGS = new Set(['scroll-position-controller']);

const SUBTITLE_OVERRIDES: Record<string, string> = {
  BAJA: '6 and 3 Phase Unipolar Analog Sine Wave Oscillator',
  CHANNEL: 'Signal Router, Fader, 1:3 Panner, Mixer, Soft Keyer',
  CROSSFADE: '3 Channel Crossfader with Luma Output',
  SCANNERS: 'Dual 3:1 Video Rated Scanner with Dual CV Inputs',
  SUBMIXER: '4 Input, 7 Output Submixer with Wavefold and 1V Utility Output',
  'Cadet I Sync Generator': 'Video Sync Generator',
  'Cadet II RGB Encoder': 'RGB to Composite Encoder',
  'Cadet III Video Input': 'Video Input Amplifier',
  'Cadet IV Dual Ramp Generator': 'Dual Ramp Generator',
  'Cadet V Scaler': 'Four Channel Voltage Scaler',
  'Cadet VII Processor': 'Wideband Voltage Processor',
  'Cadet VIII Hard Key Generator': 'Wideband Voltage Comparator',
  'Cadet IX VCO': 'Wideband Triangle Core VCO',
  'Cadet X Multiplier': 'Two and Four Quadrant Multiplier',
  'Color Chords': 'Four Channel Summing Matrix',
  Cyclops: 'EuroRack-to-ILDA Laser Display Interface',
  Curtain: 'Video Edge Processor',
  'DC Distro 5A': 'DC Power Distributor',
  Diver: 'Single Axis Waveform Sampler',
  Doorway: 'Linear Video Key Generator',
  'Escher Sketch': 'Touch Controller for Video Synthesis',
  Fortress: 'Low-Resolution Video Graphics Instrument',
  'Liquid TV': 'Color Video Monitor and Preview Driver',
  Mapper: 'HSB to Composite Color Translator',
  'Marble Index': 'Perspective and Depth Generator',
  'Memory Palace': 'Frame Buffer and Video Sampling Instrument',
  Passage: 'Triple Channel Signal Mixer and Processor',
  Pendulum: 'Dual Animator with Crossfader and Router',
  'Polar Fringe': 'Analog Chroma Key Generator',
  'Prismatic Ray': 'Wide Range Video Oscillator',
  'Sensory Translator': 'Five Channel Envelope Follower',
  Shapechanger: 'Coordinate Transformation Processor',
  Staircase: 'Five Step Waveshaper',
  'TBC2 Expander': 'Passive VGA Expansion Panel',
  Topogram: 'Sequential Soft Key Generator',
  'Triple Video Fader & Key Generator':
    'Triple Voltage Controlled Fader and Keyer',
  'Video Blending Matrix': 'Mathematical Signal Mixer',
  'Video Logic': 'Boolean Video Logic Processor',
  'Video Waveform Generator': 'Wide Range Video Oscillator',
  'Visual Cortex': 'Core Modular Video Synthesis Module',
  'War Of The Ants': 'Voltage Controlled Static Generator',
};

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cleanDescription(description: string | null): string | null {
  if (!description) return null;

  let cleaned = description.replace(/\s+/g, ' ').trim();
  const prefixes = [
    /^No longer available\.?\s*/i,
    /^Temporarily unavailable\.?\s*/i,
    /^Temporarily out of stock\.?\s*/i,
    /^Limited stock\.?\s*/i,
    /^SOLD OUT\.?\s*/i,
    /^Limited edition black panel(?: shipping[^.]+)?\.?\s*/i,
    /^DIY PCB & Frontpanel(?: set| Set)?(?: comes with [^.]+\.)?\s*/i,
    /^DIY PCB & Frontpanel Set\s*/i,
  ];

  for (const prefix of prefixes) {
    cleaned = cleaned.replace(prefix, '');
  }

  return cleaned.trim() || null;
}

function hasLegacyLifecycle(raw: RawLfsProduct): boolean {
  return raw.status?.is_hidden === true || raw.status?.is_active === false;
}

function sourceDirFromFilePath(sourcePath: string): string {
  return sourcePath.replace(/\/[^/]+$/, '');
}

function uniqueStrings(values: Iterable<string>): string[] {
  return [...new Set([...values].filter(Boolean))];
}

function getSupplementalProductRootPaths(slug: string): string[] {
  return SUPPLEMENTAL_PRODUCT_ROOTS[slug] ?? [];
}

function getOwnedProductSourceDirs(
  product: Pick<LfsProductMetadata, 'slug' | 'sourcePath'>,
): string[] {
  return uniqueStrings([
    sourceDirFromFilePath(product.sourcePath),
    ...getSupplementalProductRootPaths(product.slug),
  ]);
}

function listInventoryFilesUnderSourceDir(sourceDir: string): string[] {
  return lfsProductInventoryFiles.filter((sourcePath) =>
    sourcePath.startsWith(`${sourceDir}/`),
  );
}

function resolveProductAssetPath(
  sourcePath: string,
  relativePath: string,
): string {
  return `${sourceDirFromFilePath(sourcePath)}/${relativePath}`.replace(
    /\/\.\//g,
    '/',
  );
}

function toManifestFiles(
  value: RawManifestFile[] | undefined,
): RawManifestFile[] {
  return Array.isArray(value) ? value : [];
}

function flattenManifestFiles(
  value: RawManifestValue,
  category: string,
): Array<RawManifestFile & {category: string}> {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((entry) => ({...entry, category}));
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenManifestFiles(child, `${category}.${key}`),
  );
}

function productSlugFromMetadataSourcePath(sourcePath: string): string | null {
  const segments = sourcePath.split('/');
  const modulargridIndex = segments.lastIndexOf('modulargrid');
  return modulargridIndex > 0 ? segments[modulargridIndex - 1] ?? null : null;
}

function productRootFromMetadataSourcePath(sourcePath: string): string {
  const modulargridIndex = sourcePath.lastIndexOf('/modulargrid/');
  return modulargridIndex >= 0
    ? sourcePath.slice(0, modulargridIndex)
    : sourceDirFromFilePath(sourcePath);
}

function formatSpecLabel(key: string): string {
  if (key.toLowerCase() === 'hp') return 'HP';
  if (key.toLowerCase() === 'mounting_depth_mm') return 'Mounting depth (mm)';

  return capitalize(key.replace(/_/g, ' '));
}

function buildSpecsHtml(
  specs: Record<string, string | number | boolean | null> | undefined,
): string | null {
  if (!specs) return null;

  const rows = Object.entries(specs).filter(([, value]) => value != null);
  if (rows.length === 0) return null;

  const cells = rows
    .map(
      ([key, value]) =>
        `<tr><th>${formatSpecLabel(key)}</th><td>${String(value)}</td></tr>`,
    )
    .join('');

  return `<table><tbody>${cells}</tbody></table>`;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function humanizeFileName(fileName: string): string {
  const stem = fileName.replace(/\.[^.]+$/, '');
  return stem
    .replace(/[-_]+/g, ' ')
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function inferDownloadVersion(fileName: string): string | null {
  const stem = fileName.replace(/\.[^.]+$/, '');
  const revMatch = stem.match(/\b(Rev[._ -]?[A-Z0-9]+)\b/i);
  if (revMatch?.[1]) {
    return revMatch[1].replace(/[._]/g, ' ');
  }

  const versionMatch = stem.match(
    /\bv?(\d+\.\d+(?:\.\d+)?)(?:[-._]?([a-z]+(?:[-._]?\w+)*))?\b/i,
  );
  if (!versionMatch?.[1]) return null;

  return `v${versionMatch[1]}${versionMatch[2] ? `-${versionMatch[2]}` : ''}`;
}

function inferDownloadPlatform(fileName: string): string | null {
  const normalized = fileName.toLowerCase();
  if (normalized.includes('mac') || normalized.endsWith('.dmg')) return 'macOS';
  if (
    normalized.includes('windows') ||
    normalized.includes('win') ||
    normalized.endsWith('.exe') ||
    normalized.endsWith('.msi')
  ) {
    return 'Windows';
  }
  if (
    normalized.includes('linux') ||
    normalized.endsWith('.appimage') ||
    normalized.endsWith('.deb')
  ) {
    return 'Linux';
  }
  return null;
}

function buildDownloadDescription(fileName: string, fileType: string): string {
  const normalized = fileName.toLowerCase();
  const type = fileType.toUpperCase();

  if (normalized.includes('firmware')) return `Firmware update (${type})`;
  if (normalized.includes('manual')) return `User manual (${type})`;
  if (normalized.includes('quick') && normalized.includes('start')) {
    return `Quick start guide (${type})`;
  }
  if (normalized.includes('reference')) return `Reference guide (${type})`;
  if (normalized.includes('schematic')) return `Hardware schematic (${type})`;
  if (normalized.includes('bom')) return `Bill of materials (${type})`;

  return `${type} download`;
}

function buildAssetCategoryLabel(category: string): string {
  const tokens = category
    .split('.')
    .flatMap((segment) => segment.split('_'))
    .filter(Boolean)
    .map((segment) => formatSpecLabel(segment));

  return tokens.join(' / ');
}

function inferAssetType(
  fileName: string,
  explicitExtension: string | null,
): string {
  return (
    explicitExtension?.toUpperCase() ??
    fileName.split('.').pop()?.toUpperCase() ??
    'FILE'
  );
}

function isImageAssetPath(filePath: string): boolean {
  return /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(filePath);
}

function isGalleryAssetRelativePath(relativePath: string): boolean {
  const normalized = relativePath.replace(/^\.\//, '').toLowerCase();
  if (!isImageAssetPath(normalized)) return false;

  const segments = normalized.split('/').filter(Boolean);
  return (
    segments.includes('website') ||
    segments.includes('photos') ||
    normalized.startsWith('modulargrid/frontpanel.')
  );
}

function resolvePublishedAssetHref(sourcePath: string): string | null {
  // Design sources (.ai) are listed in the archive but intentionally not given
  // a public href (see lfs-product-metadata tests / publishing policy).
  return (
    lfsProductImageFiles[sourcePath] ??
    lfsProductPublishedFiles[sourcePath] ??
    null
  );
}

function isArchivableProductFile(relativePath: string): boolean {
  return !relativePath.endsWith('.json');
}

function inferArchiveCategoryFromRelativePath(relativePath: string): string {
  const normalized = relativePath.replace(/^(\.\.\/)+/, '');
  const firstSegment = normalized.split('/').find(Boolean);

  return firstSegment ? firstSegment.replace(/-/g, '_') : 'other';
}

function buildAssetDescription(
  fileName: string,
  fileType: string,
  category: string,
  note: string | null,
): string {
  if (category.startsWith('downloads')) {
    return buildDownloadDescription(fileName, fileType || 'FILE');
  }

  const label = buildAssetCategoryLabel(category);
  return note ? `${label} - ${note}` : label;
}

function extraArchiveAssetPaths(
  product: Pick<LfsProductMetadata, 'slug' | 'sourcePath'>,
): Array<{path: string; category: string; sourcePath: string}> {
  return getOwnedProductSourceDirs(product).flatMap((sourceDir) =>
    listInventoryFilesUnderSourceDir(sourceDir)
      .map((sourcePath) => ({
        sourcePath,
        relativePath: sourcePath.slice(sourceDir.length + 1),
      }))
      .filter(({relativePath}) => isArchivableProductFile(relativePath))
      .map(({relativePath, sourcePath}) => ({
        path: relativePath,
        category: inferArchiveCategoryFromRelativePath(relativePath),
        sourcePath,
      })),
  );
}

function buildGalleryImages(
  product: LfsProductMetadata,
  raw: RawLfsProduct,
): LfsProductGalleryImage[] {
  const sourceDirs = getOwnedProductSourceDirs(product);
  const primarySourceDir = sourceDirFromFilePath(product.sourcePath);
  const sourcePaths = new Set<string>();

  for (const entry of toManifestFiles(raw.file_manifest?.website)) {
    const assetPath = stringValue(entry.path);
    if (assetPath)
      sourcePaths.add(resolveProductAssetPath(product.sourcePath, assetPath));
  }

  for (const entry of toManifestFiles(raw.file_manifest?.photos)) {
    const assetPath = stringValue(entry.path);
    if (assetPath)
      sourcePaths.add(resolveProductAssetPath(product.sourcePath, assetPath));
  }

  const frontpanelPath = stringValue(raw.images?.frontpanel);
  if (frontpanelPath) {
    sourcePaths.add(
      resolveProductAssetPath(product.sourcePath, frontpanelPath),
    );
  }

  for (const sourceDir of sourceDirs) {
    for (const sourcePath of listInventoryFilesUnderSourceDir(sourceDir)) {
      const relativePath = sourcePath.slice(sourceDir.length + 1);
      if (isGalleryAssetRelativePath(relativePath)) {
        sourcePaths.add(sourcePath);
      }
    }
  }

  if (sourcePaths.size === 0) {
    for (const sourceDir of sourceDirs) {
      for (const extension of ['jpg', 'jpeg', 'png', 'webp']) {
        const modulargridFrontpanel = `${sourceDir}/modulargrid/frontpanel.${extension}`;
        if (lfsProductImageFiles[modulargridFrontpanel]) {
          sourcePaths.add(modulargridFrontpanel);
        }
      }
    }
  }

  return [...sourcePaths]
    .map((sourcePath) => {
      const src = lfsProductImageFiles[sourcePath];
      if (!src) return null;

      const fileName = sourcePath.split('/').pop() ?? product.name;
      return {
        src,
        path: sourcePath,
        alt: `${product.name} ${humanizeFileName(fileName)}`,
      } satisfies LfsProductGalleryImage;
    })
    .filter((entry): entry is LfsProductGalleryImage => entry != null);
}

function buildDownloads(
  product: LfsProductMetadata,
  raw: RawLfsProduct,
): LfsProductDownload[] {
  return toManifestFiles(raw.file_manifest?.downloads)
    .map<LfsProductDownload | null>((entry, index) => {
      const relativePath = stringValue(entry.path);
      if (!relativePath) return null;

      const fileName = relativePath.split('/').pop();
      if (!fileName) return null;

      const fileType =
        stringValue(entry.extension)?.toUpperCase() ??
        fileName.split('.').pop()?.toUpperCase() ??
        '';

      const sourcePath = resolveProductAssetPath(
        product.sourcePath,
        relativePath,
      );
      const href = resolvePublishedAssetHref(sourcePath);
      if (!href) return null;

      return {
        id: `lfs-download:${product.slug}:${index}`,
        name: humanizeFileName(fileName),
        fileName,
        fileType,
        description: buildDownloadDescription(fileName, fileType || 'FILE'),
        version: inferDownloadVersion(fileName),
        platform: inferDownloadPlatform(fileName),
        releaseDate: null as string | null,
        href,
        sourcePath,
      } satisfies LfsProductDownload;
    })
    .filter((entry): entry is LfsProductDownload => entry != null);
}

function buildArchiveAssets(
  product: LfsProductMetadata,
  raw: RawLfsProduct,
): LfsProductAsset[] {
  const manifestEntries = Object.entries(raw.file_manifest ?? {}).flatMap(
    ([category, value]) => flattenManifestFiles(value, category),
  );
  type ArchiveEntryWithOptionalSource =
    | (RawManifestFile & {category: string})
    | (RawManifestFile & {category: string; sourcePath: string});
  const seenSourcePaths = new Set<string>();

  for (const entry of manifestEntries) {
    const relativePath = stringValue(entry.path);
    if (relativePath) {
      seenSourcePaths.add(
        resolveProductAssetPath(product.sourcePath, relativePath),
      );
    }
  }

  const entries: ArchiveEntryWithOptionalSource[] = [
    ...manifestEntries,
    ...extraArchiveAssetPaths(product)
      .filter((entry) => !seenSourcePaths.has(entry.sourcePath))
      .map((entry) => ({
        path: entry.path,
        category: entry.category,
        extension: undefined,
        note: undefined,
        sourcePath: entry.sourcePath,
      })),
  ];

  return entries
    .map<LfsProductAsset | null>((entry, index) => {
      const relativePath = stringValue(entry.path);
      if (!relativePath) return null;

      const explicitSourcePath =
        'sourcePath' in entry ? stringValue(entry.sourcePath) : null;
      const sourcePath =
        explicitSourcePath ??
        resolveProductAssetPath(product.sourcePath, relativePath);
      const fileName = relativePath.split('/').pop();
      if (!fileName) return null;

      const fileType = inferAssetType(fileName, stringValue(entry.extension));
      const href = resolvePublishedAssetHref(sourcePath);
      const previewSrc = isImageAssetPath(relativePath)
        ? lfsProductImageFiles[sourcePath] ?? null
        : null;
      const note = stringValue(entry.note);

      return {
        id: `lfs-asset:${product.slug}:${index}`,
        name: humanizeFileName(fileName),
        fileName,
        fileType,
        description: buildAssetDescription(
          fileName,
          fileType,
          entry.category,
          note,
        ),
        href,
        sourcePath,
        relativePath,
        category: entry.category,
        categoryLabel: buildAssetCategoryLabel(entry.category),
        previewSrc,
        note,
        isDownload: entry.category.startsWith('downloads'),
      } satisfies LfsProductAsset;
    })
    .filter((entry): entry is LfsProductAsset => entry != null)
    .sort(
      (left, right) =>
        left.categoryLabel.localeCompare(right.categoryLabel) ||
        left.relativePath.localeCompare(right.relativePath),
    );
}

function deriveSubtitle(
  name: string,
  description: string | null,
): string | null {
  const cleaned = cleanDescription(description);
  if (!cleaned) return null;

  const namePattern = escapeRegExp(name).replace(/\s+/g, '\\s+');
  const match = cleaned.match(
    new RegExp(
      `^${namePattern}\\s+is\\s+(?:an?|the)\\s+(.+?)(?:\\.|,\\s+(?:Width|Specifications|Specs|features)|\\s+Width\\b)`,
      'i',
    ),
  );
  if (match?.[1]) {
    return capitalize(match[1].trim());
  }

  const firstSentence = cleaned
    .split(/(?<=[.!?])\s+/)[0]
    ?.replace(/[.!?]+$/, '');
  if (!firstSentence) return null;

  const concise =
    firstSentence.split(/,\s+(?:featuring|with|which|for)\b/i)[0] ??
    firstSentence;
  return concise.length > 96
    ? capitalize(concise.slice(0, 93).trimEnd()) + '...'
    : capitalize(concise.trim());
}

function legacyVisionarySlugFromSourcePath(sourcePath: string): string | null {
  const match = sourcePath.match(
    /\/visionary\/([^/]+)\/modulargrid\/metadata\.md$/,
  );
  const slug = match?.[1] ?? null;

  if (!slug || LEGACY_VISIONARY_EXCLUDED_SLUGS.has(slug)) return null;

  return slug;
}

function parseLegacyVisionaryName(raw: string): string | null {
  const match = raw.match(/^#\s+(.+)$/m);
  return stringValue(match?.[1] ?? null);
}

function parseLegacyVisionaryExternalUrl(raw: string): string | null {
  const match = raw.match(
    /\*\*ModularGrid:\*\*\s+\[[^\]]+\]\((https?:\/\/[^)]+)\)/,
  );
  return stringValue(match?.[1] ?? null);
}

function parseLegacyVisionarySubtitle(raw: string): string | null {
  const match = raw.match(/## Description\s*\n\s*\n\*\*(.+?)\*\*/s);
  return stringValue(match?.[1] ?? null);
}

function extractMarkdownSection(
  raw: string,
  sectionHeading: string,
): string | null {
  const match = raw.match(
    new RegExp(
      `##\\s+${escapeRegExp(
        sectionHeading,
      )}\\s*\\n\\s*([\\s\\S]*?)(?=\\n##\\s+|\\n---\\s*\\n|$)`,
      'i',
    ),
  );

  return stringValue(match?.[1] ?? null);
}

function stripLeadingBoldSummary(markdown: string | null): string | null {
  if (!markdown) return null;

  const stripped = markdown
    .replace(/^\*\*.+?\*\*\s*\n\s*/s, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return stripped || null;
}

function stripMarkdownFormatting(markdown: string | null): string | null {
  if (!markdown) return null;

  const stripped = markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[>*_`#-]/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return stripped || null;
}

function inferProductTypeFromSourceDir(sourceDir: string): string {
  if (sourceDir.includes('/instruments/')) return 'instrument';
  if (sourceDir.includes('/accessories/')) return 'accessory';
  if (sourceDir.includes('/eurorack-cases/')) return 'eurorack_case';
  return 'eurorack_module';
}

function buildSyntheticArchiveAssets(
  product: LfsProductMetadata,
): LfsProductAsset[] {
  return extraArchiveAssetPaths(product)
    .map<LfsProductAsset | null>((entry, index) => {
      const fileName = entry.path.split('/').pop();
      if (!fileName) return null;

      const fileType = inferAssetType(fileName, null);
      const href = resolvePublishedAssetHref(entry.sourcePath);
      const previewSrc = isImageAssetPath(entry.path)
        ? lfsProductImageFiles[entry.sourcePath] ?? null
        : null;

      return {
        id: `lfs-asset:${product.slug}:synthetic:${index}`,
        name: humanizeFileName(fileName),
        fileName,
        fileType,
        description: buildAssetDescription(
          fileName,
          fileType,
          entry.category,
          null,
        ),
        href,
        sourcePath: entry.sourcePath,
        relativePath: entry.path,
        category: entry.category,
        categoryLabel: buildAssetCategoryLabel(entry.category),
        previewSrc,
        note: null,
        isDownload: entry.category.startsWith('downloads'),
      } satisfies LfsProductAsset;
    })
    .filter((entry): entry is LfsProductAsset => entry != null)
    .sort(
      (left, right) =>
        left.categoryLabel.localeCompare(right.categoryLabel) ||
        left.relativePath.localeCompare(right.relativePath),
    );
}

function buildSyntheticGalleryImages(
  product: LfsProductMetadata,
): LfsProductGalleryImage[] {
  const sourcePaths = new Set<string>();

  for (const sourceDir of getOwnedProductSourceDirs(product)) {
    for (const sourcePath of listInventoryFilesUnderSourceDir(sourceDir)) {
      const relativePath = sourcePath.slice(sourceDir.length + 1);
      if (isGalleryAssetRelativePath(relativePath)) {
        sourcePaths.add(sourcePath);
      }
    }
  }

  return [...sourcePaths]
    .map((sourcePath) => {
      const src = lfsProductImageFiles[sourcePath];
      if (!src) return null;

      const fileName = sourcePath.split('/').pop() ?? product.name;
      return {
        src,
        path: sourcePath,
        alt: `${product.name} ${humanizeFileName(fileName)}`,
      } satisfies LfsProductGalleryImage;
    })
    .filter((entry): entry is LfsProductGalleryImage => entry != null);
}

function buildSyntheticProductContent(
  slug: string,
  options: {
    name: string;
    subtitle?: string | null;
    descriptionHtml?: string | null;
    descriptionText?: string | null;
    specsHtml?: string | null;
    externalUrl?: string | null;
    sourceDir: string;
  },
): LfsProductContent {
  const product = {
    slug,
    name: options.name,
    subtitle: options.subtitle ?? null,
    description: options.descriptionText ?? null,
    productType: inferProductTypeFromSourceDir(options.sourceDir),
    category: null,
    company: 'lzx',
    shopifyId: null,
    externalUrl: options.externalUrl ?? null,
    isActive: false,
    isHidden: true,
    sourcePath: `${options.sourceDir}/synthetic.json`,
  } satisfies LfsProductMetadata;

  return {
    ...product,
    descriptionHtml: options.descriptionHtml ?? null,
    descriptionText: options.descriptionText ?? null,
    specsHtml: options.specsHtml ?? null,
    galleryImages: buildSyntheticGalleryImages(product),
    downloads: [],
    archiveAssets: buildSyntheticArchiveAssets(product),
  } satisfies LfsProductContent;
}

const modulargridMetadataBySlug = new Map(
  Object.entries(modulargridMetadataFiles)
    .map(([sourcePath, raw]) => {
      const slug = productSlugFromMetadataSourcePath(sourcePath);
      if (!slug) return null;

      const descriptionMarkdown = stripLeadingBoldSummary(
        extractMarkdownSection(raw, 'Description'),
      );
      const specsMarkdown = extractMarkdownSection(raw, 'Specifications');
      const name = parseLegacyVisionaryName(raw);

      return [
        slug,
        {
          slug,
          name,
          subtitle: parseLegacyVisionarySubtitle(raw),
          externalUrl: parseLegacyVisionaryExternalUrl(raw),
          descriptionHtml: descriptionMarkdown
            ? getMarkdownToHTML(descriptionMarkdown)
            : null,
          descriptionText: stripMarkdownFormatting(descriptionMarkdown),
          specsHtml: specsMarkdown ? getMarkdownToHTML(specsMarkdown) : null,
          sourcePath,
        },
      ] as const;
    })
    .filter(
      (
        entry,
      ): entry is readonly [
        string,
        {
          slug: string;
          name: string | null;
          subtitle: string | null;
          externalUrl: string | null;
          descriptionHtml: string | null;
          descriptionText: string | null;
          specsHtml: string | null;
          sourcePath: string;
        },
      ] => entry != null,
    ),
);

const lfsProducts: LfsProductMetadata[] = Object.entries(lfsProductFiles)
  .filter(([sourcePath]) => !sourcePath.endsWith('/product-catalog.json'))
  .flatMap(([sourcePath, raw]) => {
    const name = stringValue(raw.name);
    const slug = stringValue(raw.slug);
    if (!name || !slug) return [];

    const rawShopifyId = stringValue(raw.shopify_id);
    const externalUrl =
      stringValue(raw.images?.external_url) ??
      (rawShopifyId?.startsWith('http') ? rawShopifyId : null);

    return [
      {
        slug,
        name,
        subtitle:
          stringValue(raw.subtitle) ??
          SUBTITLE_OVERRIDES[name] ??
          deriveSubtitle(name, stringValue(raw.description)),
        description: stringValue(raw.description),
        productType: stringValue(raw.product_type),
        category: stringValue(raw.category),
        company: stringValue(raw.company),
        shopifyId:
          rawShopifyId && rawShopifyId.startsWith('gid://shopify/Product/')
            ? rawShopifyId
            : null,
        externalUrl,
        isActive: Boolean(raw.status?.is_active),
        isHidden: Boolean(raw.status?.is_hidden),
        sourcePath,
      } satisfies LfsProductMetadata,
    ];
  });

const legacyVisionaryModuleListings: LegacyVisionaryModuleMetadata[] =
  Object.entries(legacyVisionaryMetadataFiles)
    .flatMap(([sourcePath, raw]) => {
      const slug = legacyVisionarySlugFromSourcePath(sourcePath);

      if (!slug || !LEGACY_VISIONARY_LISTING_SLUGS.has(slug)) return [];

      const name = parseLegacyVisionaryName(raw);
      if (!name) return [];

      const descriptionMarkdown = stripLeadingBoldSummary(
        extractMarkdownSection(raw, 'Description'),
      );
      const specsMarkdown = extractMarkdownSection(raw, 'Specifications');

      return [
        {
          slug,
          name,
          subtitle: parseLegacyVisionarySubtitle(raw),
          externalUrl: parseLegacyVisionaryExternalUrl(raw),
          isHidden: true,
          descriptionHtml: descriptionMarkdown
            ? getMarkdownToHTML(descriptionMarkdown)
            : null,
          descriptionText: stripMarkdownFormatting(descriptionMarkdown),
          specsHtml: specsMarkdown ? getMarkdownToHTML(specsMarkdown) : null,
          sourcePath,
        } satisfies LegacyVisionaryModuleMetadata,
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name));

const lfsProductsByName = new Map(
  lfsProducts.map((entry) => [entry.name, entry]),
);
const lfsProductsBySlug = new Map(
  lfsProducts.map((entry) => [entry.slug, entry]),
);
const legacyVisionaryMetadataBySlug = new Map(
  legacyVisionaryModuleListings.map((entry) => [entry.slug, entry]),
);

const productContentBySlug = new Map(
  Object.entries(lfsProductFiles)
    .filter(([sourcePath]) => !sourcePath.endsWith('/product-catalog.json'))
    .flatMap(([sourcePath, raw]) => {
      const slug = stringValue(raw.slug);
      const name = stringValue(raw.name);
      if (!slug || !name) return [];

      const product = lfsProductsBySlug.get(slug);
      if (!product) return [];

      const modulargridMetadata = modulargridMetadataBySlug.get(slug);
      const descriptionHtml =
        modulargridMetadata?.descriptionHtml ??
        (product.description ? getMarkdownToHTML(product.description) : null);
      const descriptionText =
        modulargridMetadata?.descriptionText ?? product.description ?? null;
      const specsHtml =
        modulargridMetadata?.specsHtml ?? buildSpecsHtml(raw.specs);

      return [
        [
          slug,
          {
            ...product,
            subtitle: modulargridMetadata?.subtitle ?? product.subtitle ?? null,
            externalUrl:
              product.externalUrl ?? modulargridMetadata?.externalUrl ?? null,
            descriptionHtml,
            descriptionText,
            specsHtml,
            galleryImages: buildGalleryImages(product, raw),
            downloads: buildDownloads(product, raw),
            archiveAssets: buildArchiveAssets(product, raw),
          } satisfies LfsProductContent,
        ] as const,
      ];
    }),
);

const sharedModuleSeriesRootPaths = new Set(
  Object.values(MODULE_SERIES_SHARED_ROOTS).flat(),
);

const syntheticProductContentBySlug = new Map(
  Object.entries(modulargridMetadataBySlug)
    .flatMap(([slug, metadata]) => {
      if (productContentBySlug.has(slug)) return [];

      const sourceDir = productRootFromMetadataSourcePath(metadata.sourcePath);
      if (sharedModuleSeriesRootPaths.has(sourceDir)) return [];

      return [
        [
          slug,
          buildSyntheticProductContent(slug, {
            name: metadata.name ?? humanizeFileName(slug),
            subtitle: metadata.subtitle,
            descriptionHtml: metadata.descriptionHtml,
            descriptionText: metadata.descriptionText,
            specsHtml: metadata.specsHtml,
            externalUrl: metadata.externalUrl,
            sourceDir,
          }),
        ] as const,
      ];
    })
    .concat(
      Object.entries(SUPPLEMENTAL_PRODUCT_ROOTS).flatMap(
        ([slug, sourceDirs]) => {
          if (
            productContentBySlug.has(slug) ||
            modulargridMetadataBySlug.has(slug)
          ) {
            return [];
          }

          const sourceDir = sourceDirs[0];
          if (!sourceDir) return [];

          return [
            [
              slug,
              buildSyntheticProductContent(slug, {
                name: humanizeFileName(slug),
                sourceDir,
              }),
            ] as const,
          ];
        },
      ),
    ),
);

const sharedModuleSeriesArchiveAssets = new Map(
  Object.entries(MODULE_SERIES_SHARED_ROOTS).map(([series, sourceDirs]) => {
    const seriesBaseDir = `${LFS_PRODUCTS_ROOT}/eurorack-modules/${series}`;

    const assets = sourceDirs
      .flatMap((sourceDir) =>
        listInventoryFilesUnderSourceDir(sourceDir)
          .map((sourcePath) => ({
            sourcePath,
            relativePath: sourcePath.slice(seriesBaseDir.length + 1),
          }))
          .filter(({relativePath}) => isArchivableProductFile(relativePath)),
      )
      .map<LfsProductAsset | null>(({relativePath, sourcePath}, index) => {
        const fileName = relativePath.split('/').pop();
        if (!fileName) return null;

        const fileType = inferAssetType(fileName, null);
        const href = resolvePublishedAssetHref(sourcePath);
        const previewSrc = isImageAssetPath(relativePath)
          ? lfsProductImageFiles[sourcePath] ?? null
          : null;
        const category = inferArchiveCategoryFromRelativePath(relativePath);

        return {
          id: `lfs-shared-asset:${series}:${index}`,
          name: humanizeFileName(fileName),
          fileName,
          fileType,
          description: buildAssetDescription(
            fileName,
            fileType,
            category,
            null,
          ),
          href,
          sourcePath,
          relativePath,
          category,
          categoryLabel: buildAssetCategoryLabel(category),
          previewSrc,
          note: null,
          isDownload: category.startsWith('downloads'),
        } satisfies LfsProductAsset;
      })
      .filter((entry): entry is LfsProductAsset => entry != null)
      .sort(
        (left, right) =>
          left.categoryLabel.localeCompare(right.categoryLabel) ||
          left.relativePath.localeCompare(right.relativePath),
      );

    return [series, assets] as const;
  }),
);

export function getLfsProductMetadataByName(
  name: string,
): LfsProductMetadata | null {
  return lfsProductsByName.get(name) ?? null;
}

export function getLfsProductMetadataBySlug(
  slug: string,
): LfsProductMetadata | null {
  return lfsProductsBySlug.get(slug) ?? null;
}

export function getLfsProductContentBySlug(
  slug: string,
): LfsProductContent | null {
  return (
    productContentBySlug.get(slug) ??
    syntheticProductContentBySlug.get(slug) ??
    null
  );
}

export function getLfsModuleSeriesArchiveAssets(
  series: string,
): LfsProductAsset[] {
  return sharedModuleSeriesArchiveAssets.get(series) ?? [];
}

export function getAllLfsProductMetadata(): LfsProductMetadata[] {
  return lfsProducts;
}

export function getLfsProductSubtitle(name: string): string | null {
  return getLfsProductMetadataByName(name)?.subtitle ?? null;
}

export function getExternalModuleListingEntries(): LfsProductMetadata[] {
  return lfsProducts
    .filter(
      (entry) =>
        entry.productType === 'eurorack_module' &&
        entry.company != null &&
        entry.company !== 'lzx' &&
        entry.externalUrl,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getLegacyVisionaryModuleListingEntries(): LegacyModuleListingEntry[] {
  return legacyVisionaryModuleListings;
}

export function getLegacyVisionaryModuleMetadataBySlug(
  slug: string,
): LegacyVisionaryModuleMetadata | null {
  return legacyVisionaryMetadataBySlug.get(slug) ?? null;
}

export function getLegacyProductContentBySlug(
  slug: string,
): LegacyProductContent | null {
  const content = getLfsProductContentBySlug(slug);
  if (content && (content.isHidden || !content.isActive)) return content;

  const metadata =
    modulargridMetadataBySlug.get(slug) ??
    legacyVisionaryMetadataBySlug.get(slug);
  if (!metadata) return syntheticProductContentBySlug.get(slug) ?? null;

  const lfsProduct = lfsProductsBySlug.get(slug);
  const raw = lfsProduct ? lfsProductFiles[lfsProduct.sourcePath] : undefined;

  return {
    slug,
    name: metadata.name ?? humanizeFileName(slug),
    subtitle: metadata.subtitle,
    description: lfsProduct?.description ?? metadata.descriptionText,
    productType: lfsProduct?.productType ?? 'eurorack_module',
    category: lfsProduct?.category ?? null,
    company: lfsProduct?.company ?? 'lzx',
    shopifyId: lfsProduct?.shopifyId ?? null,
    externalUrl: metadata.externalUrl ?? lfsProduct?.externalUrl ?? null,
    isActive: false,
    isHidden: true,
    sourcePath: lfsProduct?.sourcePath ?? metadata.sourcePath,
    descriptionHtml: metadata.descriptionHtml,
    descriptionText: metadata.descriptionText,
    specsHtml: metadata.specsHtml,
    galleryImages:
      lfsProduct && raw
        ? buildGalleryImages(lfsProduct, raw)
        : buildSyntheticGalleryImages({
            slug,
            name: metadata.name ?? humanizeFileName(slug),
            subtitle: metadata.subtitle,
            description: metadata.descriptionText,
            productType: 'eurorack_module',
            category: null,
            company: 'lzx',
            shopifyId: null,
            externalUrl: metadata.externalUrl,
            isActive: false,
            isHidden: true,
            sourcePath: `${productRootFromMetadataSourcePath(
              metadata.sourcePath,
            )}/synthetic.json`,
          }),
    downloads: lfsProduct && raw ? buildDownloads(lfsProduct, raw) : [],
    archiveAssets:
      lfsProduct && raw
        ? buildArchiveAssets(lfsProduct, raw)
        : buildSyntheticArchiveAssets({
            slug,
            name: metadata.name ?? humanizeFileName(slug),
            subtitle: metadata.subtitle,
            description: metadata.descriptionText,
            productType: 'eurorack_module',
            category: null,
            company: 'lzx',
            shopifyId: null,
            externalUrl: metadata.externalUrl,
            isActive: false,
            isHidden: true,
            sourcePath: `${productRootFromMetadataSourcePath(
              metadata.sourcePath,
            )}/synthetic.json`,
          }),
  } satisfies LegacyProductContent;
}
