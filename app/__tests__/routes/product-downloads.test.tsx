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
    product: {title: 'Videomancer'},
    slug: 'videomancer',
  },
  loaderData: {
    release: {
      tagName: 'v1.0.0',
      publishedAt: '2026-01-01T00:00:00.000Z',
      prerelease: false,
      body: '',
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

vi.mock('~/components/ReleaseNotes', () => ({
  ReleaseNotes: () => null,
}));

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

    renderWithRouter(<InstrumentDownloads />);

    expect(screen.queryByText('Prefer guided updates?')).not.toBeInTheDocument();
    expect(screen.getByText('Firmware')).toBeTruthy();
  });

  it('omits the guided updater section on module downloads pages by default', () => {
    remixState.outletContext = {
      ...remixState.outletContext,
      product: {title: 'ESG3'},
      slug: 'esg3',
    };

    renderWithRouter(<ModuleDownloads />);

    expect(screen.queryByText('Need a guided updater?')).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', {name: /show older firmware versions/i}));

    expect(screen.getByText('TBC2 Firmware 1.0.6')).toBeTruthy();
  });
});