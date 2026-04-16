import type {MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {PageHeader, Section} from '~/components/Text';
import {getVideos} from '~/data/lzxdb';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_LONG} from '~/data/cache';

export async function loader() {
  const videos = getVideos();
  const seo = seoPayload.videoGallery({url: '/videos'});

  return json(
    {videos, seo},
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

export default function VideosIndex() {
  const {videos} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Videos" />
      <Section padding="x">
        <div className="mx-auto max-w-6xl pb-16">
          <p className="mb-8 text-lg leading-relaxed">
            Tutorials, demos, and artist performances featuring LZX video
            synthesis modules.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card bg-base-200 shadow-md transition-shadow hover:shadow-lg"
              >
                <figure>
                  <img
                    src={`https://i.ytimg.com/vi/${video.youtube}/hqdefault.jpg`}
                    alt={video.name}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                </figure>
                <div className="card-body p-4">
                  <h2 className="card-title text-base">{video.name}</h2>
                  {video.modules.length > 0 && (
                    <p className="text-xs opacity-50">
                      {video.modules.map((m) => m.name).join(', ')}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
