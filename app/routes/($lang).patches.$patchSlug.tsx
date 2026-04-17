import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {PageHeader, Section} from '~/components/Text';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {LiteYouTube} from '~/components/LiteYouTube';
import {getPatchBySlug} from '~/data/lzxdb';
import {resolveProductUrl} from '~/data/product-slugs';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_LONG} from '~/data/cache';

export async function loader({params}: LoaderFunctionArgs) {
  const {patchSlug} = params;
  invariant(patchSlug, 'Missing patch slug');

  const patch = getPatchBySlug(patchSlug);
  if (!patch) {
    throw new Response('Patch not found', {status: 404});
  }

  const description =
    patch.notes ||
    `${patch.name} — a video synthesis patch${
      patch.artist ? ` by ${patch.artist.name}` : ''
    } using ${patch.modules.map((m) => m.name).join(', ') || 'LZX modules'}.`;

  const seo = seoPayload.patch({
    title: patch.name,
    description,
    url: `/patches/${patch.slug}`,
  });

  return json(
    {patch, seo},
    {
      headers: {
        'Cache-Control': CACHE_LONG,
      },
    },
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function PatchDetail() {
  const {patch} = useLoaderData<typeof loader>();

  return (
    <>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Patches', to: '/patches'},
          {label: patch.name},
        ]}
      />
      <PageHeader heading={patch.name}>
        {patch.artist && (
          <p className="mt-2 text-lg opacity-70">by {patch.artist.name}</p>
        )}
      </PageHeader>
      <Section padding="x">
        <div className="mx-auto max-w-4xl space-y-10 pb-16">
          {/* Video */}
          {patch.youtube && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Video Demo</h2>
              <LiteYouTube
                videoId={patch.youtube}
                title={`${patch.name} demo`}
              />
            </div>
          )}

          {/* Diagram */}
          {patch.diagram && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Patch Diagram</h2>
              <img
                src={`/diagrams/${patch.diagram}`}
                alt={`${patch.name} patch diagram`}
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* GIF preview */}
          {patch.gif && (
            <div>
              <img
                src={`/clips/${patch.gif}`}
                alt={`${patch.name} animated preview`}
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Notes */}
          {patch.notes && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Notes</h2>
              <p className="leading-relaxed">{patch.notes}</p>
            </div>
          )}

          {/* Modules used */}
          {patch.modules.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Modules Used</h2>
              <ul className="list-disc space-y-1 pl-6">
                {patch.modules.map((module) => (
                  <li key={module.id}>
                    <Link
                      to={resolveProductUrl(module.handle)}
                      className="link link-primary"
                      prefetch="intent"
                    >
                      {module.name}
                    </Link>
                    {module.subtitle && (
                      <span className="ml-2 text-sm opacity-60">
                        — {module.subtitle}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Back link */}
          <Link
            to="/patches"
            className="btn btn-outline btn-sm"
            prefetch="intent"
          >
            ← All Patches
          </Link>
        </div>
      </Section>
    </>
  );
}
