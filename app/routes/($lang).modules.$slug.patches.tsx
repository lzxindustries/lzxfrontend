import {Link, useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import {useMemo, useState} from 'react';
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
  const [query, setQuery] = useState('');

  const getPatchThumbnail = (patch: LzxPatch): string | null => {
    if (patch.youtube) {
      return `https://i.ytimg.com/vi/${patch.youtube}/hqdefault.jpg`;
    }
    if (patch.gif) {
      return `/clips/${patch.gif}`;
    }
    if (patch.diagram) {
      return `/diagrams/${patch.diagram}`;
    }
    return null;
  };

  const filtered = useMemo(() => {
    if (!query) return patches as LzxPatch[];
    const q = query.toLowerCase();
    return (patches as LzxPatch[]).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.artist && p.artist.name.toLowerCase().includes(q)),
    );
  }, [patches, query]);

  if (patches.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 text-center">
        <p className="text-base-content/60">
          No patches available for {product.title}.
        </p>
        <Link to="/patches" className="btn btn-outline btn-sm mt-4">
          Browse All Patches
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Patches</h2>
        <Link to="/patches" className="text-sm text-primary hover:underline">
          Browse all patches &rarr;
        </Link>
      </div>

      {patches.length > 3 && (
        <input
          type="search"
          placeholder="Filter patches..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input input-bordered input-sm w-full max-w-xs mb-4"
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-base-content/60">
          No patches match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((patch) => {
            const thumbnail = getPatchThumbnail(patch);

            return (
              <Link
                key={patch.id}
                to={`/patches/${patch.slug}`}
                prefetch="intent"
                className="group flex flex-col gap-2 rounded-lg border border-base-300 p-4 hover:shadow-md transition"
              >
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt={patch.name}
                    className={`rounded bg-base-200 aspect-video ${
                      patch.diagram && !patch.youtube && !patch.gif
                        ? 'object-contain bg-white p-1'
                        : 'object-cover'
                    }`}
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
                {patch.notes && (
                  <div className="text-xs text-base-content/50 line-clamp-2">
                    {patch.notes}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
