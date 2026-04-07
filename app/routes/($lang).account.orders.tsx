import {
  useLoaderData,
  useSearchParams,
  type MetaFunction,
  redirect,
} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import type {Order} from '@shopify/hydrogen/storefront-api-types';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useEffect, useState} from 'react';
import {getCustomer} from './($lang).account';
import {OrderCard} from '~/components/OrderCard';
import {PageHeader, Text, Heading} from '~/components/Text';
import {getInputStyleClasses} from '~/lib/utils';
import {CACHE_NONE} from '~/data/cache';

export const meta: MetaFunction = () => {
  return [{title: 'Order History'}];
};

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account/login` : '/account/login');
  }

  const customer = await getCustomer(context, customerAccessToken);
  const orders = flattenConnection(customer.orders) as Order[];

  return json(
    {orders},
    {
      headers: {
        'Cache-Control': CACHE_NONE,
      },
    },
  );
}

export default function OrderHistory() {
  const {orders} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all',
  );

  const filteredOrders = orders.filter((order) => {
    // Search by order number
    const matchesSearch =
      !searchTerm ||
      String(order.orderNumber).toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by fulfillment status
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'fulfilled' &&
        order.fulfillmentStatus === 'FULFILLED') ||
      (statusFilter === 'pending' &&
        order.fulfillmentStatus !== 'FULFILLED');

    return matchesSearch && matchesStatus;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateParams(value, statusFilter);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    updateParams(searchTerm, value);
  };

  const updateParams = (search: string, status: string) => {
    const newParams = new URLSearchParams();
    if (search) newParams.set('q', search);
    if (status !== 'all') newParams.set('status', status);
    setSearchParams(newParams);
  };

  return (
    <>
      <PageHeader heading="Order History">
        <Text color="subtle" as="p">
          View and manage all your orders
        </Text>
      </PageHeader>

      <div className="w-full p-6 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Search and Filter */}
          {orders.length > 0 && (
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium mb-2">
                    Search by order number
                  </label>
                  <input
                    id="search"
                    type="text"
                    placeholder="e.g., #1001"
                    value={searchTerm}
                    onChange={handleSearch}
                    className={getInputStyleClasses()}
                    aria-label="Search orders"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="status" className="block text-sm font-medium mb-2">
                    Filter by status
                  </label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className={getInputStyleClasses()}
                    aria-label="Filter by fulfillment status"
                  >
                    <option value="all">All Orders</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="pending">In Progress</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <Heading size="copy" as="h2" className="mb-2">
                No orders found
              </Heading>
              <Text color="subtle">
                {orders.length === 0
                  ? 'You haven\'t placed any orders yet.'
                  : 'No orders match your search or filter criteria.'}
              </Text>
            </div>
          ) : (
            <div>
              <Text size="fine" color="subtle" className="mb-4">
                Showing {filteredOrders.length} of {orders.length} orders
              </Text>
              <ul className="grid gap-4 md:gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
