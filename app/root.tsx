import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
} from '@remix-run/react';
import {ShopifySalesChannel, getSeoMeta} from '@shopify/hydrogen';
import type {Shop, Cart} from '@shopify/hydrogen/storefront-api-types';
import {defer} from '@shopify/remix-oxygen';
import type {
  MetaArgs,
  LinksFunction,
  LoaderFunctionArgs,
  AppLoadContext,
} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import {useCallback, useState} from 'react';
import {CookieConsent} from './components/CookieConsent';
import {GenericError} from './components/GenericError';
import {MetaPixel} from './components/MetaPixel';
import {NotFound} from './components/NotFound';
import {useAnalytics} from './hooks/useAnalytics';
import {DEFAULT_LOCALE, getCartId, type EnhancedMenu} from './lib/utils';
import {
  SHOP_NAME,
  SHOP_DESCRIPTION,
  SHOP_BRAND_LOGO_URL,
  SITE_ORIGIN,
} from './config/shop';
import styles from './styles/app.css?url';
import katexStyles from 'katex/dist/katex.min.css?url';
import hljsStyles from 'highlight.js/styles/github.css?url';
import favicon from '~/assets/favicon.svg';
import {Layout} from '~/components/Layout';
import {seoPayload} from '~/lib/seo.server';
export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {rel: 'stylesheet', href: katexStyles},
    {rel: 'stylesheet', href: hljsStyles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'LZX Blog',
      href: '/blog.rss.xml',
    },
  ];
};

export async function loader({request, context}: LoaderFunctionArgs) {
  const cartId = getCartId(request);
  const customerAccessToken = await context.session.get('customerAccessToken');
  const layout = getLayoutData(request);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});

  return defer({
    isLoggedIn: Boolean(customerAccessToken),
    layout,
    selectedLocale: context.storefront.i18n,
    cart: cartId ? getCart(context, cartId) : undefined,
    analytics: {
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
      shopId: layout.shop.id,
    },
    seo,
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const [hasUserConsent, setHasUserConsent] = useState(false);

  const handleConsent = useCallback((consent: boolean) => {
    setHasUserConsent(consent);
  }, []);

  useAnalytics(hasUserConsent, locale);

  const htmlLang = locale.language.toLowerCase();

  return (
    <html lang={htmlLang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <MetaPixel enabled={hasUserConsent} />
      </head>
      <body>
        <Layout
          layout={data.layout as LayoutData}
          key={`${locale.language}-${locale.country}`}
        >
          <Outlet />
        </Layout>
        <CookieConsent onConsent={handleConsent} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

type SeoMetaInput = Parameters<typeof getSeoMeta>[0];

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => {
      const data = match.data;
      if (!data || typeof data !== 'object') {
        return undefined;
      }
      return 'seo' in data ? (data as {seo: SeoMetaInput}).seo : undefined;
    }),
  );
};

export function ErrorBoundary({error}: {error: Error}) {
  const [root] = useMatches();
  const locale =
    (root?.data as Record<string, any>)?.selectedLocale ?? DEFAULT_LOCALE;
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) {
      pageType = 'page';
    }
  }

  const htmlLang = locale.language.toLowerCase();

  return (
    <html lang={htmlLang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout
          layout={(root?.data as Record<string, any>)?.layout}
          key={`${locale.language}-${locale.country}`}
        >
          {isRouteError ? (
            <>
              {routeError.status === 404 ? (
                <NotFound type={pageType} />
              ) : (
                <GenericError
                  error={{message: `${routeError.status} ${routeError.data}`}}
                />
              )}
            </>
          ) : (
            <GenericError error={error instanceof Error ? error : undefined} />
          )}
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}

export interface LayoutData {
  headerMenu: EnhancedMenu;
  footerMenu: EnhancedMenu;
  shop: Shop;
  cart?: Promise<Cart>;
}

function emptyMenu(handle: string): EnhancedMenu {
  return {id: `local-${handle}`, items: []} as unknown as EnhancedMenu;
}

function getLayoutData(request: Request): LayoutData {
  const origin = (() => {
    try {
      return new URL(request.url).origin;
    } catch {
      return SITE_ORIGIN;
    }
  })();

  const shop = {
    id: 'local-shop',
    name: SHOP_NAME,
    description: SHOP_DESCRIPTION,
    primaryDomain: {url: origin},
    brand: {
      logo: {
        image: {url: `${origin}${SHOP_BRAND_LOGO_URL}`},
      },
    },
  } as unknown as Shop;

  return {
    shop,
    headerMenu: emptyMenu('header'),
    footerMenu: emptyMenu('footer'),
  };
}

const CART_QUERY = `#graphql
  query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

export async function getCart({storefront}: AppLoadContext, cartId: string) {
  invariant(storefront, 'missing storefront client in cart query');

  const {cart} = await storefront.query<{cart?: Cart}>(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}
