import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import type {ComponentPropsWithoutRef, ElementType, ReactNode} from 'react';

const {variantSelectorSpy, mockedUseOutletContext} = vi.hoisted(() => ({
  variantSelectorSpy: vi.fn(),
  mockedUseOutletContext: vi.fn(),
}));

vi.mock('@shopify/hydrogen', async () => {
  const actual = await vi.importActual<typeof import('@shopify/hydrogen')>(
    '@shopify/hydrogen',
  );

  return {
    ...actual,
    Money: ({
      data,
      as: Component = 'span',
      className,
    }: {
      data?: {amount?: string};
      as?: ElementType;
      className?: string;
    }) => <Component className={className}>{data?.amount ?? ''}</Component>,
    ShopPayButton: () => null,
    VariantSelector: (props: unknown) => {
      variantSelectorSpy(props);
      return null;
    },
  };
});

vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual<typeof import('@remix-run/react')>(
    '@remix-run/react',
  );

  return {
    ...actual,
    useFetcher: () => ({
      state: 'idle',
      data: null,
      Form: ({children, ...props}: ComponentPropsWithoutRef<'form'>) => (
        <form {...props}>{children}</form>
      ),
    }),
    useOutletContext: mockedUseOutletContext,
  };
});

vi.mock('~/components/AddToCartButton', () => ({
  AddToCartButton: ({children, ...props}: ComponentPropsWithoutRef<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('~/components/Button', () => ({
  Button: ({
    children,
    as,
    ...props
  }: ComponentPropsWithoutRef<'button'> & {as?: string}) => {
    if (as === 'button') {
      return <button {...props}>{children}</button>;
    }

    return <button {...props}>{children}</button>;
  },
}));

vi.mock('~/components/Link', () => ({
  Link: ({children, to, ...props}: ComponentPropsWithoutRef<'a'> & {to?: string}) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('~/components/Text', () => ({
  Heading: ({
    children,
    as: Component = 'h2',
    ...props
  }: {
    children: ReactNode;
    as?: ElementType;
  }) => <Component {...props}>{children}</Component>,
  Text: ({
    children,
    as: Component = 'span',
    ...props
  }: {
    children: ReactNode;
    as?: ElementType;
  }) => <Component {...props}>{children}</Component>,
}));

vi.mock('~/components/ProductSwimlane', () => ({
  ProductSwimlane: () => null,
}));

vi.mock('~/components/ProductMediaGallery', () => ({
  __esModule: true,
  default: () => null,
  MediaGalleryItemType: {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
  },
}));

vi.mock('~/components/QuickStartPreview', () => ({
  QuickStartPreview: () => null,
  QUICK_START_STEPS: {},
}));

vi.mock('~/hooks/useWishlist', () => ({
  useWishlist: () => ({
    isInWishlist: () => false,
    toggleItem: vi.fn(),
  }),
}));

import ModuleOverview from '~/routes/($lang).modules.$slug._index';
import InstrumentOverview from '~/routes/($lang).instruments.$slug._index';
import {loader as productLoader} from '~/routes/($lang).products.$productHandle';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function createSelectedVariant(id: string, value: string) {
  return {
    id,
    title: value,
    availableForSale: true,
    quantityAvailable: 3,
    price: {amount: '199.00', currencyCode: 'USD'},
    compareAtPrice: null,
    image: null,
    selectedOptions: [{name: 'Format', value}],
  };
}

function createOutletContext({
  handle,
  canonical,
}: {
  handle: string;
  canonical: string;
}) {
  const selectedVariant = createSelectedVariant(
    'gid://shopify/ProductVariant/2',
    'Black',
  );

  return {
    product: {
      id: 'gid://shopify/Product/1',
      handle,
      title: canonical.toUpperCase(),
      vendor: 'LZX Industries',
      descriptionHtml: '<p>Demo product</p>',
      media: {nodes: []},
      options: [{name: 'Format', values: ['Black', 'Silver']}],
      variants: {nodes: [selectedVariant]},
      selectedVariant,
      metafields: [],
      seo: null,
    },
    shop: {
      primaryDomain: {url: 'https://lzxindustries.net'},
    },
    slugEntry: {
      canonical,
      isHidden: false,
    },
    hasManual: false,
    recommended: null,
    connectors: [],
    controls: [],
    features: [],
    assets: [],
    videos: [],
    patches: [],
    docPages: [],
  };
}

describe('Variant selection regression coverage', () => {
  beforeEach(() => {
    variantSelectorSpy.mockClear();
    mockedUseOutletContext.mockReset();
    globalThis.IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: null,
      rootMargin: '',
      thresholds: [],
    })) as unknown as typeof IntersectionObserver;
  });

  it('passes the module hub path and selected variant into VariantSelector', () => {
    mockedUseOutletContext.mockReturnValue(
      createOutletContext({handle: 'prm', canonical: 'prm'}),
    );

    renderWithRouter(<ModuleOverview />);

    expect(variantSelectorSpy).toHaveBeenCalledTimes(1);

    const props = variantSelectorSpy.mock.calls[0]?.[0] as {
      handle: string;
      productPath?: string;
      selectedVariant?: {id: string};
    };

    expect(props.handle).toBe('prm');
    expect(props.productPath).toBe('modules');
    expect(props.selectedVariant?.id).toBe('gid://shopify/ProductVariant/2');
  });

  it('passes the instrument hub path and selected variant into VariantSelector', () => {
    mockedUseOutletContext.mockReturnValue(
      createOutletContext({
        handle: 'videomancer',
        canonical: 'videomancer',
      }),
    );

    renderWithRouter(<InstrumentOverview />);

    expect(variantSelectorSpy).toHaveBeenCalledTimes(1);

    const props = variantSelectorSpy.mock.calls[0]?.[0] as {
      handle: string;
      productPath?: string;
      selectedVariant?: {id: string};
    };

    expect(props.handle).toBe('videomancer');
    expect(props.productPath).toBe('instruments');
    expect(props.selectedVariant?.id).toBe('gid://shopify/ProductVariant/2');
  });

  it('preserves query params when redirecting legacy product module URLs', async () => {
    const request = new Request(
      'https://lzxindustries.net/products/prm?Format=Black',
    );

    try {
      await productLoader({
        params: {productHandle: 'prm'},
        request,
        context: {} as never,
      } as never);
      throw new Error('Expected product loader to redirect');
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      const response = error as Response;
      expect(response.status).toBe(301);
      expect(response.headers.get('Location')).toBe(
        '/modules/prm?Format=Black',
      );
    }
  });

  it('preserves query params when redirecting legacy product instrument URLs', async () => {
    const request = new Request(
      'https://lzxindustries.net/products/videomancer?Version=Black',
    );

    try {
      await productLoader({
        params: {productHandle: 'videomancer'},
        request,
        context: {} as never,
      } as never);
      throw new Error('Expected product loader to redirect');
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      const response = error as Response;
      expect(response.status).toBe(301);
      expect(response.headers.get('Location')).toBe(
        '/instruments/videomancer?Version=Black',
      );
    }
  });
});