import {Link, useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';
import type {ModuleHubData} from '~/data/hub-loaders';
import {DownloadAssetList} from '~/components/DownloadAssetList';
import {shouldShowGuidedUpdaterOnDownloads} from '~/data/support-manifest';

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('modules.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Module';
  return [{title: `${title} Downloads | LZX Industries`}];
};

export default function ModuleDownloads() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  const {assets, product, slug} = data as unknown as ModuleHubData;
  const showGuidedUpdater = shouldShowGuidedUpdaterOnDownloads(slug);

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
      {showGuidedUpdater ? (
        <div className="mb-6 rounded-lg border border-base-300 bg-base-200 p-4">
          <p className="font-semibold">Need a guided updater?</p>
          <p className="mt-1 text-sm text-base-content/70">
            LZX Connect provides guided firmware updates for supported modules.
          </p>
          <a href="/connect" className="btn btn-sm btn-primary mt-3">
            Open LZX Connect
          </a>
          <a href="/downloads" className="btn btn-sm btn-outline mt-3 ml-2">
            Browse All Downloads
          </a>
        </div>
      ) : null}
      <DownloadAssetList assets={assets} />
    </div>
  );
}
