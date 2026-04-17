import {Link, useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';
import type {LzxPatch} from '~/data/lzxdb';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('modules.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Module';
  return [{title: `${title} Patches | LZX Industries`}];
};

export default function ModulePatches() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  const {patches, product} = data as unknown as ModuleHubData;

  if (patches.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 text-center">
        <p className="text-base-content/60">
          No patches available for {product.title}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-6">Patches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(patches as LzxPatch[]).map((patch) => (
          <Link
            key={patch.id}
            to={`/patches/${patch.slug}`}
            prefetch="intent"
            className="group flex flex-col gap-2 rounded-lg border border-base-300 p-4 hover:shadow-md transition"
          >
            {patch.diagram && (
              <img
                src={patch.diagram}
                alt={patch.name}
                className="rounded bg-base-200 object-contain aspect-video"
                loading="lazy"
              />
            )}
            <div className="font-semibold text-sm group-hover:text-primary transition">
              {patch.name}
            </div>
            {patch.artist && (
              <div className="text-xs text-base-content/60">
                by {patch.artist.name}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
