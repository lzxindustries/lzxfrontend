import type {MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {Link, useLoaderData, useSearchParams} from '@remix-run/react';
import {useMemo} from 'react';
import {PageHeader, Section} from '~/components/Text';
import {getPatches} from '~/data/lzxdb';
import {seoPayload} from '~/lib/seo.server';
import {CACHE_LONG} from '~/data/cache';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

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
  return seoMetaFromLoaderData(data);
};

export default function PatchesIndex() {
  const {patches} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const artistFilter = searchParams.get('artist') ?? '';
  const moduleFilter = searchParams.get('module') ?? '';

  // Collect unique artists and modules for filter badges
  const uniqueArtists = useMemo(() => {
    const artists = new Map<string, string>();
    for (const p of patches) {
      if (p.artist) artists.set(p.artist.name, p.artist.name);
    }
    return [...artists.values()].sort();
  }, [patches]);

  const uniqueModules = useMemo(() => {
    const modules = new Map<string, string>();
    for (const p of patches) {
      for (const m of p.modules) {
        modules.set(m.name, m.name);
      }
    }
    return [...modules.values()].sort();
  }, [patches]);

  // Filter patches
  const filtered = useMemo(() => {
    let result = patches;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q)) ||
          (p.artist && p.artist.name.toLowerCase().includes(q)) ||
          p.modules.some((m) => m.name.toLowerCase().includes(q)),
      );
    }

    if (artistFilter) {
      result = result.filter(
        (p) => p.artist && p.artist.name === artistFilter,
      );
    }

    if (moduleFilter) {
      result = result.filter((p) =>
        p.modules.some((m) => m.name === moduleFilter),
      );
    }

    return result;
  }, [patches, query, artistFilter, moduleFilter]);

  const updateFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = query || artistFilter || moduleFilter;

  return (
    <>
      <PageHeader heading="Patch Ideas & Recipes" />
      <Section padding="x">
        <div className="mx-auto max-w-6xl pb-16">
          <p className="mb-6 text-lg leading-relaxed">
            Explore patch ideas and recipes contributed by the LZX community.
            Each patch shows a diagram, the modules used, and a video demo when
            available.
          </p>

          {/* Search and filters */}
          <div className="mb-6 space-y-3">
            <input
              type="search"
              placeholder="Search patches by name, artist, module, or notes..."
              value={query}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="input input-bordered w-full"
            />

            <div className="flex flex-wrap gap-2 items-center">
              {/* Artist filter */}
              <select
                value={artistFilter}
                onChange={(e) => updateFilter('artist', e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="">All Artists</option>
                {uniqueArtists.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              {/* Module filter */}
              <select
                value={moduleFilter}
                onChange={(e) => updateFilter('module', e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="">All Modules</option>
                {uniqueModules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm"
                >
                  Clear filters
                </button>
              )}

              <span className="text-sm text-base-content/50 ml-auto">
                {filtered.length} of {patches.length} patches
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-lg mb-2">No patches match your filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-outline btn-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((patch) => (
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
                  ) : patch.diagram ? (
                    <figure>
                      <img
                        src={`/diagrams/${patch.diagram}`}
                        alt={`${patch.name} patch diagram`}
                        className="aspect-video w-full object-contain bg-white p-2"
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
                    {patch.notes && (
                      <p className="text-xs opacity-60 line-clamp-2">
                        {patch.notes}
                      </p>
                    )}
                    {patch.modules.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patch.modules.map((m) => (
                          <span
                            key={m.id ?? m.name}
                            className="badge badge-outline badge-xs"
                          >
                            {m.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
