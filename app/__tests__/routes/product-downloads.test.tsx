import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import InstrumentDownloads from '~/routes/($lang).instruments.$slug.downloads';
import ModuleDownloads from '~/routes/($lang).modules.$slug.downloads';

const remixState = {
  outletContext: {
    assets: [
      {
        id: 'asset-1',
        name: 'Firmware',
        description: 'Latest firmware image',
        fileName: 'firmware.bin',
        fileType: 'BIN',
        version: '1.0.0',
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
});