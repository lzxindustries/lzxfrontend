import {getSlugEntry} from '~/data/product-slugs';

// 3) Manual-version and related-product data format decision.

export interface ManualVersion {
  version: string;
  date: string; // YYYY-MM-DD
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProductSupportRecord {
  slug: string;
  manuals: ManualVersion[];
  relatedProductSlugs: string[];
  connectSupported?: boolean;
  showGuidedUpdaterOnDownloads?: boolean;
}

export const SUPPORT_MANIFEST: Record<string, ProductSupportRecord> = {
  // ── Instruments ──────────────────────────────────────────────────────
  videomancer: {
    slug: 'videomancer',
    manuals: [
      {
        version: 'current',
        date: '2026-03-20',
        url: '/docs/instruments/videomancer/user-manual',
      },
    ],
    relatedProductSlugs: ['double-vision', 'tbc2', 'lnk'],
    connectSupported: true,
    // FAQ items and setup prerequisites are sourced from
    // content/support/videomancer.md frontmatter via loadSupportContent().
  },
  chromagnon: {
    slug: 'chromagnon',
    manuals: [],
    relatedProductSlugs: ['videomancer', 'tbc2', 'esg3'],
    connectSupported: true,
  },
  'double-vision': {
    slug: 'double-vision',
    manuals: [],
    relatedProductSlugs: ['videomancer', 'tbc2'],
  },
  'double-vision-168': {
    slug: 'double-vision-168',
    manuals: [],
    relatedProductSlugs: ['double-vision', 'double-vision-expander'],
  },
  'double-vision-expander': {
    slug: 'double-vision-expander',
    manuals: [],
    relatedProductSlugs: ['double-vision', 'double-vision-168'],
  },
  'andor-1-media-player': {
    slug: 'andor-1-media-player',
    manuals: [],
    relatedProductSlugs: ['videomancer'],
  },
  vidiot: {
    slug: 'vidiot',
    manuals: [],
    relatedProductSlugs: ['videomancer', 'esg3'],
  },

  // ── Gen3 Modules ────────────────────────────────────────────────────
  esg3: {
    slug: 'esg3',
    manuals: [],
    relatedProductSlugs: ['dsg3', 'tbc2', 'smx3'],
    // FAQ items and setup prerequisites are sourced from
    // content/support/esg3.md frontmatter via loadSupportContent().
  },
  dsg3: {
    slug: 'dsg3',
    manuals: [],
    relatedProductSlugs: ['esg3', 'dwo3', 'scrolls'],
    // FAQ items sourced from content/support/dsg3.md frontmatter.
  },
  dwo3: {
    slug: 'dwo3',
    manuals: [],
    relatedProductSlugs: ['dsg3', 'scrolls', 'esg3'],
  },
  smx3: {
    slug: 'smx3',
    manuals: [],
    relatedProductSlugs: ['esg3', 'proc', 'fkg3'],
  },
  tbc2: {
    slug: 'tbc2',
    manuals: [],
    relatedProductSlugs: ['esg3', 'videomancer', 'smx3'],
    // FAQ items sourced from content/support/tbc2.md frontmatter.
  },
  'tbc2-expander': {
    slug: 'tbc2-expander',
    manuals: [],
    relatedProductSlugs: ['tbc2', 'esg3', 'videomancer'],
  },
  'dc-distro-3a': {
    slug: 'dc-distro-3a',
    manuals: [],
    relatedProductSlugs: ['tbc2', 'tbc2-expander', 'esg3'],
  },
  fkg3: {
    slug: 'fkg3',
    manuals: [],
    relatedProductSlugs: ['keychain', 'smx3', 'proc'],
  },
  proc: {
    slug: 'proc',
    manuals: [],
    relatedProductSlugs: ['smx3', 'fkg3', 'matte'],
  },
  keychain: {
    slug: 'keychain',
    manuals: [],
    relatedProductSlugs: ['fkg3', 'stairs', 'switcher'],
  },
  matte: {
    slug: 'matte',
    manuals: [],
    relatedProductSlugs: ['swatch', 'smx3', 'proc'],
  },
  swatch: {
    slug: 'swatch',
    manuals: [],
    relatedProductSlugs: ['matte', 'smx3', 'esg3'],
  },
  angles: {
    slug: 'angles',
    manuals: [],
    relatedProductSlugs: ['dsg3', 'scrolls', 'contour'],
  },
  contour: {
    slug: 'contour',
    manuals: [],
    relatedProductSlugs: ['angles', 'dsg3', 'proc'],
  },
  factors: {
    slug: 'factors',
    manuals: [],
    relatedProductSlugs: ['proc', 'stairs', 'sumdist'],
  },
  pab: {
    slug: 'pab',
    manuals: [],
    relatedProductSlugs: ['smx3', 'proc', 'fkg3'],
  },
  pgo: {
    slug: 'pgo',
    manuals: [],
    relatedProductSlugs: ['dsg3', 'scrolls', 'dwo3'],
  },
  prm: {
    slug: 'prm',
    manuals: [],
    relatedProductSlugs: ['dsg3', 'dwo3', 'scrolls'],
  },
  ribbons: {
    slug: 'ribbons',
    manuals: [],
    relatedProductSlugs: ['scrolls', 'dsg3', 'angles'],
  },
  scrolls: {
    slug: 'scrolls',
    manuals: [],
    relatedProductSlugs: ['dsg3', 'dwo3', 'ribbons'],
  },
  stacker: {
    slug: 'stacker',
    manuals: [],
    relatedProductSlugs: ['smx3', 'switcher', 'proc'],
  },
  stairs: {
    slug: 'stairs',
    manuals: [],
    relatedProductSlugs: ['keychain', 'fkg3', 'factors'],
  },
  sumdist: {
    slug: 'sumdist',
    manuals: [],
    relatedProductSlugs: ['proc', 'factors', 'smx3'],
  },
  switcher: {
    slug: 'switcher',
    manuals: [],
    relatedProductSlugs: ['keychain', 'stacker', 'smx3'],
  },

  // ── Utility Modules ─────────────────────────────────────────────────
  lnk: {
    slug: 'lnk',
    manuals: [],
    relatedProductSlugs: ['videomancer', 'esg3'],
  },
  mlt: {
    slug: 'mlt',
    manuals: [],
    relatedProductSlugs: ['esg3', 'smx3'],
  },
  pot: {
    slug: 'pot',
    manuals: [],
    relatedProductSlugs: ['esg3', 'proc'],
  },

  // ── Visionary Series ───────────────────────────────────────────────
  'triple-video-fader-key-generator': {
    slug: 'triple-video-fader-key-generator',
    manuals: [],
    relatedProductSlugs: ['video-blending-matrix', 'video-logic', 'esg3'],
  },
  'video-blending-matrix': {
    slug: 'video-blending-matrix',
    manuals: [],
    relatedProductSlugs: ['triple-video-fader-key-generator', 'video-logic', 'smx3'],
  },
  'video-logic': {
    slug: 'video-logic',
    manuals: [],
    relatedProductSlugs: ['triple-video-fader-key-generator', 'video-blending-matrix', 'keychain'],
  },

  // ── Castle Series ───────────────────────────────────────────────────
  'castle-000-adc': {
    slug: 'castle-000-adc',
    manuals: [],
    relatedProductSlugs: ['castle-001-dac', 'castle-100-multi-gate'],
  },
  'castle-001-dac': {
    slug: 'castle-001-dac',
    manuals: [],
    relatedProductSlugs: ['castle-000-adc', 'castle-101-quad-gate'],
  },
  'castle-010-clock-vco': {
    slug: 'castle-010-clock-vco',
    manuals: [],
    relatedProductSlugs: ['castle-011-shift-register', 'castle-110-counter'],
  },
  'castle-011-shift-register': {
    slug: 'castle-011-shift-register',
    manuals: [],
    relatedProductSlugs: ['castle-010-clock-vco', 'castle-111-d-flip-flops'],
  },
  'castle-100-multi-gate': {
    slug: 'castle-100-multi-gate',
    manuals: [],
    relatedProductSlugs: ['castle-101-quad-gate', 'castle-000-adc'],
  },
  'castle-101-quad-gate': {
    slug: 'castle-101-quad-gate',
    manuals: [],
    relatedProductSlugs: ['castle-100-multi-gate', 'castle-001-dac'],
  },
  'castle-110-counter': {
    slug: 'castle-110-counter',
    manuals: [],
    relatedProductSlugs: ['castle-010-clock-vco', 'castle-111-d-flip-flops'],
  },
  'castle-111-d-flip-flops': {
    slug: 'castle-111-d-flip-flops',
    manuals: [],
    relatedProductSlugs: ['castle-011-shift-register', 'castle-110-counter'],
  },
};

export function shouldShowGuidedUpdaterOnDownloads(
  slug: string,
  supportManifest: Record<string, ProductSupportRecord> = SUPPORT_MANIFEST,
) {
  const entry = getSlugEntry(slug);
  if (entry?.hubType !== 'module') {
    return false;
  }

  return supportManifest[slug]?.showGuidedUpdaterOnDownloads === true;
}
