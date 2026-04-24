import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';

import CasesAndPowerPage, {
  getCasesAndPowerEntries,
  loader as casesAndPowerLoader,
} from '~/routes/($lang).cases-and-power';
import type {CategoryListingData} from '~/lib/category-listing/types';

const buildEntry = (
  overrides: Partial<{
    key: string;
    name: string;
    href: string;
    subtitle: string;
  }> = {},
) => ({
  key: overrides.key ?? 'placeholder',
  name: overrides.name ?? 'Placeholder',
  subtitle: overrides.subtitle ?? null,
  href: overrides.href ?? `/products/${overrides.key ?? 'placeholder'}`,
  externalUrl: null,
  isExternal: false,
  badge: null,
  image: {
    localPath: null,
    shopify: null,
    aspectRatio: '1/1' as const,
    fit: 'contain' as const,
  },
});

const mockData: CategoryListingData = {
  pageTitle: 'Cases & Power',
  pageSubtitle: 'Mock subtitle',
  cardSize: 'sm',
  gridColsClassName: 'grid',
  sections: [
    {
      key: 'active',
      label: 'Active',
      groups: [
        {
          key: 'active',
          entries: [
            buildEntry({
              key: 'vessel-168',
              name: 'Vessel 168',
              href: '/products/vessel-168',
            }),
            buildEntry({
              key: 'bus-168-diy-kit',
              name: 'Bus 168 DIY Kit',
              href: '/products/bus-168-diy-kit',
            }),
          ],
        },
      ],
    },
    {
      key: 'legacy',
      label: 'Legacy',
      groups: [
        {
          key: 'legacy',
          entries: [
            buildEntry({
              key: 'dc-distro-3a',
              name: 'DC Distro 3A',
              href: '/products/dc-distro-3a',
            }),
            buildEntry({
              key: 'rack-84hp',
              name: 'Rack 84HP',
              href: '/products/rack-84hp',
            }),
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

describe('Cases and power page', () => {
  it('builds entries from the local catalog without calling Shopify for content', async () => {
    const storefrontQuery = vi.fn();

    const response = await casesAndPowerLoader({
      context: {
        storefront: {
          i18n: {country: 'US', language: 'EN'},
          CacheCustom: () => ({}),
          query: storefrontQuery,
        },
      },
      request: new Request('https://example.com/cases-and-power'),
      params: {},
    } as unknown as Parameters<typeof casesAndPowerLoader>[0]);

    const payload = (await (
      response as Response
    ).json()) as CategoryListingData;

    // The shared category-listing loader no longer issues Storefront
    // GraphQL queries for content. Categories that opt into the live
    // commerce snippet may call `getCommerceByHandles`, but the
    // cases-and-power config does not.
    expect(storefrontQuery).not.toHaveBeenCalled();

    const allEntries = payload.sections.flatMap((s) =>
      s.groups.flatMap((g) => g.entries),
    );
    expect(allEntries.find((e) => e.key === 'vessel-168')?.href).toBe(
      '/products/vessel-168',
    );
    expect(allEntries.find((e) => e.key === 'dc-distro-3a')?.href).toBe(
      '/products/dc-distro-3a',
    );
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
    expect(
      screen.getByRole('heading', {level: 2, name: 'Active'}),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {level: 2, name: 'Legacy'}),
    ).toBeTruthy();
    expect(screen.getByText('Vessel 168')).toBeTruthy();
    expect(screen.getByText('Bus 168 DIY Kit')).toBeTruthy();
    expect(screen.getByText('DC Distro 3A')).toBeTruthy();
    expect(screen.getByText('Rack 84HP')).toBeTruthy();
  });

  it('links cards to their Shopify product routes', () => {
    renderWithRouter(<CasesAndPowerPage />);

    expect(
      screen.getByText('Vessel 168').closest('a')?.getAttribute('href'),
    ).toBe('/products/vessel-168');
    expect(
      screen.getByText('Bus 168 DIY Kit').closest('a')?.getAttribute('href'),
    ).toBe('/products/bus-168-diy-kit');
    expect(
      screen.getByText('DC Distro 3A').closest('a')?.getAttribute('href'),
    ).toBe('/products/dc-distro-3a');
  });
});
