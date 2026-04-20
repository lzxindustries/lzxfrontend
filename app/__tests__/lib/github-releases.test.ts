import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest';
import {
  classifyAsset,
  toDownload,
  getLatestConnectRelease,
  getLatestRelease,
  type GitHubAsset,
} from '~/data/github-releases';

describe('classifyAsset', () => {
  it('classifies .exe as windows', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-1.0.0.exe',
      browser_download_url: 'https://example.com/file.exe',
      size: 1000,
    };
    expect(classifyAsset(asset)).toBe('windows');
  });

  it('classifies .msi as windows', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-1.0.0.msi',
      browser_download_url: 'https://example.com/file.msi',
      size: 1000,
    };
    expect(classifyAsset(asset)).toBe('windows');
  });

  it('classifies name containing "win" as windows', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-win-x64.zip',
      browser_download_url: 'https://example.com/file.zip',
      size: 1000,
    };
    expect(classifyAsset(asset)).toBe('windows');
  });

  it('classifies .dmg as macos', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-1.0.0.dmg',
      browser_download_url: 'https://example.com/file.dmg',
      size: 2000,
    };
    expect(classifyAsset(asset)).toBe('macos');
  });

  it('classifies name containing "mac" as macos', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-mac-arm64.tar.gz',
      browser_download_url: 'https://example.com/file.tar.gz',
      size: 2000,
    };
    expect(classifyAsset(asset)).toBe('macos');
  });

  it('classifies name containing "darwin" as macos', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-darwin-x64.zip',
      browser_download_url: 'https://example.com/file.zip',
      size: 2000,
    };
    expect(classifyAsset(asset)).toBe('macos');
  });

  it('classifies .AppImage as linux', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-1.0.0.AppImage',
      browser_download_url: 'https://example.com/file.AppImage',
      size: 3000,
    };
    expect(classifyAsset(asset)).toBe('linux');
  });

  it('classifies .deb as linux', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-1.0.0.deb',
      browser_download_url: 'https://example.com/file.deb',
      size: 3000,
    };
    expect(classifyAsset(asset)).toBe('linux');
  });

  it('classifies name containing "linux" as linux', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-linux-x64.tar.gz',
      browser_download_url: 'https://example.com/file.tar.gz',
      size: 3000,
    };
    expect(classifyAsset(asset)).toBe('linux');
  });

  it('returns null for unrecognized asset types', () => {
    const asset: GitHubAsset = {
      name: 'checksums.txt',
      browser_download_url: 'https://example.com/checksums.txt',
      size: 100,
    };
    expect(classifyAsset(asset)).toBeNull();
  });

  it('returns null for source code archives', () => {
    const asset: GitHubAsset = {
      name: 'source-code.tar.gz',
      browser_download_url: 'https://example.com/source.tar.gz',
      size: 500,
    };
    expect(classifyAsset(asset)).toBeNull();
  });
});

describe('toDownload', () => {
  it('extracts name, url, and size from a GitHub asset', () => {
    const asset: GitHubAsset = {
      name: 'lzx-connect-1.0.0.dmg',
      browser_download_url: 'https://github.com/lzxindustries/repo/releases/download/v1.0.0/lzx-connect-1.0.0.dmg',
      size: 52428800,
    };
    const download = toDownload(asset);
    expect(download.name).toBe('lzx-connect-1.0.0.dmg');
    expect(download.url).toBe(asset.browser_download_url);
    expect(download.size).toBe(52428800);
  });
});

describe('getLatestRelease', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Reset the module cache to clear cached release
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns a ResolvedRelease with platform downloads on success', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        tag_name: 'v1.2.0',
        published_at: '2026-01-15T00:00:00Z',
        prerelease: true,
        body: 'Bug fixes and improvements',
        assets: [
          {
            name: 'lzx-connect-1.2.0.exe',
            browser_download_url: 'https://example.com/file.exe',
            size: 10000,
          },
          {
            name: 'lzx-connect-1.2.0.dmg',
            browser_download_url: 'https://example.com/file.dmg',
            size: 20000,
          },
          {
            name: 'lzx-connect-1.2.0.AppImage',
            browser_download_url: 'https://example.com/file.AppImage',
            size: 30000,
          },
        ],
      }),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const {getLatestRelease: freshGetLatestRelease} = await import(
      '~/data/github-releases'
    );
    const release = await freshGetLatestRelease();

    expect(release.tagName).toBe('v1.2.0');
    expect(release.publishedAt).toBe('2026-01-15T00:00:00Z');
    expect(release.windows).not.toBeNull();
    expect(release.windows!.name).toBe('lzx-connect-1.2.0.exe');
    expect(release.macos).not.toBeNull();
    expect(release.macos!.name).toBe('lzx-connect-1.2.0.dmg');
    expect(release.linux).not.toBeNull();
    expect(release.linux!.name).toBe('lzx-connect-1.2.0.AppImage');
    expect(release.allReleasesUrl).toContain('github.com');
    expect(release.prerelease).toBe(true);
    expect(release.body).toBe('Bug fixes and improvements');
  });

  it('returns fallback when fetch fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const {getLatestRelease: freshGetLatestRelease} = await import(
      '~/data/github-releases'
    );
    const release = await freshGetLatestRelease();

    expect(release).toBeDefined();
    expect(release.allReleasesUrl).toContain('github.com');
    expect(release.tagName).toBe('');
  });

  it('returns fallback when API returns non-ok status', async () => {
    const mockResponse = {ok: false, status: 403};
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const {getLatestRelease: freshGetLatestRelease} = await import(
      '~/data/github-releases'
    );
    const release = await freshGetLatestRelease();

    expect(release).toBeDefined();
    expect(release.tagName).toBe('');
  });

  it('returns the latest matching tagged release for LZX Connect', async () => {
    const mockResponse = {
      ok: true,
      json: async () => [
        {
          tag_name: 'videomancer/1.0.0-rc.15',
          published_at: '2026-04-18T05:21:20Z',
          prerelease: true,
          body: 'Firmware release',
          assets: [
            {
              name: 'videomancer-1.0.0-rc.15.uf2',
              browser_download_url: 'https://example.com/firmware.uf2',
              size: 10000,
            },
          ],
        },
        {
          tag_name: 'connect/1.0.1-rc.14',
          published_at: '2026-04-18T04:13:56Z',
          prerelease: true,
          body: 'Latest app release',
          assets: [
            {
              name: 'LZX.Connect_1.0.1-14_x64-setup.exe',
              browser_download_url: 'https://example.com/connect.exe',
              size: 20000,
            },
            {
              name: 'LZX.Connect_1.0.1-14_aarch64.dmg',
              browser_download_url: 'https://example.com/connect.dmg',
              size: 30000,
            },
            {
              name: 'LZX.Connect_1.0.1-14_amd64.AppImage',
              browser_download_url: 'https://example.com/connect.AppImage',
              size: 40000,
            },
          ],
        },
        {
          tag_name: 'connect/1.0.1-rc.13',
          published_at: '2026-04-18T02:13:44Z',
          prerelease: true,
          body: 'Older app release',
          assets: [],
        },
      ],
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const {getLatestConnectRelease: freshGetLatestConnectRelease} = await import(
      '~/data/github-releases'
    );
    const release = await freshGetLatestConnectRelease();

    expect(release.tagName).toBe('connect/1.0.1-rc.14');
    expect(release.body).toBe('Latest app release');
    expect(release.windows?.name).toBe('LZX.Connect_1.0.1-14_x64-setup.exe');
    expect(release.macos?.name).toBe('LZX.Connect_1.0.1-14_aarch64.dmg');
    expect(release.linux?.name).toBe('LZX.Connect_1.0.1-14_amd64.AppImage');
  });

  it('returns fallback when no release matches the requested tag prefix', async () => {
    const mockResponse = {
      ok: true,
      json: async () => [
        {
          tag_name: 'videomancer/1.0.0-rc.15',
          published_at: '2026-04-18T05:21:20Z',
          prerelease: true,
          body: 'Firmware release',
          assets: [],
        },
      ],
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const {getLatestConnectRelease: freshGetLatestConnectRelease} = await import(
      '~/data/github-releases'
    );
    const release = await freshGetLatestConnectRelease();

    expect(release.tagName).toBe('');
    expect(release.windows).toBeNull();
  });
});
