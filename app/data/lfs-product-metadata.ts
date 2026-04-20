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

const lfsProductFiles = import.meta.glob<RawLfsProduct>(
  '../../lfs/library/products/**/*.json',
  {eager: true, import: 'default'},
);

const legacyVisionaryMetadataFiles = import.meta.glob<string>(
  '../../lfs/library/products/eurorack-modules/visionary/**/modulargrid/metadata.md',
  {eager: true, import: 'default', query: '?raw'},
);

const LEGACY_VISIONARY_LISTING_SLUGS = new Set([
  'color-video-encoder',
  'octal-video-quantizer-sequencer',
  'triple-video-multimode-filter',
  'video-flip-flops',
  'video-ramps',
  'video-sync-generator',
]);

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
  'Polar Fringe': 'Analog Chroma Key Generator',
  'Prismatic Ray': 'Wide Range Video Oscillator',
  'Sensory Translator': 'Five Channel Envelope Follower',
  Shapechanger: 'Coordinate Transformation Processor',
  Staircase: 'Five Step Waveshaper',
  'TBC2 Expander': 'Passive VGA Expansion Panel',
  'Topogram': 'Sequential Soft Key Generator',
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

function deriveSubtitle(name: string, description: string | null): string | null {
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

  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0]?.replace(/[.!?]+$/, '');
  if (!firstSentence) return null;

  const concise = firstSentence.split(/,\s+(?:featuring|with|which|for)\b/i)[0] ?? firstSentence;
  return concise.length > 96 ? capitalize(concise.slice(0, 93).trimEnd()) + '...' : capitalize(concise.trim());
}

function legacyVisionarySlugFromSourcePath(sourcePath: string): string | null {
  const match = sourcePath.match(/\/visionary\/([^/]+)\/modulargrid\/metadata\.md$/);
  return match?.[1] ?? null;
}

function parseLegacyVisionaryName(raw: string): string | null {
  const match = raw.match(/^#\s+(.+)$/m);
  return stringValue(match?.[1] ?? null);
}

function parseLegacyVisionaryExternalUrl(raw: string): string | null {
  const match = raw.match(/\*\*ModularGrid:\*\*\s+\[[^\]]+\]\((https?:\/\/[^)]+)\)/);
  return stringValue(match?.[1] ?? null);
}

function parseLegacyVisionarySubtitle(raw: string): string | null {
  const match = raw.match(/## Description\s*\n\s*\n\*\*(.+?)\*\*/s);
  return stringValue(match?.[1] ?? null);
}

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

const legacyVisionaryModuleListings: LegacyModuleListingEntry[] = Object.entries(
  legacyVisionaryMetadataFiles,
)
  .flatMap(([sourcePath, raw]) => {
    const slug = legacyVisionarySlugFromSourcePath(sourcePath);

    if (!slug || !LEGACY_VISIONARY_LISTING_SLUGS.has(slug)) return [];

    const name = parseLegacyVisionaryName(raw);
    if (!name) return [];

    return [
      {
        slug,
        name,
        subtitle: parseLegacyVisionarySubtitle(raw),
        externalUrl: parseLegacyVisionaryExternalUrl(raw),
        isHidden: true,
        sourcePath,
      } satisfies LegacyModuleListingEntry,
    ];
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const lfsProductsByName = new Map(lfsProducts.map((entry) => [entry.name, entry]));
const lfsProductsBySlug = new Map(lfsProducts.map((entry) => [entry.slug, entry]));

export function getLfsProductMetadataByName(name: string): LfsProductMetadata | null {
  return lfsProductsByName.get(name) ?? null;
}

export function getLfsProductMetadataBySlug(slug: string): LfsProductMetadata | null {
  return lfsProductsBySlug.get(slug) ?? null;
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
