import type {MetaArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {getSeoMeta, type SeoConfig} from '@shopify/hydrogen';
import {Link, useLoaderData} from '@remix-run/react';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {CACHE_LONG} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';

type StarterSystem = {
  id: string;
  name: string;
  summary: string;
  modules: Array<{name: string; to: string}>;
  docsTo: string;
  patchesTo: string;
};

export async function loader({request}: LoaderFunctionArgs) {
  const systems: StarterSystem[] = [
    {
      id: 'double-vision-starter',
      name: 'Double Vision Starter System',
      summary:
        'A practical starter built around Double Vision for immediate hands-on image synthesis and modulation.',
      modules: [
        {name: 'Double Vision System', to: '/instruments/double-vision'},
        {name: 'TBC2', to: '/modules/tbc2'},
        {name: 'DSG3', to: '/modules/dsg3'},
      ],
      docsTo: '/getting-started',
      patchesTo: '/patches',
    },
    {
      id: 'colorizer',
      name: 'Colorizer Performance Setup',
      summary:
        'Focused on live color processing and expressive modulation for performance workflows.',
      modules: [
        {name: 'Videomancer', to: '/instruments/videomancer'},
        {name: 'Proc', to: '/modules/proc'},
        {name: 'DSG3', to: '/modules/dsg3'},
      ],
      docsTo: '/docs/guides/your-first-patch',
      patchesTo: '/patches',
    },
    {
      id: 'studio-rack',
      name: 'Studio Rack Builder',
      summary:
        'A flexible configuration for artists building a full rack around docs-driven experimentation.',
      modules: [
        {name: 'Videomancer', to: '/instruments/videomancer'},
        {name: 'Modules Catalog', to: '/modules'},
        {name: 'Legacy Library', to: '/legacy'},
      ],
      docsTo: '/docs',
      patchesTo: '/patches',
    },
  ];

  const seo = seoPayload.page({
    page: {
      title: 'Systems',
      seo: {
        title: 'Systems',
        description:
          'Curated LZX starter system configurations and workflow entry points.',
      },
    } as any,
    url: request.url,
  });

  return json({systems, seo}, {headers: {'Cache-Control': CACHE_LONG}});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function SystemsPage() {
  const {systems} = useLoaderData<typeof loader>();

  return (
    <>
      <Breadcrumbs items={[{label: 'Home', to: '/'}, {label: 'Systems'}]} />
      <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <h1 className="text-3xl font-bold mb-2">Systems</h1>
        <p className="text-base-content/70 mb-8">
          Curated starter configurations to help you choose a direction and
          start patching faster.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {systems.map((system) => (
            <article
              key={system.id}
              className="rounded-lg border border-base-300 p-5"
            >
              <h2 className="text-xl font-semibold">{system.name}</h2>
              <p className="mt-2 text-sm text-base-content/70">
                {system.summary}
              </p>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                  Suggested Modules
                </p>
                <ul className="mt-2 space-y-1">
                  {system.modules.map((module) => (
                    <li key={module.to}>
                      <Link
                        to={module.to}
                        className="link link-primary text-sm"
                      >
                        {module.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={system.docsTo} className="btn btn-sm btn-outline">
                  Docs
                </Link>
                <Link to={system.patchesTo} className="btn btn-sm btn-outline">
                  Patches
                </Link>
                <Link to="/catalog" className="btn btn-sm btn-primary">
                  Shop
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
