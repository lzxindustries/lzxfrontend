import type {LoaderFunctionArgs, MetaFunction} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {FaApple, FaDownload, FaLinux, FaWindows} from 'react-icons/fa';
import {getLatestConnectRelease} from '~/data/github-releases';
import type {ResolvedRelease} from '~/data/github-releases';
import {CACHE_SHORT} from '~/data/cache';
import {ReleaseNotes} from '~/components/ReleaseNotes';

export async function loader(_args: LoaderFunctionArgs) {
  const release = await getLatestConnectRelease();
  return json({release}, {headers: {'Cache-Control': CACHE_SHORT}});
}

export const meta: MetaFunction = () => {
  return [
    {title: 'LZX Connect | LZX Industries'},
    {
      name: 'description',
      content:
        'LZX Connect is the desktop companion app for guided firmware updates and program library management. Supports Videomancer; Chromagnon in development.',
    },
  ];
};

export default function ConnectPage() {
  const {release} = useLoaderData<typeof loader>();
  const rel = release as unknown as ResolvedRelease;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 lg:py-16">
      <header className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
          Desktop App
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">
          LZX Connect
        </h1>
        <p className="mt-4 max-w-3xl text-base-content/80 md:text-lg">
          LZX Connect is the desktop companion app for Videomancer firmware
          updates and program library management. Connect Videomancer via USB-C
          and update firmware or install program libraries without opening the
          instrument or handling SD cards.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-base-content/60">
          Requires Videomancer firmware 1.x.x or later. Firmware 1.x.x is
          currently <strong>pre-release</strong>. If your device is on firmware
          0.1.8,{' '}
          <a
            href="/instruments/videomancer/manual/user-manual#firmware-update"
            className="link"
          >
            use the manual BOOT button method
          </a>{' '}
          to upgrade to 1.x.x first. Once on 1.x.x, enable{' '}
          <strong>Show pre-releases</strong> in LZX Connect settings to see and
          install pre-release firmware updates.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-base-300 bg-base-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold">Download</h2>
        <p className="mt-2 text-base-content/70">
          Download the latest release package for your operating system.
          {rel.tagName && (
            <span className="ml-2 badge badge-sm badge-outline">
              {rel.tagName}
            </span>
          )}
          {rel.prerelease && (
            <span className="ml-2 badge badge-sm badge-warning">
              Pre-release
            </span>
          )}
          {rel.publishedAt && (
            <span className="ml-2 text-sm text-base-content/50">
              {new Date(rel.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <a
            href={rel.windows?.url ?? rel.allReleasesUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline justify-start gap-2"
          >
            <FaWindows aria-hidden="true" />
            <span>Windows</span>
          </a>
          <a
            href={rel.macos?.url ?? rel.allReleasesUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline justify-start gap-2"
          >
            <FaApple aria-hidden="true" />
            <span>macOS</span>
          </a>
          <a
            href={rel.linux?.url ?? rel.allReleasesUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline justify-start gap-2"
          >
            <FaLinux aria-hidden="true" />
            <span>Linux</span>
          </a>
        </div>

        <a
          href={rel.allReleasesUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary mt-5 gap-2"
        >
          <FaDownload aria-hidden="true" />
          <span>View All Releases</span>
        </a>
      </section>

      {rel.body && (
        <div className="mb-8">
          <ReleaseNotes
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

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-base-300 p-6">
          <h2 className="text-xl font-bold">What It Does</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base-content/80">
            <li>
              <strong>Firmware updates</strong> — guided updates for 1.x.x
              → newer 1.x.x with a simplified one-click workflow
            </li>
            <li>
              <strong>Install Program Library</strong> — installs the official
              LZX or community program library to Videomancer&apos;s microSD
              card over USB; no card reader needed
            </li>
            <li>
              <strong>Load VMPROG File</strong> — streams a single{' '}
              <code>.vmprog</code> to device RAM over USB for development
              sideloading; not persistent across reboots
            </li>
            <li>Version tracking for connected devices</li>
          </ul>
          <p className="mt-4">
            <a
              href="/docs/guides/lzx-connect"
              className="link link-primary text-sm"
            >
              Full documentation → LZX Connect Guide
            </a>
          </p>
        </article>

        <article className="rounded-xl border border-base-300 p-6">
          <h2 className="text-xl font-bold">Supported Devices</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base-content/80">
            <li>Videomancer</li>
            <li>Chromagnon (in development)</li>
          </ul>
          <p className="mt-4 text-sm text-base-content/70">
            Prefer manual updates? Firmware files remain available from each
            product downloads page.
          </p>
        </article>
      </section>
    </div>
  );
}
