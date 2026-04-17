import type {MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {PageHeader, Section} from '~/components/Text';
import {getPatches} from '~/data/lzxdb';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_LONG} from '~/data/cache';

export async function loader() {
  const patches = getPatches();
  const seo = seoPayload.patches({url: '/patches'});

  return json(
    {patches, seo},
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

export default function PatchesIndex() {
  const {patches} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Patch Ideas & Recipes" />
      <Section padding="x">
        <div className="mx-auto max-w-6xl pb-16">
          <p className="mb-8 text-lg leading-relaxed">
            Explore patch ideas and recipes contributed by the LZX community.
            Each patch shows a diagram, the modules used, and a video demo when
            available.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {patches.map((patch) => (
              <Link
                key={patch.id}
                to={`/patches/${patch.slug}`}
                className="card bg-base-200 shadow-md transition-shadow hover:shadow-lg"
                prefetch="intent"
              >
                {patch.youtube ? (
                  <figure>
                    <img
                      src={`https://i.ytimg.com/vi/${patch.youtube}/hqdefault.jpg`}
                      alt={`${patch.name} video thumbnail`}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  </figure>
                ) : patch.gif ? (
                  <figure>
                    <img
                      src={`/clips/${patch.gif}`}
                      alt={`${patch.name} animated preview`}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  </figure>
                ) : null}
                <div className="card-body p-4">
                  <h2 className="card-title text-base">{patch.name}</h2>
                  {patch.artist && (
                    <p className="text-sm opacity-70">
                      by {patch.artist.name}
                    </p>
                  )}
                  {patch.modules.length > 0 && (
                    <p className="text-xs opacity-50">
                      {patch.modules.map((m) => m.name).join(', ')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
