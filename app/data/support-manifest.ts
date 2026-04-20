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
  setupPrerequisites?: string[];
  connectSupported?: boolean;
  faqItems?: FaqItem[];
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
    setupPrerequisites: [
      'A display with composite or component video input',
      'RCA cables for video connections',
      'USB-C cable for firmware updates',
    ],
    connectSupported: true,
    faqItems: [
      {
        question: 'How do I update Videomancer firmware?',
        answer:
          'Use the LZX Connect desktop app to perform guided firmware updates. Download it from the <a href="/connect">LZX Connect</a> page.',
      },
      {
        question: 'What video formats does Videomancer support?',
        answer:
          'Videomancer supports HDMI, Composite (CVBS), S-Video, Component (YPbPr & RGB SOG) and 1V RGB video input and output in NTSC and PAL formats.',
      },
      {
        question: 'Can I use Videomancer with eurorack modules?',
        answer:
          'Yes. Videomancer works standalone or alongside LZX eurorack modules via its 1V RGB video I/O and Audio/CV modulation inputs.',
      },
    ],
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
    setupPrerequisites: [
      'EuroRack case or 12V DC power supply',
      'RCA cables for video sync chain and output',
      'A display with composite or component video input',
    ],
    faqItems: [
      {
        question: 'Do I need ESG3 in every system?',
        answer:
          'Yes — ESG3 provides the master video sync and encoder for your system. Every LZX modular system needs at least one ESG3.',
      },
    ],
  },
  dsg3: {
    slug: 'dsg3',
    manuals: [],
    relatedProductSlugs: ['esg3', 'dwo3', 'scrolls'],
    faqItems: [
      {
        question: 'What is the difference between DSG3 and DWO3?',
        answer:
          'DSG3 produces geometric shapes synchronized to video timing (ramps, rectangles). DWO3 is a free-running or sync-able oscillator for animated patterns.',
      },
    ],
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
    faqItems: [
      {
        question: 'What video sources can TBC2 accept?',
        answer:
          'TBC2 accepts composite (CVBS) and S-Video inputs. It frame-synchronizes external video to your LZX system timing.',
      },
    ],
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
