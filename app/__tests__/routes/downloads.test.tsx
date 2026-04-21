import {describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import DownloadsPage from '~/routes/($lang).downloads';

vi.mock('~/data/cache', () => ({
  CACHE_SHORT: 'public, max-age=60',
}));

vi.mock('~/data/github-releases', () => ({
  getLatestRelease: vi.fn(),
}));

vi.mock('~/data/product-slugs', () => ({
  getAllInstrumentEntries: vi.fn(() => []),
  getAllModuleSlugs: vi.fn(() => []),
  getSlugEntry: vi.fn(() => null),
}));

vi.mock('~/data/lzxdb', () => ({
  getModuleAssets: vi.fn(() => []),
  getModuleById: vi.fn(() => null),
}));

vi.mock('~/data/support-manifest', () => ({
  SUPPORT_MANIFEST: {},
}));

vi.mock('~/lib/seo.server', () => ({
  seoPayload: {
    page: vi.fn(() => ({})),
  },
}));

const remixState = {
  loaderData: {
    entries: [
      {
        slug: 'videomancer',
        name: 'Videomancer',
        subtitle: 'Video instrument',
        hubType: 'instrument' as const,
        docsUrl: '/instruments/videomancer/manual',
        productUrl: '/instruments/videomancer',
        assets: [
          {
            id: 'asset-1',
            name: 'Firmware 1.0.6',
            description: 'Firmware update (BIN)',
            fileName: 'firmware-1.0.6.bin',
            fileType: 'BIN',
            href: '/assets/firmware-1.0.6.bin',
            version: 'v1.0.6',
            platform: null,
          },
          {
            id: 'asset-2',
            name: 'Firmware 1.0.7',
            description: 'Firmware update (BIN)',
            fileName: 'firmware-1.0.7.bin',
            fileType: 'BIN',
            href: '/assets/firmware-1.0.7.bin',
            version: 'v1.0.7',
            platform: null,
          },
          {
            id: 'asset-3',
            name: 'Manual',
            description: 'User manual (PDF)',
            fileName: 'manual.pdf',
            fileType: 'PDF',
            href: '/assets/manual.pdf',
            version: null,
            platform: null,
          },
        ],
        manuals: [],
        relatedProducts: [],
      },
    ],
    release: {
      tagName: 'v1.2.3',
      publishedAt: '2026-04-10T00:00:00.000Z',
      body: '',
      prerelease: true,
      windows: {
        name: 'LZX-Connect-Setup-1.2.3.exe',
        url: 'https://example.com/connect/windows.exe',
        size: 145000000,
      },
      macos: {
        name: 'LZX-Connect-1.2.3.dmg',
        url: 'https://example.com/connect/macos.dmg',
        size: 152000000,
      },
      linux: {
        name: 'LZX-Connect-1.2.3.AppImage',
        url: 'https://example.com/connect/linux.AppImage',
        size: 149000000,
      },
      allReleasesUrl: 'https://github.com/lzxindustries/videomancer-firmware/releases',
    },
  },
};

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useLoaderData: () => remixState.loaderData,
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Downloads route', () => {
  it('shows the latest LZX Connect release packages', () => {
    renderWithRouter(<DownloadsPage />);

    expect(screen.getByText('LZX Connect App')).toBeTruthy();
    expect(screen.getByText('v1.2.3')).toBeTruthy();
    expect(screen.getByText('Pre-release')).toBeTruthy();
    expect(screen.getByText('LZX-Connect-Setup-1.2.3.exe')).toBeTruthy();
    expect(screen.getByText('LZX-Connect-1.2.3.dmg')).toBeTruthy();
    expect(screen.getByText('LZX-Connect-1.2.3.AppImage')).toBeTruthy();
    expect(screen.getByRole('link', {name: 'All Releases'})).toHaveAttribute(
      'href',
      'https://github.com/lzxindustries/videomancer-firmware/releases',
    );
  });

  it('collapses older firmware entries behind a toggle', () => {
    renderWithRouter(<DownloadsPage />);

    expect(screen.getByText('Firmware 1.0.7')).toBeTruthy();
    expect(screen.queryByText('Firmware 1.0.6')).not.toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: /show older firmware versions/i}));

    expect(screen.getByText('Firmware 1.0.6')).toBeTruthy();
  });
});