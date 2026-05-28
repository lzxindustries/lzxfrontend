import {describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import InstrumentDownloads from '~/routes/($lang).instruments.$slug.downloads';
import ModuleDownloads from '~/routes/($lang).modules.$slug.downloads';

vi.mock('~/data/support-manifest', () => ({
  shouldShowGuidedUpdaterOnDownloads: () => false,
}));

const remixState = {
  outletContext: {
    assets: [
      {
        id: 'asset-1',
        name: 'Firmware',
        description: 'Latest firmware image',
        fileName: 'firmware.bin',
        fileType: 'BIN',
        version: '1.0.0' as string | null,
        platform: null,
      },
    ],
    archiveAssets: [] as Array<Record<string, unknown>>,
    product: {title: 'Videomancer'},
    slug: 'videomancer',
  },
  loaderData: {
    firmwareReleases: null as null | {
      stableLatest: null;
      prereleaseLatest: null;
      allReleases: Array<Record<string, unknown>>;
    },
  },
};

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useOutletContext: () => remixState.outletContext,
    useLoaderData: () => remixState.loaderData,
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Product downloads routes', () => {
  it('omits the guided updater section on instrument downloads pages', () => {
    remixState.outletContext = {
      ...remixState.outletContext,
      product: {title: 'Videomancer'},
      slug: 'videomancer',
    };
    remixState.loaderData = {firmwareReleases: null};

    renderWithRouter(<InstrumentDownloads />);

    expect(
      screen.queryByText('Prefer guided updates?'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Firmware')).toBeTruthy();
  });

  it('omits the guided updater section on module downloads pages by default', () => {
    remixState.outletContext = {
      ...remixState.outletContext,
      product: {title: 'ESG3'},
      slug: 'esg3',
    };

    renderWithRouter(<ModuleDownloads />);

    expect(
      screen.queryByText('Need a guided updater?'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Firmware')).toBeTruthy();
  });

  it('shows only the newest firmware by default and toggles older versions', () => {
    remixState.outletContext = {
      ...remixState.outletContext,
      assets: [
        {
          id: 'asset-1',
          name: 'TBC2 Firmware 1.0.6',
          description: 'Firmware update (ZIP)',
          fileName: 'tbc2-firmware_1.0.6.zip',
          fileType: 'ZIP',
          version: 'v1.0.6',
          platform: null,
        },
        {
          id: 'asset-2',
          name: 'TBC2 Firmware 1.0.7',
          description: 'Firmware update (ZIP)',
          fileName: 'tbc2-firmware_1.0.7.zip',
          fileType: 'ZIP',
          version: 'v1.0.7',
          platform: null,
        },
        {
          id: 'asset-3',
          name: 'Quick Start Guide',
          description: 'Quick start guide (PDF)',
          fileName: 'quick-start.pdf',
          fileType: 'PDF',
          version: null as string | null,
          platform: null,
        },
      ],
      product: {title: 'TBC2'},
      slug: 'tbc2',
    };

    renderWithRouter(<ModuleDownloads />);

    expect(screen.getByText('TBC2 Firmware 1.0.7')).toBeTruthy();
    expect(screen.queryByText('TBC2 Firmware 1.0.6')).not.toBeInTheDocument();
    expect(screen.getByText('Quick Start Guide')).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', {name: /show older firmware versions/i}),
    );

    expect(screen.getByText('TBC2 Firmware 1.0.6')).toBeTruthy();
  });

  it('renders GitHub firmware releases when local assets are empty', () => {
    remixState.outletContext = {
      assets: [],
      archiveAssets: [],
      product: {title: 'Videomancer'},
      slug: 'videomancer',
    };
    remixState.loaderData = {
      firmwareReleases: {
        stableLatest: {
          tagName: '0.1.8',
          version: '0.1.8',
          publishedAt: '2026-02-21T00:00:00Z',
          prerelease: false,
          releaseNotesUrl: 'https://github.com/lzxindustries/videomancer-firmware/releases/tag/0.1.8',
          uf2: {
            name: 'videomancer_0.1.8.uf2',
            url: 'https://github.com/lzxindustries/videomancer-firmware/releases/download/0.1.8/videomancer_0.1.8.uf2',
          },
        } as any,
        prereleaseLatest: {
          tagName: 'videomancer/1.0.0-rc.26',
          version: '1.0.0-rc.26',
          publishedAt: '2026-05-22T00:00:00Z',
          prerelease: true,
          releaseNotesUrl: 'https://github.com/lzxindustries/videomancer-firmware/releases/tag/videomancer%2F1.0.0-rc.26',
          uf2: {
            name: 'videomancer-1.0.0-rc.26.uf2',
            url: 'https://github.com/lzxindustries/videomancer-firmware/releases/download/videomancer/1.0.0-rc.26/videomancer-1.0.0-rc.26.uf2',
          },
        } as any,
        allReleases: [
          {
            tagName: 'videomancer/1.0.0-rc.26',
            version: '1.0.0-rc.26',
            publishedAt: '2026-05-22T00:00:00Z',
            prerelease: true,
            releaseNotesUrl: 'https://github.com/lzxindustries/videomancer-firmware/releases/tag/videomancer%2F1.0.0-rc.26',
            uf2: {name: 'videomancer-1.0.0-rc.26.uf2', url: 'https://example.com/rc26.uf2'},
          },
          {
            tagName: '0.1.8',
            version: '0.1.8',
            publishedAt: '2026-02-21T00:00:00Z',
            prerelease: false,
            releaseNotesUrl: 'https://github.com/lzxindustries/videomancer-firmware/releases/tag/0.1.8',
            uf2: {name: 'videomancer_0.1.8.uf2', url: 'https://example.com/018.uf2'},
          },
        ],
      },
    };

    renderWithRouter(<InstrumentDownloads />);

    // Hero cards visible (version appears in multiple places — just confirm presence)
    expect(screen.getAllByText('0.1.8').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.0.0-rc.26').length).toBeGreaterThan(0);
    // Release table
    expect(screen.getByText('videomancer-1.0.0-rc.26.uf2')).toBeTruthy();
    expect(screen.getByText('videomancer_0.1.8.uf2')).toBeTruthy();
    // NOT showing empty state
    expect(
      screen.queryByText('No downloads available for Videomancer.'),
    ).not.toBeInTheDocument();
  });
});
