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
const releaseCache = new Map<string, {release: ResolvedRelease; expiry: number}>();
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
