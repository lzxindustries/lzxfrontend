import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';

import CasesAndPowerPage from '~/routes/($lang).cases-and-power';

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useLoaderData: () => ({
      activeEntries: [
        {
          slug: 'vessel-168',
          name: 'Vessel 168',
          subtitle: '168HP EuroRack Enclosure With 12V DC Power & Video Sync Distribution',
          imagePath: '/images/vessel168_photo_top_square2.png',
          isActive: true,
          shopifyId: 'gid://shopify/Product/7171710189591',
          shopifyProduct: {
            id: 'gid://shopify/Product/7171710189591',
            title: 'Vessel 168',
            handle: 'vessel-168',
          },
        },
        {
          slug: 'bus-168-diy-kit',
          name: 'Bus 168 DIY Kit',
          subtitle: 'DIY power and sync busboard for Vessel systems',
          imagePath: '/images/bus208_photo_top.png',
          isActive: true,
          shopifyId: 'gid://shopify/Product/7214169489431',
          shopifyProduct: {
            id: 'gid://shopify/Product/7214169489431',
            title: 'Bus 168 DIY Kit',
            handle: 'bus-168-diy-kit',
          },
        },
      ],
      legacyEntries: [
        {
          slug: 'dc-distro-3a',
          name: 'DC Distro 3A',
          subtitle: 'DC Power Distributor',
          imagePath: '/images/dc-distro-3a-front-panel-square.png',
          isActive: false,
          shopifyId: 'gid://shopify/Product/6778221133847',
          shopifyProduct: {
            id: 'gid://shopify/Product/6778221133847',
            title: 'DC Distro 3A',
            handle: 'dc-distro-3a',
          },
        },
        {
          slug: 'rack-84hp',
          name: 'Rack 84HP',
          subtitle: '84HP rack enclosure for desktop or 19" rack mounting',
          imagePath: '/images/rack-84.png',
          isActive: false,
          shopifyId: 'gid://shopify/Product/6782464294935',
          shopifyProduct: {
            id: 'gid://shopify/Product/6782464294935',
            title: 'Rack 84HP',
            handle: 'rack-84hp',
          },
        },
      ],
    }),
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Cases and power page', () => {
  it('renders active and legacy sections with curated products', () => {
    renderWithRouter(<CasesAndPowerPage />);

    expect(
      screen.getByRole('heading', {level: 1, name: 'Cases & Power'}),
    ).toBeTruthy();
    expect(screen.getByRole('heading', {level: 2, name: 'Active'})).toBeTruthy();
    expect(screen.getByRole('heading', {level: 2, name: 'Legacy'})).toBeTruthy();
    expect(screen.getByText('Vessel 168')).toBeTruthy();
    expect(screen.getByText('Bus 168 DIY Kit')).toBeTruthy();
    expect(screen.getByText('DC Distro 3A')).toBeTruthy();
    expect(screen.getByText('Rack 84HP')).toBeTruthy();
  });

  it('links cards to their Shopify product routes', () => {
    renderWithRouter(<CasesAndPowerPage />);

    expect(screen.getByText('Vessel 168').closest('a')?.getAttribute('href')).toBe(
      '/products/vessel-168',
    );
    expect(
      screen.getByText('Bus 168 DIY Kit').closest('a')?.getAttribute('href'),
    ).toBe('/products/bus-168-diy-kit');
    expect(screen.getByText('DC Distro 3A').closest('a')?.getAttribute('href')).toBe(
      '/products/dc-distro-3a',
    );
  });
});