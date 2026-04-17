import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {getSeoMeta, type SeoConfig} from '@shopify/hydrogen';
import {Link, useLoaderData} from '@remix-run/react';
import {FaDownload} from 'react-icons/fa';
import {getAllInstrumentEntries, getAllModuleSlugs, getSlugEntry} from '~/data/product-slugs';
import {getModuleAssets, getModuleById} from '~/data/lzxdb';
import {SUPPORT_MANIFEST, type ManualVersion} from '~/data/support-manifest';
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
    fileName: string;
    fileType: string;
    href: string;
  }>;
  manuals: ManualVersion[];
  relatedProducts: Array<{name: string; to: string}>;
};

export async function loader({request}: LoaderFunctionArgs) {
  const moduleSlugs = getAllModuleSlugs();
  const instrumentEntries = getAllInstrumentEntries();

  const allEntries: DownloadEntry[] = [];

  for (const slug of moduleSlugs) {
    const entry = getSlugEntry(slug);
    if (!entry || !entry.moduleId) continue;

    const module = getModuleById(entry.moduleId);
    const assets = getModuleAssets(entry.moduleId)
      .filter((a) => a.fileName)
      .map((a) => ({
        id: a.id,
        name: a.name || a.fileName,
        fileName: a.fileName,
        fileType: a.fileType,
        href: `/assets/${encodeURIComponent(a.fileName)}`,
      }));

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
          const to =
            related.hubType === 'instrument'
              ? `/instruments/${related.canonical}`
              : `/modules/${related.canonical}`;
          return {name: related.name, to};
        })
        .filter((r): r is {name: string; to: string} => r != null),
    });
  }

  for (const entry of instrumentEntries) {
    if (!entry.moduleId) continue;

    const module = getModuleById(entry.moduleId);
    const assets = getModuleAssets(entry.moduleId)
      .filter((a) => a.fileName)
      .map((a) => ({
        id: a.id,
        name: a.name || a.fileName,
        fileName: a.fileName,
        fileType: a.fileType,
        href: `/assets/${encodeURIComponent(a.fileName)}`,
      }));

    if (assets.length === 0) continue;

    allEntries.push({
      slug: entry.canonical,
      name: entry.name,
      subtitle: module?.subtitle,
      hubType: 'instrument',
      docsUrl: `/instruments/${entry.canonical}/manual`,
      productUrl: `/instruments/${entry.canonical}`,
      assets,
      manuals: SUPPORT_MANIFEST[entry.canonical]?.manuals ?? [],
      relatedProducts: (SUPPORT_MANIFEST[entry.canonical]?.relatedProductSlugs ?? [])
        .map((relatedSlug) => {
          const related = getSlugEntry(relatedSlug);
          if (!related) return null;
          const to =
            related.hubType === 'instrument'
              ? `/instruments/${related.canonical}`
              : `/modules/${related.canonical}`;
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

  return json({entries: allEntries, seo});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function DownloadsPage() {
  const {entries} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h1 className="text-3xl font-bold mb-2">Downloads</h1>
      <p className="text-base-content/70 mb-6">
        Manuals, firmware, and support files for all supported LZX products.
      </p>

      <div className="mb-8 rounded-lg border border-base-300 bg-base-200 p-4 md:p-5">
        <p className="font-semibold">Prefer guided firmware updates?</p>
        <p className="mt-1 text-sm text-base-content/70">
          Use LZX Connect for a unified desktop updater workflow.
        </p>
        <Link to="/connect" className="btn btn-sm btn-primary mt-3">
          Open LZX Connect
        </Link>
      </div>

      <div className="space-y-5">
        {entries.map((entry) => (
          <section key={`${entry.hubType}-${entry.slug}`} className="rounded-lg border border-base-300 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{entry.name}</h2>
                {entry.subtitle ? (
                  <p className="text-sm text-base-content/70">{entry.subtitle}</p>
                ) : null}
                <p className="text-xs uppercase tracking-wide text-base-content/60 mt-1">
                  {entry.hubType}
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

            <div className="mt-4 grid gap-2">
              {entry.assets.map((asset) => (
                <a
                  key={asset.id}
                  href={asset.href}
                  download
                  className="flex flex-col gap-2 rounded border border-base-300 p-3 transition hover:bg-base-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{asset.name}</div>
                    <div className="text-xs text-base-content/60 truncate">{asset.fileName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.fileType ? (
                      <span className="badge badge-outline">{asset.fileType}</span>
                    ) : null}
                    <span className="btn btn-xs btn-ghost gap-1">
                      <FaDownload aria-hidden="true" />
                      Download
                    </span>
                  </div>
                </a>
              ))}
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
                    <Link key={`${entry.slug}-${related.to}`} to={related.to} className="badge badge-ghost">
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
