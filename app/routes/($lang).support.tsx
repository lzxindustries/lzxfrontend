import type {MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {Link} from '@remix-run/react';
import {CACHE_LONG} from '~/data/cache';
import {Breadcrumbs} from '~/components/Breadcrumbs';

const SECTIONS = [
  {
    title: 'Documentation',
    description:
      'Technical documentation for LZX modules and instruments — specs, controls, patching guides.',
    to: '/docs',
    icon: '📖',
  },
  {
    title: 'Downloads',
    description:
      'Firmware, manuals, schematics, and other downloadable files for all products.',
    to: '/downloads',
    icon: '⬇️',
  },
  {
    title: 'Getting Started',
    description:
      'New to video synthesis? Learn how to set up your first system and create your first patch.',
    to: '/getting-started',
    icon: '🚀',
  },
  {
    title: 'Glossary',
    description:
      'Key terms and concepts in video synthesis — from keyers to oscillators.',
    to: '/glossary',
    icon: '📝',
  },
  {
    title: 'Troubleshooting',
    description:
      'Common issues and solutions for LZX modules and instruments.',
    to: '/docs/guides/troubleshooting',
    icon: '🔧',
  },
  {
    title: 'LZX Connect',
    description:
      'Browser-based firmware update tool for compatible LZX instruments.',
    to: '/connect',
    icon: '🔗',
  },
];

export async function loader() {
  const seo = {
    title: 'Support',
    titleTemplate: '%s | LZX Industries',
    description:
      'LZX Industries support hub — documentation, downloads, getting started guides, troubleshooting, and more.',
    jsonLd: {
      '@context': 'https://schema.org' as const,
      '@type': 'WebPage' as const,
      name: 'Support',
    },
  };

  return json({seo}, {headers: {'Cache-Control': CACHE_LONG}});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function SupportHub() {
  return (
    <>
      <Breadcrumbs items={[{label: 'Home', to: '/'}, {label: 'Support'}]} />
      <div className="px-6 pb-16 md:px-10 lg:px-12 max-w-screen-lg mx-auto">
        <h1 className="text-3xl font-bold mb-2">Support</h1>
        <p className="text-lg opacity-70 mb-8">
          Everything you need to get help with LZX products — documentation,
          downloads, guides, and troubleshooting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {SECTIONS.map((section) => (
            <Link
              key={section.title}
              to={section.to}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-6"
            >
              <span className="text-3xl mb-3">{section.icon}</span>
              <h2 className="text-xl font-bold mb-2">{section.title}</h2>
              <p className="text-sm opacity-70">{section.description}</p>
            </Link>
          ))}
        </div>

        <div className="card bg-base-200 p-6">
          <h2 className="text-xl font-bold mb-4">Contact Us</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60 mb-1">
                Sales
              </h3>
              <a
                href="mailto:sales@lzxindustries.net"
                className="link link-primary"
              >
                sales@lzxindustries.net
              </a>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60 mb-1">
                Technical Support
              </h3>
              <a
                href="mailto:support@lzxindustries.net"
                className="link link-primary"
              >
                support@lzxindustries.net
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
