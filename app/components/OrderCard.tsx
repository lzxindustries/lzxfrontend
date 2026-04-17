import {flattenConnection, Image} from '@shopify/hydrogen';
import type {Order} from '@shopify/hydrogen/storefront-api-types';
import {Link} from '~/components/Link';
import {Heading, Text} from '~/components/Text';
import {statusMessage, financialStatusMessage} from '~/lib/utils';

export function OrderCard({order}: {order: Order}) {
  if (!order?.id) return null;
  const idParts = order.id.split('/').pop()?.split('?') ?? [];
  const legacyOrderId = idParts[0] ?? '';
  const key = idParts[1] ?? '';
  const lineItems = flattenConnection(order?.lineItems);
  const firstLineItem = lineItems[0];

  return (
    <li className="grid text-center border rounded">
      <Link
        className="grid items-center gap-4 p-4 md:gap-6 md:p-6 md:grid-cols-2"
        to={`/account/orders/${legacyOrderId}?${key}`}
        prefetch="intent"
      >
        {firstLineItem?.variant?.image && (
          <div className="card-image aspect-square bg-primary/5">
            <Image
              width={168}
              height={168}
              className="w-full fadeIn cover"
              alt={firstLineItem.variant?.image?.altText ?? 'Order image'}
              src={firstLineItem.variant?.image?.url}
            />
          </div>
        )}
        <div
          className={`flex-col justify-center text-left ${
            !firstLineItem?.variant?.image && 'md:col-span-2'
          }`}
        >
          <Heading as="h3" format size="copy">
            {lineItems.length > 1
              ? `${firstLineItem?.title} +${lineItems.length - 1} more`
              : firstLineItem?.title}
          </Heading>
          <dl className="grid grid-gap-1">
            <dt className="sr-only">Order ID</dt>
            <dd>
              <Text size="fine" color="subtle">
                Order No. {order.orderNumber}
              </Text>
            </dd>
            <dt className="sr-only">Order Date</dt>
            <dd>
              <Text size="fine" color="subtle">
                {new Date(order.processedAt).toDateString()}
              </Text>
            </dd>
            <dt className="sr-only">Fulfillment Status</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  order.fulfillmentStatus === 'FULFILLED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-primary/5 text-primary/50'
                }`}
              >
                <Text size="fine">
                  {statusMessage(order.fulfillmentStatus)}
                </Text>
              </span>
              {order.financialStatus && (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    order.financialStatus === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : order.financialStatus === 'REFUNDED' ||
                        order.financialStatus === 'PARTIALLY_REFUNDED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-primary/5 text-primary/50'
                  }`}
                >
                  <Text size="fine">
                    {financialStatusMessage(order.financialStatus)}
                  </Text>
                </span>
              )}
            </dd>
          </dl>
        </div>
      </Link>
      <div className="self-end border-t">
        <Link
          className="block w-full p-2 text-center"
          to={`/account/orders/${legacyOrderId}?${key}`}
          prefetch="intent"
        >
          <Text color="subtle" className="ml-3">
            View Details
          </Text>
        </Link>
      </div>
    </li>
  );
}
