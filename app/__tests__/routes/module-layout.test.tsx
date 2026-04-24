import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';

import ModuleLayout from '~/routes/($lang).modules.$slug';

const remixState: any = {
  loaderData: {
    slug: 'color-video-encoder',
    product: {title: 'Color Video Encoder'},
    hasLocalDocumentation: false,
    patches: [],
    videos: [],
    assets: [],
    archiveAssets: [],
    connectors: [],
    controls: [],
    features: [],
    slugEntry: {
      canonical: 'color-video-encoder',
      externalUrl:
        'https://www.modulargrid.net/e/lzx-industries-color-video-encoder',
    },
  },
};

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useLoaderData: () => remixState.loaderData,
    Outlet: () => <div>Outlet</div>,
  };
});

vi.mock('~/components/Breadcrumbs', () => ({
  Breadcrumbs: () => <div>Breadcrumbs</div>,
}));

vi.mock('~/components/HubNavBar', () => ({
  HubNavBar: ({
    tabs,
  }: {
    tabs: Array<{label: string; to: string; hidden?: boolean}>;
  }) => (
    <nav>
      {tabs
        .filter((tab) => !tab.hidden)
        .map((tab) => (
          <a key={tab.to} href={tab.to}>
            {tab.label}
          </a>
        ))}
    </nav>
  ),
}));

describe('Module layout manual tab visibility', () => {
  it('hides the Manual tab when a module has no local documentation', () => {
    remixState.loaderData = {
      ...remixState.loaderData,
      hasLocalDocumentation: false,
    };

    render(<ModuleLayout />);

    expect(screen.queryByText('Manual')).toBeNull();
    // Also assert the deprecated "Docs" label is not leaking back in
    // via fallback logic.
    expect(screen.queryByText('Docs')).toBeNull();
  });

  it('shows the Manual tab when a module has local documentation', () => {
    remixState.loaderData = {
      ...remixState.loaderData,
      hasLocalDocumentation: true,
      slugEntry: {
        canonical: 'color-video-encoder',
        externalUrl: null,
      },
    };

    render(<ModuleLayout />);

    const manualLink = screen.getByText('Manual').closest('a');

    expect(manualLink?.getAttribute('href')).toBe(
      '/modules/color-video-encoder/manual',
    );
  });
});
