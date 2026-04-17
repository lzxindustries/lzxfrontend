import {useMatches, useLocation, Await} from '@remix-run/react';
import {Suspense, useEffect, useRef, useState} from 'react';
import type {Cart as CartType} from '@shopify/hydrogen/storefront-api-types';
import {Footer} from './Footer';
import {Header} from './Header';
import {Drawer, useDrawer} from './Drawer';
import {Cart} from './Cart';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {CartAction} from '~/lib/type';
import type {LayoutData} from '~/root';

/**
 * Sync cart count from the resolved cart promise back to parent state.
 */
function CartCountSync({
  count,
  onCount,
}: {
  count: number;
  onCount: (n: number) => void;
}) {
  useEffect(() => {
    onCount(count);
  }, [count, onCount]);
  return null;
}

export function Layout({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: LayoutData;
}) {
  const matches = useMatches();
  const location = useLocation();
  const rootMatch = matches.find((match) => match.id === 'root');

  if (!rootMatch) {
    console.error('Root route not found in matches:', matches);
    return <div>Error: Root route not found.</div>;
  }

  const cart = (rootMatch.data as Record<string, any>)?.cart;
  const isLoggedIn = (rootMatch.data as Record<string, any>)?.isLoggedIn;

  const {isOpen: isCartOpen, openDrawer: openCart, closeDrawer: closeCart} = useDrawer();
  const [cartCount, setCartCount] = useState(0);

  // Auto-open cart drawer when an add-to-cart action completes
  const addToCartFetchers = useCartFetchers(CartAction.ADD_TO_CART);
  const prevFetcherCount = useRef(addToCartFetchers.length);

  useEffect(() => {
    if (
      addToCartFetchers.length === 0 &&
      prevFetcherCount.current > 0
    ) {
      openCart();
    }
    prevFetcherCount.current = addToCartFetchers.length;
  }, [addToCartFetchers.length, openCart]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <a href="#mainContent" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black">
          Skip to content
        </a>
        <Header
          cartCount={cartCount}
          url={`${location.pathname}${location.search}`}
          isLoggedIn={isLoggedIn}
          onCartClick={openCart}
        />
        <Suspense fallback={null}>
          <Await resolve={cart}>
            {(cartData) => (
              <>
                <CartCountSync
                  count={cartData?.totalQuantity || 0}
                  onCount={setCartCount}
                />
                <Drawer
                  open={isCartOpen}
                  onClose={closeCart}
                  heading="Cart"
                  openFrom="right"
                >
                  <Cart
                    layout="drawer"
                    onClose={closeCart}
                    cart={cartData as CartType}
                  />
                </Drawer>
              </>
            )}
          </Await>
        </Suspense>
        <main id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
