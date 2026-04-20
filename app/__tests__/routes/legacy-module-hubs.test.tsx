import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';

import ModuleListingPage from '~/routes/($lang).modules._index';
import ModuleSupport from '~/routes/($lang).modules.$slug.support';

const remixState = {
  loaderData: {
    activeSeriesGroups: [],
    legacySeriesGroups: [
      {
        key: 'visionary',
        label: 'Visionary',
        entries: [
          {
            canonical: 'color-video-encoder',
            name: 'Color Video Encoder',
            isHidden: true,
            subtitle:
              'RGB to NTSC/PAL video encoder, clipping and blanking of input signals, RGB contrast, brightness and inversion processing',
            shopifyProduct: null,
            externalUrl: 'https://www.modulargrid.net/e/lzx-industries-color-video-encoder',
            hasInternalPage: true,
          },
        ],
      },
    ],
  },
  outletContext: {
    product: {
      title: 'Color Video Encoder',
    },
    slug: 'color-video-encoder',
    hasManual: false,
    hasShopifyProduct: false,
    slugEntry: {
      canonical: 'color-video-encoder',
      externalUrl: 'https://www.modulargrid.net/e/lzx-industries-color-video-encoder',
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
    useOutletContext: () => remixState.outletContext,
  };
});

vi.mock('~/components/TroubleshootingFlow', () => ({
  TroubleshootingFlow: () => <div>Troubleshooting flow</div>,
  GENERIC_MODULE_TROUBLESHOOTING: [],
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Legacy module hubs', () => {
  it('links first-party legacy modules to internal hub pages from the modules listing', () => {
    renderWithRouter(<ModuleListingPage />);

    expect(screen.getByText('Color Video Encoder')).toBeTruthy();
    expect(
      screen.getByText('Color Video Encoder').closest('a')?.getAttribute('href'),
    ).toBe('/modules/color-video-encoder');
  });

  it('shows the external documentation resource on support pages for legacy hubs without manuals', () => {
    renderWithRouter(<ModuleSupport />);

    expect(screen.getByRole('heading', {name: 'Color Video Encoder Support'})).toBeTruthy();
    expect(screen.getByText('Troubleshooting flow')).toBeTruthy();
    expect(
      screen.getByText('External manual and reference'),
    ).toBeTruthy();
    expect(
      screen.getByText(/Documentation/).closest('a')?.getAttribute('href'),
    ).toBe('https://www.modulargrid.net/e/lzx-industries-color-video-encoder');
  });
});