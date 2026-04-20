import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import DownloadsPage from '~/routes/($lang).downloads';

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
            name: 'Firmware',
            description: 'Latest firmware image',
            fileName: 'firmware.bin',
            fileType: 'BIN',
            href: '/assets/firmware.bin',
            version: '1.0.0',
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
});