import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import type {Order} from '@shopify/hydrogen/storefront-api-types';
import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  getSerialsByOrderNumbers,
  type SerialView,
} from '~/controllers/get_serials_by_orders';
import {Link} from '~/components/Link';
import {PageHeader, Text} from '~/components/Text';
import {CACHE_NONE} from '~/data/cache';

export const meta: MetaFunction = () => {
  return [{title: 'My Hardware'}];
};

export async function loader({context, params}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (!customerAccessToken) {
    return redirect(
      params.lang ? `/${params.lang}/account/login` : '/account/login',
    );
  }

  const data = await context.storefront.query<{customer: any}>(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        customerAccessToken,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

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
  const orderNumbers = orders
    .map((o) => o.orderNumber)
    .filter((n): n is number => typeof n === 'number');

  const serials = await getSerialsByOrderNumbers(context, orderNumbers);

  return json({serials}, {headers: {'Cache-Control': CACHE_NONE}});
}

export default function MyHardware() {
  const {serials} = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader heading="My Hardware">
        <Link to="/account">
          <Text color="subtle">Return to Account</Text>
        </Link>
      </PageHeader>
      <div className="w-full p-4 md:p-8 lg:p-12">
        {serials.length === 0 ? (
          <div>
            <Text className="mb-1" size="fine" as="p">
              No registered hardware found for your orders.
            </Text>
            <Text className="mb-4" size="fine" color="subtle" as="p">
              Serial numbers are linked to your order numbers. If you believe
              this is an error, please contact support.
            </Text>
          </div>
        ) : (
          <>
            <Text className="mb-6" size="fine" color="subtle">
              {serials.length} registered unit{serials.length !== 1 ? 's' : ''}
            </Text>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-left font-semibold">Module</th>
                    <th className="text-left font-semibold">Serial #</th>
                    <th className="text-left font-semibold">Order #</th>
                  </tr>
                </thead>
                <tbody>
                  {serials.map((serial: SerialView) => (
                    <tr key={`${serial.orderNumber}-${serial.serialNumber}`}>
                      <td>
                        {serial.moduleSlug ? (
                          <Link
                            to={`/modules/${serial.moduleSlug}`}
                            className="underline hover:text-primary"
                          >
                            {serial.moduleName}
                          </Link>
                        ) : (
                          serial.moduleName
                        )}
                      </td>
                      <td>{serial.serialNumber}</td>
                      <td>{serial.orderNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrdersForSerials(
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
          }
        }
      }
    }
  }
`;
