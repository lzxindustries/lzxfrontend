import type {MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {CACHE_LONG} from '~/data/cache';
import {Breadcrumbs} from '~/components/Breadcrumbs';

const SECTIONS = [
  {
    title: 'Guides',
    description: 'Getting started with video synthesis, your first patch, and troubleshooting.',
    to: '/docs/guides/your-first-patch',
    icon: '📖',
  },
  {
    title: 'Modules',
    description: 'Documentation for all LZX EuroRack modules — specs, controls, and patching.',
    to: '/docs/modules/module-list',
    icon: '🔧',
  },
  {
    title: 'Instruments',
    description: 'Videomancer user manual, program guides, and instrument documentation.',
    to: '/docs/instruments/videomancer/user-manual',
    icon: '🎛️',
  },
  {
    title: 'Case & Power',
    description: 'Power supply specifications and enclosure documentation.',
    to: '/docs/case-and-power',
    icon: '⚡',
  },
];

export async function loader() {
  const seo = {
    title: 'Documentation',
    titleTemplate: '%s | LZX Industries',
    description: 'LZX Industries technical documentation — guides, module docs, instrument manuals, and more.',
    jsonLd: {
      '@context': 'https://schema.org' as const,
      '@type': 'WebPage' as const,
      name: 'Documentation',
    },
  };

  return json(
    {seo},
    {headers: {'Cache-Control': CACHE_LONG}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function DocsIndex() {
  return (
    <>
      <Breadcrumbs items={[{label: 'Home', to: '/'}, {label: 'Docs'}]} />
      <div className="px-6 pb-16 md:px-10 lg:px-12 max-w-screen-lg mx-auto">
        <h1 className="text-3xl font-bold mb-2">Documentation</h1>
        <p className="text-lg opacity-70 mb-8">
          Technical documentation for LZX video synthesis instruments and modules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </>
  );
}
