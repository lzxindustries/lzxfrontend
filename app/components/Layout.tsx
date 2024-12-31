import {useMatches, useLocation, Await} from '@remix-run/react';
import {Suspense} from 'react';
import {Footer} from './Footer';
import {Header} from './Header';
import type {LayoutData} from '~/root';

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

  const cart = rootMatch.data?.cart;

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <a href="#mainContent" className="sr-only">
          Skip to content
        </a>
        <Suspense fallback={<div>Loading Header...</div>}>
          <Await resolve={cart}>
            {(cartData) => (
              <Header
                cartCount={cartData?.totalQuantity || 0}
                url={`${location.pathname}${location.search}`}
              />
            )}
          </Await>
        </Suspense>
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
