/**
 * Curated Learn-tab launchpad cards per instrument.
 *
 * Data lives here (not in the route) so the instrument hub layout can
 * read it when deciding whether to surface the Learn tab, without
 * pulling the entire Learn route module into unrelated chunks.
 *
 * The Learn tab is **only** surfaced for instruments that have an
 * entry in `INSTRUMENT_LEARN_CARDS`. Default fallback cards exist for
 * the route itself, but at the IA level they duplicate the hub nav
 * (Manual, Videos, Patches) and would only add redundant noise. The
 * hub tab contract requires per-instrument curation before we promote
 * the tab.
 */

export interface LearnCard {
  title: string;
  description: string;
  icon: string;
  /** Relative path from instrument base, or absolute path */
  to?: string;
  /** Doc-key to resolve as basePath/toKey */
  toKey?: string;
  /** External link? */
  external?: boolean;
  /** Only show if this doc subpath exists in docPages */
  requiresDoc?: string;
}

/** Fallback cards used for instruments without specific card sets. */
export const DEFAULT_LEARN_CARDS: LearnCard[] = [
  {
    title: 'User Manual',
    description: 'Complete reference for controls, connections, and functions.',
    toKey: 'manual',
    icon: '📖',
  },
  {
    title: 'Videos',
    description:
      'Tutorials, demos, and walkthroughs from LZX and the community.',
    toKey: 'videos',
    icon: '🎬',
  },
  {
    title: 'Patches',
    description: 'Example signal routing configurations and creative recipes.',
    to: '/patches',
    icon: '🔌',
  },
  {
    title: 'Community Forum',
    description:
      'Ask questions, share discoveries, and connect with other artists.',
    to: 'https://community.lzxindustries.net',
    external: true,
    icon: '💬',
  },
];

/** Instrument-specific curated card sets, keyed by canonical slug. */
export const INSTRUMENT_LEARN_CARDS: Record<string, LearnCard[]> = {
  videomancer: [
    {
      title: 'Quick Start Guide',
      description:
        'Connect HDMI, load a program, and start exploring video synthesis in minutes.',
      toKey: 'manual/quick-start',
      icon: '🚀',
      requiresDoc: 'quick-start',
    },
    {
      title: 'User Manual',
      description:
        'Complete reference for controls, connections, menus, and system settings.',
      toKey: 'manual',
      icon: '📖',
    },
    {
      title: 'Program Guides',
      description:
        'In-depth walkthroughs for each of the 24 built-in effect programs.',
      toKey: 'manual/programs',
      icon: '🎛️',
      requiresDoc: 'programs',
    },
    {
      title: 'Modulation Guide',
      description:
        'Reference for 39 modulation operator types across 12 channels: oscillators, envelopes, sequencers, spatial modulators, and more.',
      toKey: 'manual/modulation-operators',
      icon: '🌊',
      requiresDoc: 'modulation-operators',
    },
    {
      title: 'Fault Codes Reference',
      description:
        'Diagnostic codes displayed on the LCD during error conditions and how to resolve them.',
      toKey: 'manual/fault-codes-reference',
      icon: '⚠️',
      requiresDoc: 'fault-codes-reference',
    },
    {
      title: 'Serial Port Guide',
      description:
        'USB serial command interface for program management, presets, settings, and MIDI monitoring.',
      toKey: 'manual/serial-command-guide',
      icon: '💻',
      requiresDoc: 'serial-command-guide',
    },
    {
      title: 'Historic Device References',
      description:
        '72 programs inspired by hardware from the Fairlight CVI and Quantel Paintbox to Atari and classic broadcast systems.',
      toKey: 'manual/historic-device-references',
      icon: '🏛️',
      requiresDoc: 'historic-device-references',
    },
    {
      title: 'Videos',
      description:
        'Tutorials, demos, and walkthroughs from LZX and the community.',
      toKey: 'videos',
      icon: '🎬',
    },
    {
      title: 'Patches',
      description:
        'Example signal routing configurations and creative recipes.',
      to: '/patches',
      icon: '🔌',
    },
    {
      title: 'Community Forum',
      description:
        'Ask questions, share discoveries, and connect with other artists.',
      to: 'https://community.lzxindustries.net',
      external: true,
      icon: '💬',
    },
  ],

  /**
   * Single-manual instruments: the Learn tab highlights the reference manual,
   * the Support hub, and community resources. (Patches stay on the instrument
   * hub nav to avoid a fifth card that mostly duplicates it.) First-run
   * instructions live inside the manual itself rather than a dedicated card.
   */
  chromagnon: [
    {
      title: 'User manual',
      description:
        'Matrix architecture, I/O, calibration, and full control reference.',
      toKey: 'manual',
      icon: '📖',
    },
    {
      title: 'Support & FAQ',
      description:
        'Troubleshooting, firmware, and direct links to common Chromagnon topics.',
      to: 'support',
      icon: '🛟',
    },
    {
      title: 'Videos',
      description: 'Tutorials, demos, and walkthroughs for Chromagnon.',
      toKey: 'videos',
      icon: '🎬',
    },
    {
      title: 'Community forum',
      description:
        'Project ideas, patch tips, and help from the LZX community.',
      to: 'https://community.lzxindustries.net',
      external: true,
      icon: '💬',
    },
  ],

  vidiot: [
    {
      title: 'User manual',
      description:
        'Layout, LFO shape generator, 2D keyer, and full control reference.',
      toKey: 'manual',
      icon: '📖',
    },
    {
      title: 'Support & FAQ',
      description:
        'Troubleshooting, connectivity, and common Vidiot questions.',
      to: 'support',
      icon: '🛟',
    },
    {
      title: 'Videos',
      description: 'Tutorials, demos, and walkthroughs for Vidiot.',
      toKey: 'videos',
      icon: '🎬',
    },
    {
      title: 'Community forum',
      description:
        'Project ideas, patch tips, and help from the LZX community.',
      to: 'https://community.lzxindustries.net',
      external: true,
      icon: '💬',
    },
  ],

  'andor-1-media-player': [
    {
      title: 'User manual',
      description:
        'Interface, I/O, storage, and control reference for Andor 1.',
      toKey: 'manual',
      icon: '📖',
    },
    {
      title: 'Support & FAQ',
      description:
        'Troubleshooting, media formats, and common Andor 1 media player topics.',
      to: 'support',
      icon: '🛟',
    },
    {
      title: 'Videos',
      description: 'Tutorials, demos, and walkthroughs for Andor 1.',
      toKey: 'videos',
      icon: '🎬',
    },
    {
      title: 'Community forum',
      description:
        'Project ideas, patch tips, and help from the LZX community.',
      to: 'https://community.lzxindustries.net',
      external: true,
      icon: '💬',
    },
  ],

  'double-vision': [
    {
      title: 'User manual',
      description:
        'System overview, modules, and patching reference for Double Vision.',
      toKey: 'manual',
      icon: '📖',
    },
    {
      title: 'Support & FAQ',
      description:
        'Troubleshooting, accessories, and common Double Vision topics.',
      to: 'support',
      icon: '🛟',
    },
    {
      title: 'Videos',
      description:
        'Tutorials, demos, and walkthroughs for the Double Vision system.',
      toKey: 'videos',
      icon: '🎬',
    },
    {
      title: 'Community forum',
      description:
        'Project ideas, patch tips, and help from the LZX community.',
      to: 'https://community.lzxindustries.net',
      external: true,
      icon: '💬',
    },
  ],

  'double-vision-168': [
    {
      title: 'User manual',
      description:
        '6U case layout, monitor I/O, and system reference for Double Vision 168.',
      toKey: 'manual',
      icon: '📖',
    },
    {
      title: 'Support & FAQ',
      description:
        'Troubleshooting, compatibility, and Double Vision 168 topics.',
      to: 'support',
      icon: '🛟',
    },
    {
      title: 'Videos',
      description: 'Tutorials, demos, and walkthroughs for Double Vision 168.',
      toKey: 'videos',
      icon: '🎬',
    },
    {
      title: 'Community forum',
      description:
        'Project ideas, patch tips, and help from the LZX community.',
      to: 'https://community.lzxindustries.net',
      external: true,
      icon: '💬',
    },
  ],

  'double-vision-expander': [
    {
      title: 'User manual',
      description:
        'I/O, mounting, and reference for the Double Vision expander sidecar.',
      toKey: 'manual',
      icon: '📖',
    },
    {
      title: 'Support & FAQ',
      description: 'Troubleshooting, cabling, and common expander questions.',
      to: 'support',
      icon: '🛟',
    },
    {
      title: 'Videos',
      description: 'Tutorials, demos, and walkthroughs for the expander.',
      toKey: 'videos',
      icon: '🎬',
    },
    {
      title: 'Community forum',
      description:
        'Project ideas, patch tips, and help from the LZX community.',
      to: 'https://community.lzxindustries.net',
      external: true,
      icon: '💬',
    },
  ],
};

/** Resolves the card list for a given instrument. */
export function getLearnCards(slug: string): LearnCard[] {
  return INSTRUMENT_LEARN_CARDS[slug] ?? DEFAULT_LEARN_CARDS;
}

/**
 * True when an instrument has curated Learn content beyond the
 * generic launchpad cards. The hub tab is hidden for instruments
 * that would only render defaults, because those defaults point
 * back to tabs already present in the hub nav.
 */
export function hasCuratedLearnContent(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(INSTRUMENT_LEARN_CARDS, slug);
}

/**
 * Resolves the destination href for a learn card given the instrument
 * base path. Non-absolute `to` values are resolved against `basePath`
 * to avoid Remix `<Link>` treating them as relative to the current
 * `/learn` route (which would produce
 * `/instruments/<slug>/learn/<to>`).
 */
export function getLearnCardHref(card: LearnCard, basePath: string): string {
  if (card.external) return card.to!;
  if (card.to) {
    return card.to.startsWith('/') ? card.to : `${basePath}/${card.to}`;
  }
  return `${basePath}/${card.toKey}`;
}
