import {
  useLoaderData,
  useFetcher,
  type MetaFunction,
} from '@remix-run/react';
import {Image, Money, flattenConnection} from '@shopify/hydrogen';
import type {
  DiscountApplicationConnection,
  Order,
  OrderLineItem,
} from '@shopify/hydrogen/storefront-api-types';
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import clsx from 'clsx';
import {useState} from 'react';
import invariant from 'tiny-invariant';
import {Link} from '~/components/Link';
import {Heading, PageHeader, Text} from '~/components/Text';
import {
  isOrderAddressEditable,
  updateOrderShippingAddress,
  type ShippingAddressInput,
} from '~/lib/admin.server';
import {statusMessage, financialStatusMessage, getInputStyleClasses} from '~/lib/utils';
import {CartAction} from '~/lib/type';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({request, context, params}: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect(params?.lang ? `${params.lang}/account` : '/account');
  }

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get('key');

  invariant(orderToken, 'Order token is required');

  const customerAccessToken = await context.session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect(
      params.lang ? `${params.lang}/account/login` : '/account/login',
    );
  }

  const orderId = `gid://shopify/Order/${params.id}?key=${orderToken}`;

  const data = await context.storefront.query<{node: Order}>(
    CUSTOMER_ORDER_QUERY,
    {variables: {orderId}},
  );

  const order = data?.node;

  if (!order) {
    throw new Response('Order not found', {status: 404});
  }

  const lineItems = flattenConnection(order.lineItems!) as Array<OrderLineItem>;

  const discountApplications = flattenConnection(
    order.discountApplications as DiscountApplicationConnection,
  );

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  // Check if the shipping address can be edited via Admin API
  const adminOrderId = `gid://shopify/Order/${params.id}`;
  const canEditAddress = await isOrderAddressEditable(adminOrderId, context.env);

  return json({
    order,
    lineItems,
    discountValue,
    discountPercentage,
    canEditAddress,
  });
}

export async function action({request, context, params}: ActionFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (!customerAccessToken) {
    return json({formError: 'You must be logged in.'}, {status: 401});
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent !== 'updateShippingAddress') {
    return json({formError: 'Invalid action.'}, {status: 400});
  }

  const orderId = formData.get('orderId');
  invariant(typeof orderId === 'string', 'Order ID is required');

  // Re-verify editability server-side
  const adminOrderId = `gid://shopify/Order/${orderId}`;
  const canEdit = await isOrderAddressEditable(adminOrderId, context.env);
  if (!canEdit) {
    return json(
      {formError: 'This order can no longer be edited. A shipping label may have already been purchased.'},
      {status: 400},
    );
  }

  const shippingAddress: ShippingAddressInput = {};
  const keys: (keyof ShippingAddressInput)[] = [
    'firstName',
    'lastName',
    'address1',
    'address2',
    'city',
    'province',
    'country',
    'zip',
    'phone',
    'company',
  ];

  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') {
      shippingAddress[key] = value;
    }
  }

  const result = await updateOrderShippingAddress(
    adminOrderId,
    shippingAddress,
    context.env,
  );

  if (!result.success) {
    return json({formError: result.error}, {status: 400});
  }

  return json({success: true});
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage, canEditAddress} =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const addressFetcher = useFetcher();
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const reorderLines = lineItems
    .filter((item) => item.variant?.id)
    .map((item) => ({
      merchandiseId: item.variant!.id,
      quantity: item.quantity,
    }));

  return (
    <div>
      <PageHeader heading="Order detail">
        <Link to="/account">
          <Text color="subtle">Return to Account Overview</Text>
        </Link>
      </PageHeader>
      <div className="w-full p-6 sm:grid-cols-1 md:p-8 lg:p-12 lg:py-6">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Text as="h3" size="lead">
                Order No. {order.name}
              </Text>
              <Text className="mt-2" as="p">
                Placed on {new Date(order.processedAt!).toDateString()}
              </Text>
            </div>
            {reorderLines.length > 0 && (
              <fetcher.Form method="post" action="/cart">
                <input
                  type="hidden"
                  name="cartAction"
                  value={CartAction.ADD_TO_CART}
                />
                <input
                  type="hidden"
                  name="lines"
                  value={JSON.stringify(reorderLines)}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={fetcher.state !== 'idle'}
                >
                  {fetcher.state !== 'idle' ? 'Adding...' : 'Reorder'}
                </button>
              </fetcher.Form>
            )}
          </div>
          <div className="grid items-start gap-12 sm:grid-cols-1 md:grid-cols-4 md:gap-16 sm:divide-y sm:divide-gray-200">
            <table className="min-w-full my-8 divide-y divide-gray-300 md:col-span-3">
              <thead>
                <tr className="align-baseline ">
                  <th
                    scope="col"
                    className="pb-4 pl-0 pr-3 font-semibold text-left"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 pb-4 font-semibold text-right sm:table-cell md:table-cell"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 pb-4 font-semibold text-right sm:table-cell md:table-cell"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-4 pb-4 font-semibold text-right"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* @ts-ignore */}
                {lineItems.map((lineItem: OrderLineItem) => (
                  <tr key={lineItem.variant!.id}>
                    <td className="w-full py-4 pl-0 pr-3 align-top sm:align-middle max-w-0 sm:w-auto sm:max-w-none">
                      <div className="flex gap-6">
                        <Link
                          to={`/products/${lineItem.variant!.product!.handle}`}
                        >
                          {lineItem?.variant?.image && (
                            <div className="w-24 card-image aspect-square">
                              <Image
                                data={lineItem.variant.image}
                                width={96}
                                height={96}
                              />
                            </div>
                          )}
                        </Link>
                        <div className="flex-col justify-center hidden lg:flex">
                          <Text as="p">{lineItem.title}</Text>
                          <Text size="fine" className="mt-1" as="p">
                            {lineItem.variant!.title}
                          </Text>
                        </div>
                        <dl className="grid">
                          <dt className="sr-only">Product</dt>
                          <dd className="truncate lg:hidden">
                            <Heading size="copy" format as="h3">
                              {lineItem.title}
                            </Heading>
                            <Text size="fine" className="mt-1">
                              {lineItem.variant!.title}
                            </Text>
                          </dd>
                          <dt className="sr-only">Price</dt>
                          <dd className="truncate sm:hidden">
                            <Text size="fine" className="mt-4">
                              <Money data={lineItem.variant!.price!} />
                            </Text>
                          </dd>
                          <dt className="sr-only">Quantity</dt>
                          <dd className="truncate sm:hidden">
                            <Text className="mt-1" size="fine">
                              Qty: {lineItem.quantity}
                            </Text>
                          </dd>
                        </dl>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                      <Money data={lineItem.variant!.price!} />
                    </td>
                    <td className="hidden px-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                      {lineItem.quantity}
                    </td>
                    <td className="px-3 py-4 text-right align-top sm:align-middle sm:table-cell">
                      <Text>
                        <Money data={lineItem.discountedTotalPrice!} />
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {((discountValue && discountValue.amount) ||
                  discountPercentage) && (
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-6 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                    >
                      <Text>Discounts</Text>
                    </th>
                    <th
                      scope="row"
                      className="pt-6 pr-3 font-normal text-left sm:hidden"
                    >
                      <Text>Discounts</Text>
                    </th>
                    <td className="pt-6 pl-3 pr-4 font-medium text-right text-green-700 md:pr-3">
                      {discountPercentage ? (
                        <span className="text-sm">
                          -{discountPercentage}% OFF
                        </span>
                      ) : (
                        discountValue && <Money data={discountValue!} />
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-6 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                  >
                    <Text>Subtotal</Text>
                  </th>
                  <th
                    scope="row"
                    className="pt-6 pr-3 font-normal text-left sm:hidden"
                  >
                    <Text>Subtotal</Text>
                  </th>
                  <td className="pt-6 pl-3 pr-4 text-right md:pr-3">
                    {order.subtotalPrice && <Money data={order.subtotalPrice} />}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-4 pl-6 pr-3 font-normal text-right sm:table-cell md:pl-0"
                  >
                    Tax
                  </th>
                  <th
                    scope="row"
                    className="pt-4 pr-3 font-normal text-left sm:hidden"
                  >
                    <Text>Tax</Text>
                  </th>
                  <td className="pt-4 pl-3 pr-4 text-right md:pr-3">
                    {order.totalTax && <Money data={order.totalTax} />}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-4 pl-6 pr-3 font-semibold text-right sm:table-cell md:pl-0"
                  >
                    Total
                  </th>
                  <th
                    scope="row"
                    className="pt-4 pr-3 font-semibold text-left sm:hidden"
                  >
                    <Text>Total</Text>
                  </th>
                  <td className="pt-4 pl-3 pr-4 font-semibold text-right md:pr-3">
                    {order.totalPrice && <Money data={order.totalPrice} />}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="sticky border-none top-nav md:my-8">
              <Heading size="copy" className="font-semibold" as="h3">
                Shipping Address
              </Heading>
              {order?.shippingAddress ? (
                <ul className="mt-6">
                  <li>
                    <Text>
                      {order.shippingAddress.firstName &&
                        order.shippingAddress.firstName + ' '}
                      {order.shippingAddress.lastName}
                    </Text>
                  </li>
                  {order?.shippingAddress?.formatted ? (
                    order.shippingAddress.formatted.map((line: string) => (
                      <li key={line}>
                        <Text>{line}</Text>
                      </li>
                    ))
                  ) : (
                    <></>
                  )}
                </ul>
              ) : (
                <p className="mt-3">No shipping address defined</p>
              )}
              <Heading size="copy" className="mt-8 font-semibold" as="h3">
                Status
              </Heading>
              <OrderTimeline
                fulfillmentStatus={order.fulfillmentStatus!}
                financialStatus={order.financialStatus}
                processedAt={order.processedAt!}
              />
              {order.successfulFulfillments &&
                order.successfulFulfillments.length > 0 && (
                  <>
                    <Heading
                      size="copy"
                      className="mt-8 font-semibold"
                      as="h3"
                    >
                      Tracking
                    </Heading>
                    <div className="mt-3 space-y-2">
                      {order.successfulFulfillments.map(
                        (fulfillment: any, i: number) => (
                          <div key={i}>
                            {fulfillment.trackingCompany && (
                              <Text size="fine" color="subtle">
                                {fulfillment.trackingCompany}
                              </Text>
                            )}
                            {fulfillment.trackingInfo?.map(
                              (info: any, j: number) => (
                                <div key={j} className="mt-1">
                                  {info.url ? (
                                    <a
                                      href={info.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm underline text-primary/80 hover:text-primary"
                                    >
                                      {info.number || 'Track shipment'}
                                    </a>
                                  ) : (
                                    <Text size="fine">{info.number}</Text>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTimeline({
  fulfillmentStatus,
  financialStatus,
  processedAt,
}: {
  fulfillmentStatus: string;
  financialStatus?: string | null;
  processedAt: string;
}) {
  const steps = [
    {
      label: 'Order Placed',
      detail: new Date(processedAt).toLocaleDateString(),
      done: true,
    },
    {
      label: 'Payment',
      detail: financialStatus
        ? financialStatusMessage(financialStatus)
        : 'Pending',
      done:
        financialStatus === 'PAID' ||
        financialStatus === 'PARTIALLY_PAID' ||
        financialStatus === 'REFUNDED' ||
        financialStatus === 'PARTIALLY_REFUNDED',
    },
    {
      label: 'Shipped',
      detail:
        fulfillmentStatus === 'FULFILLED'
          ? 'Shipped'
          : fulfillmentStatus === 'IN_PROGRESS' ||
              fulfillmentStatus === 'PARTIALLY_FULFILLED'
            ? 'In Progress'
            : 'Awaiting shipment',
      done:
        fulfillmentStatus === 'FULFILLED' ||
        fulfillmentStatus === 'IN_PROGRESS' ||
        fulfillmentStatus === 'PARTIALLY_FULFILLED',
    },
    {
      label: 'Delivered',
      detail: fulfillmentStatus === 'FULFILLED' ? 'Complete' : '',
      done: fulfillmentStatus === 'FULFILLED',
    },
  ];

  return (
    <div className="mt-4">
      <ol className="flex items-center w-full">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={clsx(
              'flex items-center',
              i < steps.length - 1 ? 'w-full' : '',
            )}
          >
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  step.done
                    ? 'bg-green-600 text-white'
                    : 'bg-primary/10 text-primary/40',
                )}
              >
                {step.done ? '✓' : i + 1}
              </div>
              <span className="mt-1 text-[10px] text-center leading-tight text-primary/60">
                {step.label}
              </span>
              {step.detail && (
                <span className="text-[9px] text-primary/40">{step.detail}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  'w-full h-0.5 mx-1',
                  step.done ? 'bg-green-600' : 'bg-primary/10',
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

const CUSTOMER_ORDER_QUERY = `#graphql
  fragment Money on MoneyV2 {
    amount
    currencyCode
  }
  fragment AddressFull on MailingAddress {
    address1
    address2
    city
    company
    country
    countryCodeV2
    firstName
    formatted
    id
    lastName
    name
    phone
    province
    provinceCode
    zip
  }
  fragment DiscountApplication on DiscountApplication {
    value {
      ... on MoneyV2 {
        amount
        currencyCode
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment Image on Image {
    altText
    height
    src: url(transform: {crop: CENTER, maxHeight: 96, maxWidth: 96, scale: 2})
    id
    width
  }
  fragment ProductVariant on ProductVariant {
    id
    image {
      ...Image
    }
    price {
      ...Money
    }
    product {
      handle
    }
    sku
    title
  }
  fragment LineItemFull on OrderLineItem {
    title
    quantity
    discountAllocations {
      allocatedAmount {
        ...Money
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    originalTotalPrice {
      ...Money
    }
    discountedTotalPrice {
      ...Money
    }
    variant {
      ...ProductVariant
    }
  }

  query CustomerOrder(
    $country: CountryCode
    $language: LanguageCode
    $orderId: ID!
  ) @inContext(country: $country, language: $language) {
    node(id: $orderId) {
      ... on Order {
        id
        name
        orderNumber
        processedAt
        fulfillmentStatus
        financialStatus
        totalTax {
          ...Money
        }
        totalPrice {
          ...Money
        }
        subtotalPrice {
          ...Money
        }
        shippingAddress {
          ...AddressFull
        }
        discountApplications(first: 100) {
          nodes {
            ...DiscountApplication
          }
        }
        lineItems(first: 100) {
          nodes {
            ...LineItemFull
          }
        }
        successfulFulfillments(first: 10) {
          trackingCompany
          trackingInfo(first: 5) {
            number
            url
          }
        }
      }
    }
  }
`;
