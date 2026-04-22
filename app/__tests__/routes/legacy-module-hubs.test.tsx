import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';

import ModuleListingPage from '~/routes/($lang).modules._index';
import ModuleSupport from '~/routes/($lang).modules.$slug.support';

const remixState: any = {
  listingLoaderData: {
    pageTitle: 'Modules',
    cardSize: 'sm',
    gridColsClassName: 'grid-cols-1',
    sections: [
      {
        key: 'legacy',
        label: 'Legacy',
        groups: [
          {
            key: 'visionary',
            label: 'Visionary',
            entries: [
              {
                key: 'color-video-encoder',
                name: 'Color Video Encoder',
                href: '/modules/color-video-encoder',
                isExternal: false,
                externalUrl:
                  'https://www.modulargrid.net/e/lzx-industries-color-video-encoder',
                subtitle:
                  'RGB to NTSC/PAL video encoder, clipping and blanking of input signals, RGB contrast, brightness and inversion processing',
                image: {
                  aspectRatio: '1/1',
                  fit: 'contain',
                  localPath: null,
                  shopify: null,
                },
                commerce: null,
              },
            ],
          },
        ],
      },
    ],
    seo: {},
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
    supportContent: {},
  },
  outletContext: {
    product: {
      title: 'Color Video Encoder',
    },
    slug: 'color-video-encoder',
    hasManual: false,
    hasLocalDocumentation: true,
    hasShopifyProduct: false,
    assets: [],
    archiveAssets: [],
    slugEntry: {
      canonical: 'color-video-encoder',
      externalUrl: 'https://www.modulargrid.net/e/lzx-industries-color-video-encoder',
    },
  },
};

remixState.currentLoaderData = remixState.listingLoaderData;

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useLoaderData: () => remixState.currentLoaderData,
    useOutletContext: () => remixState.outletContext,
    useMatches: () => [{data: {selectedLocale: null}}],
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
  it('links first-party legacy modules to their hub overview from the modules listing', () => {
    remixState.currentLoaderData = remixState.listingLoaderData;

    renderWithRouter(<ModuleListingPage />);

    expect(screen.getByText('Color Video Encoder')).toBeTruthy();
    expect(
      screen.getByText('Color Video Encoder').closest('a')?.getAttribute('href'),
    ).toBe('/modules/color-video-encoder');
  });

  it('keeps local documentation primary on support pages for legacy hubs', () => {
    remixState.currentLoaderData = remixState.supportLoaderData;
    remixState.outletContext = {
      ...remixState.outletContext,
      assets: [
        {
          id: 'manual-pdf',
          name: 'User Manual',
        },
      ],
      archiveAssets: [
        {
          id: 'panel-art',
          name: 'Panel Artwork',
        },
      ],
    };

    renderWithRouter(<ModuleSupport />);

    expect(screen.getByRole('heading', {name: 'Color Video Encoder Support'})).toBeTruthy();
    expect(screen.getByText('Troubleshooting flow')).toBeTruthy();
    expect(
      screen.getByText('Local manual, archive guide, and reference'),
    ).toBeTruthy();
    expect(
      screen.getByText(/Documentation/).closest('a')?.getAttribute('href'),
    ).toBe('/modules/color-video-encoder/manual');
    expect(screen.getByText(/External Reference/)).toBeTruthy();
    expect(screen.getByText('Product Library Resources')).toBeTruthy();
    expect(screen.getByText('Downloads & Archive')).toBeTruthy();
    expect(screen.getByText('Overview').closest('a')?.getAttribute('href')).toBe(
      '/modules/color-video-encoder',
    );
    expect(screen.getByText('Archived Community Guide')).toBeTruthy();
    expect(screen.getByText('Encoding questions')).toBeTruthy();
  });
});