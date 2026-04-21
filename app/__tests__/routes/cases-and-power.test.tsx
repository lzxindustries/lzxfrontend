import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';

import CasesAndPowerPage, {
  getCasesAndPowerEntries,
  loader as casesAndPowerLoader,
} from '~/routes/($lang).cases-and-power';

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
  it('loads curated products from Shopify by handle and merges the results', async () => {
    const storefrontQuery = vi.fn().mockResolvedValue({
      products: {
        nodes: [
          {
            id: 'gid://shopify/Product/7171710189591',
            title: 'Vessel 168',
            handle: 'vessel-168',
          },
          {
            id: 'gid://shopify/Product/6778221133847',
            title: 'DC Distro 3A',
            handle: 'dc-distro-3a',
          },
        ],
      },
    });

    const response = await casesAndPowerLoader({
      context: {
        storefront: {
          i18n: {country: 'US', language: 'EN'},
          query: storefrontQuery,
        },
      },
      request: new Request('https://example.com/cases-and-power'),
      params: {},
    } as unknown as Parameters<typeof casesAndPowerLoader>[0]);

    const payload = await (response as Response).json();
    const {activeEntries, legacyEntries} = payload as {
      activeEntries: Array<{
        slug: string;
        shopifyProduct: {handle: string} | null;
      }>;
      legacyEntries: Array<{
        slug: string;
        shopifyProduct: {handle: string} | null;
      }>;
    };

    expect(storefrontQuery).toHaveBeenCalledTimes(1);
    expect(storefrontQuery).toHaveBeenCalledWith(
      expect.stringContaining('query CasesAndPowerProducts'),
      expect.objectContaining({
        variables: expect.objectContaining({
          first: getCasesAndPowerEntries().length,
          country: 'US',
          language: 'EN',
          query: expect.stringContaining('handle:vessel-168'),
        }),
      }),
    );
    expect(storefrontQuery.mock.calls[0]?.[1]?.variables?.query).toContain(
      'handle:dc-distro-3a',
    );

    expect(
      activeEntries.find((entry) => entry.slug === 'vessel-168')?.shopifyProduct,
    ).toEqual(expect.objectContaining({handle: 'vessel-168'}));
    expect(
      legacyEntries.find((entry) => entry.slug === 'dc-distro-3a')?.shopifyProduct,
    ).toEqual(expect.objectContaining({handle: 'dc-distro-3a'}));
    expect(
      activeEntries.find((entry) => entry.slug === 'vessel-208')?.shopifyProduct,
    ).toBeNull();
  });

  it('includes active cases, legacy racks, distro modules, and power accessories', () => {
    const entries = getCasesAndPowerEntries();
    const slugs = new Set(entries.map((entry) => entry.slug));

    expect(slugs.has('vessel-168')).toBe(true);
    expect(slugs.has('rack-84hp')).toBe(true);
    expect(slugs.has('dc-distro-3a')).toBe(true);
    expect(slugs.has('dc-distro-5a')).toBe(true);
    expect(slugs.has('12v-dc-adapter-3a')).toBe(true);
    expect(slugs.has('dc-power-cable')).toBe(true);
    expect(slugs.has('power-entry-8hp')).toBe(true);
    expect(slugs.has('power-sync-entry-12hp')).toBe(true);
    expect(slugs.has('double-vision-system')).toBe(false);
  });

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