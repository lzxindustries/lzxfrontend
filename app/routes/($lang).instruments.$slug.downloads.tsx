import {Link, useLoaderData, useOutletContext} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';
import {getLatestRelease} from '~/data/github-releases';
import type {ResolvedRelease} from '~/data/github-releases';
import {DownloadAssetList} from '~/components/DownloadAssetList';
import {ProductAssetArchive} from '~/components/ProductAssetArchive';
import {ReleaseNotes} from '~/components/ReleaseNotes';
import {CACHE_SHORT} from '~/data/cache';
import {shouldShowGuidedUpdaterOnDownloads} from '~/data/support-manifest';

export async function loader() {
  const release = await getLatestRelease();
  return json({release}, {headers: {'Cache-Control': CACHE_SHORT}});
}

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('instruments.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Instrument';
  return [{title: `${title} Downloads | LZX Industries`}];
};

export default function InstrumentDownloads() {
  const data = useOutletContext<InstrumentLayoutLoaderData>();
  const {assets, archiveAssets, product, slug} =
    data as unknown as InstrumentHubData;
  const {release} = useLoaderData<typeof loader>();
  const rel = release as unknown as ResolvedRelease;
  const showGuidedUpdater = shouldShowGuidedUpdaterOnDownloads(slug);

  if (assets.length === 0 && archiveAssets.length === 0) {
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
          to={`/instruments/${slug}`}
          className="text-sm text-primary hover:underline"
        >
          &larr; Back to {product.title} overview
        </Link>
      </div>
      {showGuidedUpdater ? (
        <div className="mb-6 rounded-lg border border-base-300 bg-base-200 p-4">
          <p className="font-semibold">Prefer guided updates?</p>
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
      {assets.length > 0 ? <DownloadAssetList assets={assets} /> : null}
      {archiveAssets.length > 0 ? (
        <div className="mt-8">
          <ProductAssetArchive assets={archiveAssets} />
        </div>
      ) : null}

      {/* Release Notes */}
      {rel.body && (
        <div className="mt-8">
          <ReleaseNotes
            title="Latest Firmware Release"
            releases={[
              {
                version: rel.tagName || 'Latest',
                date: rel.publishedAt || new Date().toISOString(),
                prerelease: rel.prerelease,
                notes: rel.body,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
