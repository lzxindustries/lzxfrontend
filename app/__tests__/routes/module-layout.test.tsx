import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';

import ModuleLayout from '~/routes/($lang).modules.$slug';

const remixState = {
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
      externalUrl: 'https://www.modulargrid.net/e/lzx-industries-color-video-encoder',
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
  HubNavBar: ({tabs}: {tabs: Array<{label: string; to: string; hidden?: boolean}>}) => (
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

describe('Module layout docs tab visibility', () => {
  it('hides the Docs tab when a module only has an external reference', () => {
    remixState.loaderData = {
      ...remixState.loaderData,
      hasLocalDocumentation: false,
    };

    render(<ModuleLayout />);

    expect(screen.queryByText('Docs')).toBeNull();
  });

  it('shows the Docs tab when a module has local documentation without relying on an external URL', () => {
    remixState.loaderData = {
      ...remixState.loaderData,
      hasLocalDocumentation: true,
      slugEntry: {
        canonical: 'color-video-encoder',
        externalUrl: null,
      },
    };

    render(<ModuleLayout />);

    const docsLink = screen.getByText('Docs').closest('a');

    expect(docsLink?.getAttribute('href')).toBe(
      '/modules/color-video-encoder/manual',
    );
  });
});