import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import SystemsPage from '~/routes/($lang).systems';

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useLoaderData: () => ({
      entries: [
        {
          canonical: 'double-vision',
          name: 'Double Vision System',
          subtitle: 'Desktop Gen3 video synthesis system.',
          shopifyProduct: null,
        },
        {
          canonical: 'double-vision-168',
          name: 'Double Vision 168',
          subtitle: 'Expanded 168HP Gen3 configuration.',
          shopifyProduct: null,
        },
        {
          canonical: 'double-vision-expander',
          name: 'Double Vision Expander',
          subtitle: 'Companion expansion for larger Double Vision systems.',
          shopifyProduct: null,
        },
      ],
    }),
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Systems page', () => {
  it('renders the Gen3 systems section with all Double Vision products', () => {
    renderWithRouter(<SystemsPage />);

    expect(screen.getByRole('heading', {level: 1, name: 'Systems'})).toBeTruthy();
    expect(screen.getByRole('heading', {level: 2, name: 'Gen3 Series'})).toBeTruthy();
    expect(screen.getByText('Double Vision System')).toBeTruthy();
    expect(screen.getByText('Double Vision 168')).toBeTruthy();
    expect(screen.getByText('Double Vision Expander')).toBeTruthy();
  });

  it('links each card to the correct system route', () => {
    renderWithRouter(<SystemsPage />);

    expect(
      screen.getByText('Double Vision System').closest('a')?.getAttribute('href'),
    ).toBe('/systems/double-vision');
    expect(
      screen.getByText('Double Vision 168').closest('a')?.getAttribute('href'),
    ).toBe('/systems/double-vision-168');
    expect(
      screen.getByText('Double Vision Expander').closest('a')?.getAttribute('href'),
    ).toBe('/systems/double-vision-expander');
  });

  it('replaces the old starter-system card content', () => {
    renderWithRouter(<SystemsPage />);

    expect(screen.queryByText('Suggested Modules')).toBeNull();
    expect(screen.queryByText('Studio Rack Builder')).toBeNull();
  });
});