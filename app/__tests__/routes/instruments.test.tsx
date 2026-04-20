import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import InstrumentListingPage, {
  isListedInstrumentSlug,
} from '~/routes/($lang).instruments._index';

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useLoaderData: () => ({
      entries: [
        {
          canonical: 'videomancer',
          name: 'Videomancer',
          subtitle: 'Performance video instrument',
          isHidden: false,
          shopifyProduct: null,
        },
      ],
    }),
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