import {Link, useLoaderData, useOutletContext} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';
import {getLatestRelease} from '~/data/github-releases';
import type {ResolvedRelease} from '~/data/github-releases';
import {DownloadAssetList} from '~/components/DownloadAssetList';
import {ProductAssetArchive} from '~/components/ProductAssetArchive';
import {ReleaseNotes} from '~/components/ReleaseNotes';
import {CACHE_SHORT} from '~/data/cache';
import {shouldShowGuidedUpdaterOnDownloads, SUPPORT_MANIFEST} from '~/data/support-manifest';

export async function loader({params}: LoaderFunctionArgs) {
  const slug = params.slug ?? '';
  const prefix = SUPPORT_MANIFEST[slug]?.firmwareTagPrefix;
  const release = await getLatestRelease(prefix ? {tagPrefix: prefix} : {});
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

      {slug === 'videomancer' && (
        <div className="mb-6 space-y-3">
          <div className="rounded-lg border border-info/30 bg-info/10 p-4">
            <p className="font-semibold">About these downloads</p>
            <p className="mt-1 text-sm text-base-content/80">
              Firmware 1.x.x is currently{' '}
              <strong>pre-release</strong> — the current stable release is
              0.1.8. Pre-release firmware unlocks new programs and LZX Connect
              compatibility, but may contain bugs. Downloads use the{' '}
              <strong>manual BOOT button method</strong>; if already on 1.x.x,
              use{' '}
              <a href="/connect" className="link link-primary">
                LZX Connect
              </a>{' '}
              with <strong>Show pre-releases</strong> enabled in settings.
            </p>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
            <p className="font-semibold">Upgrading from firmware 0.1.8?</p>
            <p className="mt-1 text-sm text-base-content/80">
              The initial upgrade from 0.1.8 to 1.x.x{' '}
              <strong>requires the manual BOOT button method</strong> below.
              LZX Connect cannot perform this upgrade. Close LZX Connect before
              starting — having it open while entering BOOT mode can interfere
              with the process.
            </p>
          </div>
        </div>
      )}
      {showGuidedUpdater ? (
        <div className="mb-6 rounded-lg border border-base-300 bg-base-200 p-4">
          <p className="font-semibold">Already on firmware 1.x.x?</p>
          <p className="mt-1 text-sm text-base-content/70">
            LZX Connect provides guided firmware updates and program library
            management without the BOOT button. Since 1.x.x is currently
            pre-release, enable <strong>Show pre-releases</strong> in LZX
            Connect settings before clicking Check for Updates.
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

      {slug === 'videomancer' && (
        <div className="mt-8 rounded-xl border border-base-300 bg-base-200 p-6">
          <h3 className="text-xl font-bold mb-2">Program Libraries</h3>
          <p className="text-sm text-base-content/70 mb-4">
            Programs are <code>.vmprog</code> files stored on Videomancer&apos;s
            microSD card. Two libraries are available:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div>
              <h4 className="font-semibold mb-1">Official LZX Library</h4>
              <p className="text-sm text-base-content/70">
                Programs curated by LZX Industries, bundled with firmware or
                available as a separate library download from this page.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Community Programs Library</h4>
              <p className="text-sm text-base-content/70 mb-2">
                Third-party programs signed for Videomancer 1.x.x. Load without
                Developer Mode. Available from the community programs repository.
              </p>
              <a
                href="https://github.com/lzxindustries/videomancer-community-programs/releases"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline"
              >
                Community Programs Releases
              </a>
            </div>
          </div>
          <p className="text-sm text-base-content/70">
            <strong>Install via SD card:</strong> Copy{' '}
            <code>.vmprog</code> files to the <code>programs/</code> folder on
            the microSD card. Power cycle Videomancer to rescan.
            <br />
            <strong>Install via LZX Connect:</strong>{' '}
            <a href="/connect" className="link link-primary">
              LZX Connect
            </a>{' '}
            → Install Program Library transfers files to the card over USB.
          </p>
        </div>
      )}
    </div>
  );
}
