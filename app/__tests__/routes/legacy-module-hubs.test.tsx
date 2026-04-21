import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';

import ModuleListingPage from '~/routes/($lang).modules._index';
import ModuleSupport from '~/routes/($lang).modules.$slug.support';

const remixState = {
  listingLoaderData: {
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
  supportLoaderData: {
    forumArchive: {
      officialTopic: {
        title: 'All About Color Video Encoder',
        url: 'https://community.lzxindustries.net/t/all-about-color-video-encoder/1234',
        excerpt: 'Archived setup and usage notes for Color Video Encoder.',
        sections: [{title: 'Specifications'}],
        imageUrls: ['https://example.com/color-video-encoder.png'],
        views: 123,
        postsCount: 1,
      },
      relatedTopics: [
        {
          title: 'Encoding questions',
          url: 'https://community.lzxindustries.net/t/encoding-questions/55',
          excerpt: 'Troubleshooting thread.',
          sections: [],
          imageUrls: [],
          views: 42,
          postsCount: 4,
        },
      ],
    },
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
    useLoaderData: () => remixState.currentLoaderData,
    useOutletContext: () => remixState.outletContext,
  };
});

beforeEach(() => {
  remixState.currentLoaderData = remixState.listingLoaderData;
});

vi.mock('~/components/TroubleshootingFlow', () => ({
  TroubleshootingFlow: () => <div>Troubleshooting flow</div>,
  GENERIC_MODULE_TROUBLESHOOTING: [],
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Legacy module hubs', () => {
  it('links first-party legacy modules directly to their docs from the modules listing', () => {
    remixState.currentLoaderData = remixState.listingLoaderData;

    renderWithRouter(<ModuleListingPage />);

    expect(screen.getByText('Color Video Encoder')).toBeTruthy();
    expect(
      screen.getByText('Color Video Encoder').closest('a')?.getAttribute('href'),
    ).toBe('/modules/color-video-encoder/manual');
  });

  it('shows the external documentation resource on support pages for legacy hubs without manuals', () => {
    remixState.currentLoaderData = remixState.supportLoaderData;

    renderWithRouter(<ModuleSupport />);

    expect(screen.getByRole('heading', {name: 'Color Video Encoder Support'})).toBeTruthy();
    expect(screen.getByText('Troubleshooting flow')).toBeTruthy();
    expect(
      screen.getByText('Archived community guide and reference'),
    ).toBeTruthy();
    expect(
      screen.getByText(/Documentation/).closest('a')?.getAttribute('href'),
    ).toBe('/modules/color-video-encoder/manual');
    expect(screen.getByText('Archived Community Guide')).toBeTruthy();
    expect(screen.getByText('Encoding questions')).toBeTruthy();
  });
});