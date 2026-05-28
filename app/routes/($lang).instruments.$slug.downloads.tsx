import {useState} from 'react';
import {Link, useLoaderData, useOutletContext} from '@remix-run/react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';
import {getAllFirmwareReleases} from '~/data/github-releases';
import type {FirmwareReleaseSummary, FirmwareRelease} from '~/data/github-releases';
import {DownloadAssetList} from '~/components/DownloadAssetList';
import {ProductAssetArchive} from '~/components/ProductAssetArchive';
import {CACHE_SHORT} from '~/data/cache';
import {shouldShowGuidedUpdaterOnDownloads, SUPPORT_MANIFEST} from '~/data/support-manifest';

export async function loader({params}: LoaderFunctionArgs) {
  const slug = params.slug ?? '';
  const prefix = SUPPORT_MANIFEST[slug]?.firmwareTagPrefix;
  const firmwareReleases = prefix
    ? await getAllFirmwareReleases(prefix)
    : null;
  return json({firmwareReleases}, {headers: {'Cache-Control': CACHE_SHORT}});
}

export const meta = ({matches}: MetaArgs) => {
  const parentData = matches.find((m) => m.id.includes('instruments.$slug'))
    ?.data as any;
  const title = parentData?.product?.title ?? 'Instrument';
  return [{title: `${title} Downloads | LZX Industries`}];
};

function FirmwareHeroCard({
  release,
  label,
  badgeClass,
}: {
  release: FirmwareRelease;
  label: string;
  badgeClass: string;
}) {
  const date = release.publishedAt
    ? new Date(release.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${badgeClass}`}>{label}</span>
        <span className="font-mono font-semibold">{release.version}</span>
        {date ? <span className="text-sm text-base-content/60">{date}</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {release.uf2 ? (
          <a
            href={release.uf2.url}
            className="btn btn-sm btn-primary"
            download
          >
            Download .uf2
          </a>
        ) : null}
        <a
          href={release.releaseNotesUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-outline"
        >
          Release notes
        </a>
      </div>
    </div>
  );
}

function FirmwareReleaseTable({releases}: {releases: FirmwareRelease[]}) {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE_COUNT = 5;
  const visible = showAll ? releases : releases.slice(0, VISIBLE_COUNT);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-base-300">
        <table className="table table-sm w-full">
          <thead>
            <tr>
              <th>Version</th>
              <th>Type</th>
              <th>Date</th>
              <th>Download</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.tagName}>
                <td className="font-mono text-sm">{r.version}</td>
                <td>
                  {r.prerelease ? (
                    <span className="badge badge-warning badge-sm">Pre-release</span>
                  ) : (
                    <span className="badge badge-success badge-sm">Stable</span>
                  )}
                </td>
                <td className="text-sm text-base-content/70">
                  {r.publishedAt
                    ? new Date(r.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>
                <td>
                  {r.uf2 ? (
                    <a
                      href={r.uf2.url}
                      className="link link-primary text-sm"
                      download
                    >
                      {r.uf2.name}
                    </a>
                  ) : (
                    <span className="text-base-content/40 text-sm">—</span>
                  )}
                </td>
                <td>
                  <a
                    href={r.releaseNotesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link text-sm"
                  >
                    GitHub
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {releases.length > VISIBLE_COUNT ? (
        <button
          type="button"
          className="btn btn-sm btn-ghost mt-3"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? 'Show fewer releases'
            : `Show all ${releases.length} releases`}
        </button>
      ) : null}
    </div>
  );
}

export default function InstrumentDownloads() {
  const data = useOutletContext<InstrumentLayoutLoaderData>();
  const {assets, archiveAssets, product, slug} =
    data as unknown as InstrumentHubData;
  const {firmwareReleases} = useLoaderData<typeof loader>();
  const releases = firmwareReleases as unknown as FirmwareReleaseSummary | null;
  const showGuidedUpdater = shouldShowGuidedUpdaterOnDownloads(slug);

  const hasLocalAssets = assets.length > 0 || archiveAssets.length > 0;
  const hasFirmwareReleases =
    releases != null && releases.allReleases.length > 0;

  if (!hasLocalAssets && !hasFirmwareReleases) {
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
      <h2 className="text-2xl font-bold mb-4">Downloads</h2>
      <div className="mb-6">
        <Link
          to={`/instruments/${slug}`}
          className="text-sm text-primary hover:underline"
        >
          &larr; Back to {product.title} overview
        </Link>
      </div>

      {/* ── At a glance: stable + prerelease hero cards ───────────── */}
      {hasFirmwareReleases && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3">At a Glance</h3>
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            {releases!.stableLatest ? (
              <FirmwareHeroCard
                release={releases!.stableLatest}
                label="Stable"
                badgeClass="badge-success"
              />
            ) : (
              <div className="rounded-lg border border-base-300 bg-base-200 p-4 text-sm text-base-content/60">
                No stable release published yet.
              </div>
            )}
            {releases!.prereleaseLatest ? (
              <FirmwareHeroCard
                release={releases!.prereleaseLatest}
                label="Pre-release"
                badgeClass="badge-warning"
              />
            ) : null}
          </div>

          {/* Banner: no 1.0 stable yet */}
          {!releases!.stableLatest ||
          releases!.stableLatest.version.startsWith('0.') ? (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
              <strong>Note:</strong> Firmware 1.0.0 stable has not been released
              yet. The 1.0.0-rc.x series is pre-release and experimental. Stay
              on <strong>0.1.8</strong> if you need maximum stability. A 1.0.0
              stable release will be announced on the{' '}
              <a href="/blog" className="link link-primary">
                LZX blog
              </a>
              .
            </div>
          ) : null}
        </section>
      )}

      {/* ── How to update ─────────────────────────────────────────── */}
      {slug === 'videomancer' && (
        <section className="mb-8 space-y-4">
          <h3 className="text-lg font-semibold">How to Update</h3>

          {/* Path A — Manual */}
          <div className="rounded-lg border border-base-300 bg-base-200 p-5">
            <p className="font-semibold mb-1">
              Path A — Manual Update{' '}
              <span className="text-sm font-normal text-base-content/60">
                (recommended if you experience any issues)
              </span>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-base-content/80 list-disc list-inside">
              <li>
                <strong>Required</strong> for the first upgrade from 0.1.8 →
                1.x.x. LZX Connect cannot perform this jump.
              </li>
              <li>
                Use a <strong>USB-A → USB-C cable to the Device port</strong>{' '}
                (not the Host port) on Videomancer.
              </li>
              <li>
                <strong>Close LZX Connect</strong> before entering BOOT mode —
                having it open can interfere with the process.
              </li>
              <li>
                Power off Videomancer. Hold the <strong>BOOT button</strong>,
                power on, then release BOOT. A USB drive will appear on your
                computer.
              </li>
              <li>
                Copy the downloaded <code>.uf2</code> file to the mounted drive.
                Videomancer will reboot automatically when the copy is complete.
              </li>
            </ul>
            <a
              href="/instruments/videomancer/manual/user-manual#firmware-update"
              className="btn btn-sm btn-outline mt-4"
            >
              Full firmware update instructions
            </a>
          </div>

          {/* Path B — LZX Connect */}
          <div className="rounded-lg border border-base-300 bg-base-200 p-5">
            <p className="font-semibold mb-1">
              Path B — LZX Connect{' '}
              <span className="text-sm font-normal text-base-content/60">
                (for 1.x.x → newer 1.x.x only)
              </span>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-base-content/80 list-disc list-inside">
              <li>
                Only available after you are already running firmware 1.x.x.
              </li>
              <li>
                Open LZX Connect → find Videomancer in the device list →{' '}
                <strong>Check for Updates</strong>.
              </li>
              <li>
                To see pre-release firmware builds, enable{' '}
                <strong>Show pre-release firmware</strong> in LZX Connect
                settings before checking for updates.
              </li>
              <li>
                If Connect prompts you to select a <code>.uf2</code> file
                manually, download it from the table below.
              </li>
            </ul>
            <a href="/connect" className="btn btn-sm btn-outline mt-4">
              LZX Connect
            </a>
          </div>
        </section>
      )}

      {/* ── Guided updater callout (non-Videomancer instruments) ─── */}
      {showGuidedUpdater && slug !== 'videomancer' ? (
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

      {/* ── Full release history table ────────────────────────────── */}
      {hasFirmwareReleases && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3">
            All Releases — {product.title} Firmware
          </h3>
          <FirmwareReleaseTable releases={releases!.allReleases} />
        </section>
      )}

      {/* ── Local catalog assets (lzxdb / LFS) ───────────────────── */}
      {assets.length > 0 ? <DownloadAssetList assets={assets} /> : null}
      {archiveAssets.length > 0 ? (
        <div className="mt-8">
          <ProductAssetArchive assets={archiveAssets} />
        </div>
      ) : null}

      {/* ── Program Libraries (Videomancer-specific) ──────────────── */}
      {slug === 'videomancer' && (
        <section className="mt-8 rounded-xl border border-base-300 bg-base-200 p-6">
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
            <strong>Install via SD card:</strong> Copy <code>.vmprog</code>{' '}
            files to the <code>programs/</code> folder on the microSD card.
            Power cycle Videomancer to rescan.
            <br />
            <strong>Install via LZX Connect:</strong>{' '}
            <a href="/connect" className="link link-primary">
              LZX Connect
            </a>{' '}
            → Install Program Library transfers files to the card over USB.
          </p>
        </section>
      )}
    </div>
  );
}
