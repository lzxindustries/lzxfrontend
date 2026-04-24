import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await} from '@remix-run/react';
import {getFeaturedData} from './($lang).featured-products';
import {Link} from '~/components/Link';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {ProductSwimlane} from '~/components/ProductSwimlane';
import {PageHeader, Text} from '~/components/Text';

export const meta: MetaFunction = () => {
  return [
    {title: 'Order Confirmed | LZX Industries'},
    {
      name: 'description',
      content:
        'Your LZX Industries order has been placed. Expect shipping updates by email while we prepare your instruments and modules for dispatch.',
    },
    {name: 'robots', content: 'noindex, nofollow'},
  ];
};

export async function loader({context}: LoaderFunctionArgs) {
  const featuredData = getFeaturedData(context.storefront);
  return defer({featuredData});
}

export default function OrderConfirmed() {
  const {featuredData} = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader heading="Thank You!">
        <Text color="subtle" as="p">
          Your order has been placed successfully.
        </Text>
      </PageHeader>
      <div className="w-full p-6 md:p-8 lg:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="text-4xl mb-3">✓</div>
            <Text as="h2" size="lead" className="font-bold">
              Order Confirmed
            </Text>
            <Text className="mt-2" color="subtle">
              We&apos;ve received your order and are getting it ready.
              You&apos;ll receive a confirmation email shortly with your order
              details.
            </Text>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 border border-primary/10 rounded-lg">
              <Text as="h3" className="font-bold mb-2">
                What&apos;s Next?
              </Text>
              <Text size="fine" color="subtle">
                We&apos;ll send you shipping updates via email as your order
                progresses.
              </Text>
            </div>
            <div className="p-4 border border-primary/10 rounded-lg">
              <Text as="h3" className="font-bold mb-2">
                Track Your Order
              </Text>
              <Text size="fine" color="subtle">
                Sign in to your account to view order status and tracking
                information.
              </Text>
            </div>
            <div className="p-4 border border-primary/10 rounded-lg">
              <Text as="h3" className="font-bold mb-2">
                Need Help?
              </Text>
              <Text size="fine" color="subtle">
                Contact us if you have any questions about your order.
              </Text>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/account" className="btn btn-primary">
              View Your Account
            </Link>
            <Link to="/" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Suspense>
        <Await
          resolve={featuredData}
          errorElement="There was a problem loading featured products."
        >
          {(data) => (
            <>
              <ProductSwimlane
                title="You Might Also Like"
                products={data.featuredProducts}
              />
              <FeaturedCollections
                title="Popular Collections"
                collections={data.featuredCollections as Collection[]}
              />
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
