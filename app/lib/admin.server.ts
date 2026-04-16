interface AdminApiResponse<T> {
  data: T;
  errors?: Array<{message: string; locations?: Array<{line: number; column: number}>}>;
}

export async function adminQuery<T>(
  query: string,
  variables: Record<string, unknown>,
  env: Env,
): Promise<T> {
  const apiVersion = env.PUBLIC_STOREFRONT_API_VERSION || '2024-04';
  const response = await fetch(
    `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/${apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_TOKEN,
      },
      body: JSON.stringify({query, variables}),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Admin API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const json: AdminApiResponse<T> = await response.json();

  if (json.errors?.length) {
    throw new Error(
      `Admin API errors: ${json.errors.map((e) => e.message).join(', ')}`,
    );
  }

  return json.data;
}

interface FulfillmentOrderNode {
  status: string;
  requestStatus: string;
}

interface OrderFulfillmentOrdersResponse {
  order: {
    fulfillmentOrders: {
      nodes: FulfillmentOrderNode[];
    };
  } | null;
}

const ORDER_EDITABLE_QUERY = `
  query OrderEditableCheck($id: ID!) {
    order(id: $id) {
      fulfillmentOrders(first: 10) {
        nodes {
          status
          requestStatus
        }
      }
    }
  }
`;

export async function isOrderAddressEditable(
  adminOrderId: string,
  env: Env,
): Promise<boolean> {
  try {
    const data = await adminQuery<OrderFulfillmentOrdersResponse>(
      ORDER_EDITABLE_QUERY,
      {id: adminOrderId},
      env,
    );

    if (!data.order) return false;

    const fulfillmentOrders = data.order.fulfillmentOrders.nodes;

    // Editable only when all fulfillment orders are still open and unsubmitted
    // (no label purchased, nothing shipped)
    return fulfillmentOrders.every(
      (fo) => fo.status === 'OPEN' && fo.requestStatus === 'UNSUBMITTED',
    );
  } catch {
    // If the Admin API call fails, don't block the page — just disable editing
    return false;
  }
}

interface OrderUpdateResponse {
  orderUpdate: {
    order: {id: string} | null;
    userErrors: Array<{field: string[]; message: string}>;
  };
}

const ORDER_UPDATE_MUTATION = `
  mutation OrderUpdate($input: OrderInput!) {
    orderUpdate(input: $input) {
      order {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface ShippingAddressInput {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  company?: string;
}

export async function updateOrderShippingAddress(
  adminOrderId: string,
  shippingAddress: ShippingAddressInput,
  env: Env,
): Promise<{success: boolean; error?: string}> {
  const data = await adminQuery<OrderUpdateResponse>(
    ORDER_UPDATE_MUTATION,
    {
      input: {
        id: adminOrderId,
        shippingAddress,
      },
    },
    env,
  );

  if (data.orderUpdate.userErrors.length > 0) {
    return {
      success: false,
      error: data.orderUpdate.userErrors
        .map((e) => e.message)
        .join(', '),
    };
  }

  return {success: true};
}
