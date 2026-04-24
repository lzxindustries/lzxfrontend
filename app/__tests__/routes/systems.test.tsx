import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import SystemsPage from '~/routes/($lang).systems';
import type {CategoryListingData} from '~/lib/category-listing/types';

const mockData: CategoryListingData = {
  pageTitle: 'Systems',
  cardSize: 'sm',
  gridColsClassName: 'grid',
  sections: [
    {
      key: 'gen3',
      groups: [
        {
          key: 'gen3',
          label: 'Gen3 Series',
          subtitle: 'Double Vision series',
          entries: [
            {
              key: 'double-vision',
              name: 'Double Vision System',
              subtitle: 'Desktop Gen3 video synthesis system.',
              href: '/systems/double-vision',
              externalUrl: null,
              isExternal: false,
              badge: null,
              image: {
                localPath: null,
                shopify: null,
                aspectRatio: '1/1',
                fit: 'contain',
              },
            },
            {
              key: 'double-vision-168',
              name: 'Double Vision 168',
              subtitle: 'Expanded 168HP Gen3 configuration.',
              href: '/systems/double-vision-168',
              externalUrl: null,
              isExternal: false,
              badge: null,
              image: {
                localPath: null,
                shopify: null,
                aspectRatio: '1/1',
                fit: 'contain',
              },
            },
            {
              key: 'double-vision-expander',
              name: 'Double Vision Expander',
              subtitle: 'Companion expansion for larger Double Vision systems.',
              href: '/systems/double-vision-expander',
              externalUrl: null,
              isExternal: false,
              badge: null,
              image: {
                localPath: null,
                shopify: null,
                aspectRatio: '1/1',
                fit: 'contain',
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
    useMatches: () => [
      {
        data: {
          selectedLocale: {
            pathPrefix: '/en-gb',
          },
        },
      },
    ],
    useLoaderData: () => mockData,
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Systems page', () => {
  it('renders the Gen3 systems section with all Double Vision products', () => {
    renderWithRouter(<SystemsPage />);

    expect(
      screen.getByRole('heading', {level: 1, name: 'Systems'}),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {level: 2, name: 'Gen3 Series'}),
    ).toBeTruthy();
    expect(screen.getByText('Double Vision System')).toBeTruthy();
    expect(screen.getByText('Double Vision 168')).toBeTruthy();
    expect(screen.getByText('Double Vision Expander')).toBeTruthy();
  });

  it('links each card to the correct system route', () => {
    renderWithRouter(<SystemsPage />);

    expect(
      screen
        .getByText('Double Vision System')
        .closest('a')
        ?.getAttribute('href'),
    ).toBe('/en-gb/systems/double-vision');
    expect(
      screen.getByText('Double Vision 168').closest('a')?.getAttribute('href'),
    ).toBe('/en-gb/systems/double-vision-168');
    expect(
      screen
        .getByText('Double Vision Expander')
        .closest('a')
        ?.getAttribute('href'),
    ).toBe('/en-gb/systems/double-vision-expander');
  });

  it('replaces the old starter-system card content', () => {
    renderWithRouter(<SystemsPage />);

    expect(screen.queryByText('Suggested Modules')).toBeNull();
    expect(screen.queryByText('Studio Rack Builder')).toBeNull();
  });
});
