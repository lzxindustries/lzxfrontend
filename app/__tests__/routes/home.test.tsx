import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Home from '~/routes/($lang)._index';

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useLoaderData: () => ({
      products: {
        nodes: [
          {
            id: 'gid://shopify/Product/1',
            handle: 'videomancer',
            title: 'Videomancer',
            variants: {nodes: [{quantityAvailable: 1}]},
          },
        ],
      },
      recentPosts: [],
    }),
  };
});

vi.mock('~/components/Hero', () => ({
  Hero: () => <div>Hero</div>,
}));

vi.mock('~/components/LiteYouTube', () => ({
  LiteYouTube: () => <div>LiteYouTube</div>,
}));

vi.mock('~/components/VideomancyLandingSections', () => ({
  VideomancyLandingSections: () => <div>VideomancyLandingSections</div>,
}));

vi.mock('~/components/ProductCard', () => ({
  ProductCard: ({product}: {product: {title: string}}) => (
    <div>{product.title}</div>
  ),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Home page', () => {
  it('renders homepage getting-started CTA content', () => {
    renderWithRouter(<Home />);

    expect(
      screen.getByRole('heading', {name: 'New to Video Synthesis?'}),
    ).toBeTruthy();
    expect(screen.getByText('Getting Started Guide')).toBeTruthy();
    expect(screen.getByText('Set Up Videomancer')).toBeTruthy();
  });
});
