/**
 * Server-side GitHub release resolver for LZX Connect downloads.
 * Uses the public GitHub API (no token, 60 req/hr limit) with caching.
 */

const GITHUB_API_BASE = 'https://api.github.com/repos';
const REPO = 'lzxindustries/videomancer-firmware';
const LATEST_RELEASE_URL = `${GITHUB_API_BASE}/${REPO}/releases/latest`;
const ALL_RELEASES_URL = `https://github.com/${REPO}/releases`;

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
let cachedRelease: ResolvedRelease | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function getLatestRelease(): Promise<ResolvedRelease> {
  const now = Date.now();
  if (cachedRelease && now < cacheExpiry) {
    return cachedRelease;
  }

  try {
    const response = await fetch(LATEST_RELEASE_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'LZX-Industries-Website/1.0',
      },
    });

    if (!response.ok) {
      // If rate-limited or errored, return cached or fallback
      if (cachedRelease) return cachedRelease;
      return fallbackRelease();
    }

    const data: GitHubRelease = await response.json();

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

    cachedRelease = result;
    cacheExpiry = now + CACHE_TTL_MS;
    return result;
  } catch {
    if (cachedRelease) return cachedRelease;
    return fallbackRelease();
  }
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
