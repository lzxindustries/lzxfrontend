import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {FaApple, FaDownload, FaLinux, FaWindows} from 'react-icons/fa';
import {DownloadAssetList} from '~/components/DownloadAssetList';
import {CACHE_SHORT} from '~/data/cache';
import {getLatestRelease} from '~/data/github-releases';
import {
  getAllInstrumentEntries,
  getAllModuleSlugs,
  getSlugEntry,
  resolveHubUrlForSlug,
} from '~/data/product-slugs';
import {filterDownloadRowsForPublicSite} from '~/data/download-visibility';
import {getModuleAssets, getModuleById} from '~/data/lzxdb';
import {SUPPORT_MANIFEST, type ManualVersion} from '~/data/support-manifest';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';
import {seoPayload} from '~/lib/seo.server';

type DownloadEntry = {
  slug: string;
  name: string;
  subtitle?: string;
  hubType: 'module' | 'instrument';
  docsUrl: string;
  productUrl: string;
  assets: Array<{
    id: string;
    name: string;
    description: string;
    fileName: string;
    fileType: string;
    href: string;
    version: string | null;
    platform: string | null;
  }>;
  manuals: ManualVersion[];
  relatedProducts: Array<{name: string; to: string}>;
};

function formatFileSize(size: number) {
  if (!size) return null;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export async function loader({request}: LoaderFunctionArgs) {
  const release = await getLatestRelease();
  const moduleSlugs = getAllModuleSlugs();
  const instrumentEntries = getAllInstrumentEntries();

  const allEntries: DownloadEntry[] = [];

  for (const slug of moduleSlugs) {
    const entry = getSlugEntry(slug);
    if (!entry || !entry.moduleId) continue;

    const module = getModuleById(entry.moduleId);
    const assets = filterDownloadRowsForPublicSite(
      getModuleAssets(entry.moduleId)
        .filter((a) => a.fileName)
        .map((a) => ({
          id: a.id,
          name: a.name || a.fileName,
          description: a.description,
          fileName: a.fileName,
          fileType: a.fileType,
          href: `/assets/${encodeURIComponent(a.fileName)}`,
          version: a.version,
          platform: a.platform,
        })),
    );

    if (assets.length === 0) continue;

    allEntries.push({
      slug,
      name: entry.name,
      subtitle: module?.subtitle,
      hubType: 'module',
      docsUrl: `/modules/${slug}/manual`,
      productUrl: `/modules/${slug}`,
      assets,
      manuals: SUPPORT_MANIFEST[slug]?.manuals ?? [],
      relatedProducts: (SUPPORT_MANIFEST[slug]?.relatedProductSlugs ?? [])
        .map((relatedSlug) => {
          const related = getSlugEntry(relatedSlug);
          if (!related) return null;
          const to = resolveHubUrlForSlug(related.canonical);
          return {name: related.name, to};
        })
        .filter((r): r is {name: string; to: string} => r != null),
    });
  }

  for (const entry of instrumentEntries) {
    if (!entry.moduleId) continue;

    const module = getModuleById(entry.moduleId);
    const assets = filterDownloadRowsForPublicSite(
      getModuleAssets(entry.moduleId)
        .filter((a) => a.fileName)
        .map((a) => ({
          id: a.id,
          name: a.name || a.fileName,
          description: a.description,
          fileName: a.fileName,
          fileType: a.fileType,
          href: `/assets/${encodeURIComponent(a.fileName)}`,
          version: a.version,
          platform: a.platform,
        })),
    );

    if (assets.length === 0) continue;

    allEntries.push({
      slug: entry.canonical,
      name: entry.name,
      subtitle: module?.subtitle,
      hubType: 'instrument',
      docsUrl: `/instruments/${entry.canonical}/manual`,
      productUrl: resolveHubUrlForSlug(entry.canonical),
      assets,
      manuals: SUPPORT_MANIFEST[entry.canonical]?.manuals ?? [],
      relatedProducts: (
        SUPPORT_MANIFEST[entry.canonical]?.relatedProductSlugs ?? []
      )
        .map((relatedSlug) => {
          const related = getSlugEntry(relatedSlug);
          if (!related) return null;
          const to = resolveHubUrlForSlug(related.canonical);
          return {name: related.name, to};
        })
        .filter((r): r is {name: string; to: string} => r != null),
    });
  }

  allEntries.sort((a, b) => a.name.localeCompare(b.name));

  const seo = seoPayload.page({
    page: {
      title: 'Downloads',
      seo: {
        title: 'Downloads',
        description:
          'Centralized manuals, firmware files, and resources for LZX modules and instruments.',
      },
    } as any,
    url: request.url,
  });

  return json(
    {entries: allEntries, release, seo},
    {headers: {'Cache-Control': CACHE_SHORT}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

export default function DownloadsPage() {
  const {entries, release} = useLoaderData<typeof loader>();
  const connectDownloads = [
    {
      label: 'Windows',
      icon: FaWindows,
      asset: release.windows,
    },
    {
      label: 'macOS',
      icon: FaApple,
      asset: release.macos,
    },
    {
      label: 'Linux',
      icon: FaLinux,
      asset: release.linux,
    },
  ].filter(
    (
      item,
    ): item is {
      label: string;
      icon: typeof FaWindows;
      asset: NonNullable<typeof release.windows>;
    } => item.asset != null,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="text-3xl font-bold mb-2">Downloads</h1>
      <p className="text-base-content/70 mb-6">
        Manuals, firmware, and support files for all supported LZX products.
      </p>

      <div className="mb-8 rounded-lg border border-base-300 bg-base-200 p-4 md:p-5">
        <p className="font-semibold">Prefer guided firmware updates?</p>
        <p className="mt-1 text-sm text-base-content/70">
          LZX Connect provides a unified desktop updater for Videomancer (with
          Chromagnon support coming soon).
        </p>
        <Link to="/connect" className="btn btn-sm btn-primary mt-3">
          Open LZX Connect
        </Link>
      </div>

      <section className="mb-8 rounded-lg border border-base-300 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">LZX Connect App</h2>
            <p className="mt-1 text-sm text-base-content/70">
              Latest desktop release packages for guided firmware updates.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-base-content/60">
              {release.tagName ? (
                <span className="badge badge-outline">{release.tagName}</span>
              ) : null}
              {release.prerelease ? (
                <span className="badge badge-warning">Pre-release</span>
              ) : null}
              {release.publishedAt ? (
                <span>
                  {new Date(release.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/connect" className="btn btn-sm btn-outline">
              Details
            </Link>
            <a
              href={release.allReleasesUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-primary"
            >
              All Releases
            </a>
          </div>
        </div>

        {connectDownloads.length > 0 ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {connectDownloads.map(({label, icon: Icon, asset}) => (
              <a
                key={label}
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start justify-between gap-3 rounded border border-base-300 p-3 transition hover:bg-base-200"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium">
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                  <div className="mt-1 truncate text-sm text-base-content/70">
                    {asset.name}
                  </div>
                  {asset.size ? (
                    <div className="mt-1 text-xs text-base-content/50">
                      {formatFileSize(asset.size)}
                    </div>
                  ) : null}
                </div>
                <span className="btn btn-xs btn-ghost gap-1">
                  <FaDownload aria-hidden="true" />
                  Download
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-base-content/70">
            Platform packages are temporarily unavailable here. Use the full
            releases page for the latest downloads.
          </p>
        )}
      </section>

      <div className="space-y-5">
        {entries.map((entry) => (
          <section
            key={`${entry.hubType}-${entry.slug}`}
            className="rounded-lg border border-base-300 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{entry.name}</h2>
                {entry.subtitle ? (
                  <p className="text-sm text-base-content/70">
                    {entry.subtitle}
                  </p>
                ) : null}
                <p className="text-xs uppercase tracking-wide text-base-content/60 mt-1">
                  {entry.hubType === 'instrument' ? 'Instrument' : 'Module'}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={entry.productUrl} className="btn btn-sm btn-outline">
                  Product
                </Link>
                <Link to={entry.docsUrl} className="btn btn-sm btn-outline">
                  Docs
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <DownloadAssetList assets={entry.assets} variant="directory" />
            </div>

            {entry.manuals.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-2">
                  Manual Versions
                </p>
                <div className="flex flex-wrap gap-2">
                  {entry.manuals.map((manual) => (
                    <a
                      key={`${entry.slug}-${manual.version}`}
                      href={manual.url}
                      className="badge badge-outline"
                    >
                      {manual.version} ({manual.date})
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {entry.relatedProducts.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60 mb-2">
                  Related Products
                </p>
                <div className="flex flex-wrap gap-2">
                  {entry.relatedProducts.map((related) => (
                    <Link
                      key={`${entry.slug}-${related.to}`}
                      to={related.to}
                      className="badge badge-ghost"
                    >
                      {related.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
