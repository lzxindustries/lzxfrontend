import {Link, useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('instruments.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Instrument';
  return [{title: `${title} — Learn | LZX Industries`}];
};

interface LearnCard {
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

/** Fallback cards used for instruments without specific card sets */
export const DEFAULT_LEARN_CARDS: LearnCard[] = [
  {
    title: 'Getting Started',
    description: 'Unboxing, connecting, and your first power-on.',
    to: 'setup',
    icon: '🚀',
  },
  {
    title: 'User Manual',
    description: 'Complete reference for controls, connections, and functions.',
    toKey: 'manual',
    icon: '📖',
  },
  {
    title: 'Videos',
    description: 'Tutorials, demos, and walkthroughs from LZX and the community.',
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
    description: 'Ask questions, share discoveries, and connect with other artists.',
    to: 'https://community.lzxindustries.net',
    external: true,
    icon: '💬',
  },
];

/** Instrument-specific card sets keyed by slug */
export const INSTRUMENT_LEARN_CARDS: Record<string, LearnCard[]> = {
  videomancer: [
    {
      title: 'Quick Start Guide',
      description: 'Connect HDMI, load a program, and start exploring video synthesis in minutes.',
      toKey: 'manual/quick-start',
      icon: '🚀',
      requiresDoc: 'quick-start',
    },
    {
      title: 'User Manual',
      description: 'Complete reference for controls, connections, menus, and system settings.',
      toKey: 'manual',
      icon: '📖',
    },
    {
      title: 'Program Guides',
      description: 'In-depth walkthroughs for each of the 24 built-in effect programs.',
      toKey: 'manual/programs',
      icon: '🎛️',
      requiresDoc: 'programs',
    },
    {
      title: 'Modulation Guide',
      description: 'Reference for 39 modulation operator types across 12 channels: oscillators, envelopes, sequencers, spatial modulators, and more.',
      toKey: 'manual/modulation-operators',
      icon: '🌊',
      requiresDoc: 'modulation-operators',
    },
    {
      title: 'Fault Codes Reference',
      description: 'Diagnostic codes displayed on the LCD during error conditions and how to resolve them.',
      toKey: 'manual/fault-codes-reference',
      icon: '⚠️',
      requiresDoc: 'fault-codes-reference',
    },
    {
      title: 'Serial Port Guide',
      description: 'USB serial command interface for program management, presets, settings, and MIDI monitoring.',
      toKey: 'manual/serial-command-guide',
      icon: '💻',
      requiresDoc: 'serial-command-guide',
    },
    {
      title: 'Historic Device References',
      description: '72 programs inspired by hardware from the Fairlight CVI and Quantel Paintbox to Atari and classic broadcast systems.',
      toKey: 'manual/historic-device-references',
      icon: '🏛️',
      requiresDoc: 'historic-device-references',
    },
    {
      title: 'Videos',
      description: 'Tutorials, demos, and walkthroughs from LZX and the community.',
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
      description: 'Ask questions, share discoveries, and connect with other artists.',
      to: 'https://community.lzxindustries.net',
      external: true,
      icon: '💬',
    },
  ],
};

/** Exported for testing — resolves the card list for a given instrument */
export function getLearnCards(slug: string): LearnCard[] {
  return INSTRUMENT_LEARN_CARDS[slug] ?? DEFAULT_LEARN_CARDS;
}

/**
 * Exported for testing — resolves the destination href for a learn card
 * given the instrument base path. Non-absolute `to` values are resolved
 * against `basePath` to avoid Remix `<Link>` treating them as relative to
 * the current `/learn` route (which would produce `/instruments/<slug>/learn/<to>`).
 */
export function getLearnCardHref(card: LearnCard, basePath: string): string {
  if (card.external) return card.to!;
  if (card.to) {
    return card.to.startsWith('/') ? card.to : `${basePath}/${card.to}`;
  }
  return `${basePath}/${card.toKey}`;
}

export default function InstrumentLearn() {
  const data = useOutletContext<InstrumentLayoutLoaderData>();
  const {product, hasManual, videos, slug, docPages} =
    data as unknown as InstrumentHubData;

  const basePath = `/instruments/${slug}`;
  const cards = getLearnCards(slug);

  // Build a set of available doc sub-paths for quick lookup
  const docSubPaths = new Set(
    docPages?.map((p) => {
      // Extract the last portion of the path (e.g. "quick-start" from "instruments/videomancer/quick-start")
      const parts = p.path.split('/');
      return parts[parts.length - 1];
    }) ?? [],
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-2">Learn {product.title}</h2>
      <p className="text-base-content/70 mb-8">
        Resources to help you get the most out of your {product.title}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          // Skip manual-based links if no manual exists
          if (card.toKey && !hasManual && card.toKey !== 'videos') return null;
          // Skip videos link if none
          if (card.toKey === 'videos' && videos.length === 0) return null;
          // Skip cards that require a specific doc page
          if (card.requiresDoc && !docSubPaths.has(card.requiresDoc)) return null;

          const href = getLearnCardHref(card, basePath);

          if (card.external) {
            return (
              <a
                key={card.title}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="card bg-base-200 hover:bg-base-300 transition-colors p-6"
              >
                <span className="text-3xl mb-3">{card.icon}</span>
                <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                <p className="text-sm opacity-70">{card.description}</p>
              </a>
            );
          }

          return (
            <Link
              key={card.title}
              to={href}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-6"
            >
              <span className="text-3xl mb-3">{card.icon}</span>
              <h3 className="text-lg font-bold mb-1">{card.title}</h3>
              <p className="text-sm opacity-70">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
