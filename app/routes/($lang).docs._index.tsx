import type {MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {CACHE_LONG} from '~/data/cache';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {DocsSearch} from '~/components/DocsSearch';

export const SECTIONS = [
  {
    title: 'Set Up Videomancer',
    description:
      'User manual, quick-start guide, firmware updates, and setup instructions for Videomancer.',
    to: '/instruments/videomancer/manual',
    icon: '🎛️',
  },
  {
    title: 'Learn a Module',
    description:
      'Find documentation for any LZX eurorack module — specs, controls, and patching tips.',
    to: '/modules',
    icon: '🔧',
  },
  {
    title: 'Compare Module Specs',
    description:
      'Master comparison table of every LZX module — width, depth, power draw, and sync I/O.',
    to: '/modules/specs',
    icon: '📊',
  },
  {
    title: 'Get Started with Video Synthesis',
    description:
      'New to video synthesis? Start here for beginner guides, your first patch, and key concepts.',
    to: '/getting-started',
    icon: '📖',
  },
  {
    title: 'Power and House Your System',
    description:
      'Power supply specifications, case options, and enclosure documentation.',
    to: '/docs/case-and-power',
    icon: '⚡',
  },
  {
    title: 'Set Up Chromagnon',
    description:
      'Documentation and setup guides for the Chromagnon instrument.',
    to: '/instruments/chromagnon',
    icon: '🎬',
  },
  {
    title: 'Find Legacy Documentation',
    description:
      'Documentation for discontinued modules and earlier product generations.',
    to: '/legacy',
    icon: '📁',
  },
];

export async function loader() {
  const seo = {
    title: 'Documentation',
    titleTemplate: '%s | LZX Industries',
    description:
      'LZX Industries technical documentation — guides, module docs, instrument manuals, and more.',
    jsonLd: {
      '@context': 'https://schema.org' as const,
      '@type': 'WebPage' as const,
      name: 'Documentation',
    },
  };

  return json({seo}, {headers: {'Cache-Control': CACHE_LONG}});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function DocsIndex() {
  return (
    <>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Support', to: '/support'},
          {label: 'Docs'},
        ]}
      />
      <div className="px-6 pb-16 md:px-10 lg:px-12 max-w-screen-lg mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/support"
            className="text-sm link link-primary opacity-70 hover:opacity-100"
          >
            &larr; All Support Resources
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">Documentation</h1>
        <p className="text-lg opacity-70 mb-8">
          Technical documentation for LZX video synthesis instruments and
          modules.
        </p>

        <div className="mb-8 rounded-lg border border-base-300 bg-base-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
            Search Documentation
          </p>
          <DocsSearch />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
