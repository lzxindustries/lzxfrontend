import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import InstrumentListingPage, {
  isListedInstrumentSlug,
} from '~/routes/($lang).instruments._index';
import type {CategoryListingData} from '~/lib/category-listing/types';

const mockData: CategoryListingData = {
  pageTitle: 'Instruments',
  cardSize: 'md',
  gridColsClassName: 'grid',
  sections: [
    {
      key: 'active',
      label: 'Active',
      groups: [
        {
          key: 'active',
          entries: [
            {
              key: 'videomancer',
              name: 'Videomancer',
              subtitle: 'Performance video instrument',
              href: '/instruments/videomancer/manual',
              externalUrl: null,
              isExternal: false,
              badge: null,
              image: {
                localPath: null,
                shopify: null,
                aspectRatio: '16/9',
                fit: 'cover',
              },
            },
          ],
        },
      ],
    },
  ],
};

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useMatches: () => [{data: {selectedLocale: null}}],
    useLoaderData: () => mockData,
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Instrument listing page', () => {
  it('renders instrument subtitles', () => {
    renderWithRouter(<InstrumentListingPage />);

    expect(screen.getByText('Videomancer')).toBeTruthy();
    expect(screen.getByText('Performance video instrument')).toBeTruthy();
  });

  it('excludes Double Vision variants from the instruments index', () => {
    expect(isListedInstrumentSlug('videomancer')).toBe(true);
    expect(isListedInstrumentSlug('double-vision')).toBe(false);
    expect(isListedInstrumentSlug('double-vision-168')).toBe(false);
    expect(isListedInstrumentSlug('double-vision-expander')).toBe(false);
  });
});
