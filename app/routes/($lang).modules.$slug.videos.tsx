import {useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';
import type {LzxVideo} from '~/data/lzxdb';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('modules.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Module';
  return [{title: `${title} Videos | LZX Industries`}];
};

export default function ModuleVideos() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  const {videos, product} = data as unknown as ModuleHubData;

  if (videos.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 text-center">
        <p className="text-base-content/60">
          No videos available for {product.title}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-6">Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(videos as LzxVideo[]).map((video) => (
          <div
            key={video.id}
            className="rounded-lg overflow-hidden border border-base-300"
          >
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtube}`}
                title={video.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <div className="font-medium text-sm">{video.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
