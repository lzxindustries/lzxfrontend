import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import type {Order} from '@shopify/hydrogen/storefront-api-types';
import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useState} from 'react';
import {Button} from '~/components/Button';
import {Link} from '~/components/Link';
import {OrderCard} from '~/components/OrderCard';
import {PageHeader, Text} from '~/components/Text';
import {CACHE_NONE} from '~/data/cache';

const PAGE_SIZE = 20;

export const meta: MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect(
      params.lang ? `/${params.lang}/account/login` : '/account/login',
    );
  }

  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const data = await context.storefront.query<{customer: any}>(ORDERS_QUERY, {
    variables: {
      customerAccessToken,
      first: PAGE_SIZE,
      after: cursor,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!data?.customer) {
    const {session} = context;
    session.unset('customerAccessToken');
    const pathPrefix = context.storefront.i18n.pathPrefix;
    throw redirect(`${pathPrefix}/account/login?expired=1`, {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  }

  const orders = flattenConnection(data.customer.orders) as Order[];
  const pageInfo = data.customer.orders.pageInfo;

  return json({orders, pageInfo}, {headers: {'Cache-Control': CACHE_NONE}});
}

export default function OrdersIndex() {
  const {orders, pageInfo} = useLoaderData<typeof loader>();
  const [allOrders, setAllOrders] = useState(orders);
  const [currentPageInfo, setCurrentPageInfo] = useState(pageInfo);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function loadMore() {
    if (!currentPageInfo.hasNextPage || !currentPageInfo.endCursor) return;
    setLoading(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('cursor', currentPageInfo.endCursor);
      const response = await fetch(url.toString(), {
        headers: {Accept: 'application/json'},
      });
      const data: {orders: Order[]; pageInfo: typeof currentPageInfo} =
        await response.json();
      setAllOrders((prev) => [...prev, ...data.orders]);
      setCurrentPageInfo(data.pageInfo);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      !search ||
      String(order.orderNumber).includes(search) ||
      order.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.fulfillmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <PageHeader heading="Order History">
        <Link to="/account">
          <Text color="subtle">Return to Account</Text>
        </Link>
      </PageHeader>
      <div className="w-full p-4 md:p-8 lg:p-12">
        {allOrders.length === 0 ? (
          <div>
            <Text className="mb-1" size="fine" width="narrow" as="p">
              You haven&apos;t placed any orders yet.
            </Text>
            <div className="w-48 mt-2">
              <Button className="w-full text-sm" variant="secondary" to="/">
                Start Shopping
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                placeholder="Search by order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered input-sm w-full sm:w-64"
                aria-label="Search orders"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered select-sm w-full sm:w-auto"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="UNFULFILLED">Unfulfilled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
              </select>
            </div>
            <Text className="mb-4" size="fine" color="subtle">
              {filteredOrders.length} order
              {filteredOrders.length !== 1 ? 's' : ''}
              {filteredOrders.length !== allOrders.length &&
                ` (of ${allOrders.length} total)`}
            </Text>
            <ul className="grid grid-flow-row grid-cols-1 gap-2 gap-y-6 md:gap-4 md:grid-cols-2 lg:gap-6 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard order={order} key={order.id} />
              ))}
            </ul>
            {currentPageInfo.hasNextPage && (
              <div className="flex justify-center mt-8">
                <Button
                  className="text-sm"
                  variant="secondary"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Orders'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const ORDERS_QUERY = `#graphql
  query CustomerOrders(
    $customerAccessToken: String!
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 2) {
              edges {
                node {
                  variant {
                    image {
                      url
                      altText
                      height
                      width
                    }
                  }
                  title
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
