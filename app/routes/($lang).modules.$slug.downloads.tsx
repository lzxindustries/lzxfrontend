import {Link, useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import {FaDownload} from 'react-icons/fa';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('modules.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Module';
  return [{title: `${title} Downloads | LZX Industries`}];
};

export default function ModuleDownloads() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  const {assets, product, slug} = data as unknown as ModuleHubData;

  if (assets.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 text-center">
        <p className="text-base-content/60">
          No downloads available for {product.title}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <h2 className="text-2xl font-bold mb-6">Downloads</h2>
      <div className="mb-4">
        <Link
          to={`/modules/${slug}`}
          className="text-sm text-primary hover:underline"
        >
          &larr; Back to {product.title} overview
        </Link>
      </div>
      <div className="mb-6 rounded-lg border border-base-300 bg-base-200 p-4">
        <p className="font-semibold">Need a guided updater?</p>
        <p className="mt-1 text-sm text-base-content/70">
          LZX Connect provides guided firmware updates for Videomancer (with
          Chromagnon support coming soon).
        </p>
        <a href="/connect" className="btn btn-sm btn-primary mt-3">
          Open LZX Connect
        </a>
        <a href="/downloads" className="btn btn-sm btn-outline mt-3 ml-2">
          Browse All Downloads
        </a>
      </div>
      <div className="grid gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex flex-col gap-3 rounded-lg border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {asset.name}
                {asset.version && (
                  <span className="ml-2 badge badge-sm badge-outline">
                    {asset.version}
                  </span>
                )}
              </div>
              {asset.description && (
                <div className="text-sm text-base-content/70">
                  {asset.description}
                </div>
              )}
              <div className="text-xs text-base-content/50">
                {asset.fileName || 'File unavailable'}
                {asset.platform && (
                  <span className="ml-2">&middot; {asset.platform}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {asset.fileType ? (
                <span className="badge badge-outline">{asset.fileType}</span>
              ) : null}
              {asset.fileName ? (
                <a
                  href={`/assets/${encodeURIComponent(asset.fileName)}`}
                  download
                  className="btn btn-sm btn-outline gap-2"
                  aria-label={`Download ${asset.name}`}
                >
                  <FaDownload aria-hidden="true" />
                  <span>Download</span>
                </a>
              ) : (
                <span className="text-sm text-base-content/60">
                  Unavailable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
