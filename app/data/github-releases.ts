/**
 * Server-side GitHub release resolver for firmware and LZX Connect downloads.
 * Uses the public GitHub API (no token, 60 req/hr limit) with caching.
 */

const GITHUB_API_BASE = 'https://api.github.com/repos';
const REPO = 'lzxindustries/videomancer-firmware';
const LATEST_RELEASE_URL = `${GITHUB_API_BASE}/${REPO}/releases/latest`;
const RELEASES_URL = `${GITHUB_API_BASE}/${REPO}/releases?per_page=100`;
const ALL_RELEASES_URL = `https://github.com/${REPO}/releases`;
const CONNECT_RELEASE_PREFIX = 'connect/';
const VIDEOMANCER_RELEASE_PREFIX = 'videomancer/';

export interface PlatformDownload {
  name: string;
  url: string;
  size: number;
}

export interface ResolvedRelease {
  tagName: string;
  publishedAt: string;
  body: string;
  prerelease: boolean;
  windows: PlatformDownload | null;
  macos: PlatformDownload | null;
  linux: PlatformDownload | null;
  allReleasesUrl: string;
}

/** A single firmware release entry for the downloads table. */
export interface FirmwareRelease {
  tagName: string;
  version: string;
  publishedAt: string;
  prerelease: boolean;
  releaseNotesUrl: string;
  uf2: {name: string; url: string} | null;
}

export interface FirmwareReleaseSummary {
  stableLatest: FirmwareRelease | null;
  prereleaseLatest: FirmwareRelease | null;
  allReleases: FirmwareRelease[];
}

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  prerelease: boolean;
  body: string;
  assets: GitHubAsset[];
}

interface ReleaseQueryOptions {
  tagPrefix?: string;
}

export function classifyAsset(
  asset: GitHubAsset,
): 'windows' | 'macos' | 'linux' | null {
  const name = asset.name.toLowerCase();
  // Check macOS before Windows because "darwin" contains "win"
  if (name.endsWith('.dmg') || name.includes('mac') || name.includes('darwin'))
    return 'macos';
  if (name.endsWith('.exe') || name.endsWith('.msi') || name.includes('win'))
    return 'windows';
  if (
    name.endsWith('.appimage') ||
    name.endsWith('.deb') ||
    name.includes('linux')
  )
    return 'linux';
  return null;
}

export function toDownload(asset: GitHubAsset): PlatformDownload {
  return {
    name: asset.name,
    url: asset.browser_download_url,
    size: asset.size,
  };
}

/** In-memory cache with TTL */
const releaseCache = new Map<
  string,
  {release: ResolvedRelease; expiry: number}
>();
const firmwareReleasesCache = new Map<
  string,
  {summary: FirmwareReleaseSummary; expiry: number}
>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function getLatestRelease(
  options: ReleaseQueryOptions = {},
): Promise<ResolvedRelease> {
  const cacheKey = options.tagPrefix ?? 'latest';
  const cached = releaseCache.get(cacheKey);
  const now = Date.now();
  if (cached && now < cached.expiry) {
    return cached.release;
  }

  try {
    const response = await fetch(
      options.tagPrefix ? RELEASES_URL : LATEST_RELEASE_URL,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'LZX-Industries-Website/1.0',
        },
      },
    );

    if (!response.ok) {
      // If rate-limited or errored, return cached or fallback
      if (cached) return cached.release;
      return fallbackRelease();
    }

    const data = options.tagPrefix
      ? await resolveLatestTaggedRelease(response, options.tagPrefix)
      : ((await response.json()) as GitHubRelease);

    if (!data) {
      if (cached) return cached.release;
      return fallbackRelease();
    }

    const result: ResolvedRelease = {
      tagName: data.tag_name,
      publishedAt: data.published_at,
      body: data.body ?? '',
      prerelease: data.prerelease ?? false,
      windows: null,
      macos: null,
      linux: null,
      allReleasesUrl: ALL_RELEASES_URL,
    };

    for (const asset of data.assets) {
      const platform = classifyAsset(asset);
      if (platform && !result[platform]) {
        result[platform] = toDownload(asset);
      }
    }

    releaseCache.set(cacheKey, {
      release: result,
      expiry: now + CACHE_TTL_MS,
    });
    return result;
  } catch {
    if (cached) return cached.release;
    return fallbackRelease();
  }
}

export function getLatestConnectRelease(): Promise<ResolvedRelease> {
  return getLatestRelease({tagPrefix: CONNECT_RELEASE_PREFIX});
}

export function getLatestVideomancerRelease(): Promise<ResolvedRelease> {
  return getLatestRelease({tagPrefix: VIDEOMANCER_RELEASE_PREFIX});
}

/**
 * Fetches all firmware releases for a given tag prefix, filtering to only
 * those that include a .uf2 asset. Returns a summary with stableLatest,
 * prereleaseLatest, and the full list sorted newest-first.
 */
export async function getAllFirmwareReleases(
  tagPrefix: string,
): Promise<FirmwareReleaseSummary> {
  const cacheKey = `all:${tagPrefix}`;
  const cached = firmwareReleasesCache.get(cacheKey);
  const now = Date.now();
  if (cached && now < cached.expiry) {
    return cached.summary;
  }

  const empty: FirmwareReleaseSummary = {
    stableLatest: null,
    prereleaseLatest: null,
    allReleases: [],
  };

  try {
    const response = await fetch(RELEASES_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'LZX-Industries-Website/1.0',
      },
    });

    if (!response.ok) {
      return cached?.summary ?? empty;
    }

    const releases = (await response.json()) as Array<{
      tag_name: string;
      published_at: string;
      prerelease: boolean;
      html_url: string;
      assets: GitHubAsset[];
    }>;

    const firmwareReleases: FirmwareRelease[] = releases
      .filter(
        (r) =>
          !r.tag_name.startsWith(CONNECT_RELEASE_PREFIX) &&
          r.assets.some((a) => a.name.toLowerCase().endsWith('.uf2')),
      )
      .sort(
        (a, b) =>
          Date.parse(b.published_at) - Date.parse(a.published_at),
      )
      .map((r) => {
        const uf2Asset = r.assets.find((a) =>
          a.name.toLowerCase().endsWith('.uf2'),
        );
        // Strip the prefix from the tag to get the display version
        const version = r.tag_name.startsWith(tagPrefix)
          ? r.tag_name.slice(tagPrefix.length)
          : r.tag_name;
        return {
          tagName: r.tag_name,
          version,
          publishedAt: r.published_at,
          prerelease: r.prerelease,
          releaseNotesUrl: r.html_url,
          uf2: uf2Asset
            ? {name: uf2Asset.name, url: uf2Asset.browser_download_url}
            : null,
        };
      });

    const stableLatest =
      firmwareReleases.find((r) => !r.prerelease) ?? null;
    const prereleaseLatest =
      firmwareReleases.find((r) => r.prerelease) ?? null;

    const summary: FirmwareReleaseSummary = {
      stableLatest,
      prereleaseLatest,
      allReleases: firmwareReleases,
    };

    firmwareReleasesCache.set(cacheKey, {summary, expiry: now + CACHE_TTL_MS});
    return summary;
  } catch {
    return cached?.summary ?? empty;
  }
}

async function resolveLatestTaggedRelease(
  response: Response,
  tagPrefix: string,
): Promise<GitHubRelease | null> {
  const releases = (await response.json()) as GitHubRelease[];
  const matchingRelease = releases
    .filter((release) => release.tag_name.startsWith(tagPrefix))
    .sort((left, right) => {
      return Date.parse(right.published_at) - Date.parse(left.published_at);
    })[0];

  return matchingRelease ?? null;
}

function fallbackRelease(): ResolvedRelease {
  return {
    tagName: '',
    publishedAt: '',
    body: '',
    prerelease: false,
    windows: null,
    macos: null,
    linux: null,
    allReleasesUrl: ALL_RELEASES_URL,
  };
}
