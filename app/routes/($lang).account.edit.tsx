import {
  useActionData,
  Form,
  useOutletContext,
  useNavigation,
} from '@remix-run/react';
import type {
  Customer,
  CustomerUpdateInput,
  CustomerUpdatePayload,
} from '@shopify/hydrogen/storefront-api-types';
import {json, redirect, type ActionFunction} from '@shopify/remix-oxygen';
import clsx from 'clsx';
import {useState} from 'react';
import {FaEye, FaEyeSlash, FaExclamationTriangle} from 'react-icons/fa';
import invariant from 'tiny-invariant';
import {getCustomer} from './($lang).account';
import {Button} from '~/components/Button';
import {Text} from '~/components/Text';
import {getInputStyleClasses, assertApiErrors} from '~/lib/utils';

export interface AccountOutletContext {
  customer: Customer;
}

export interface ActionData {
  success?: boolean;
  formError?: string;
  fieldErrors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    newPassword2?: string;
  };
}

const badRequest = (data: ActionData) => json(data, {status: 400});

const formDataHas = (formData: FormData, key: string) => {
  if (!formData.has(key)) return false;

  const value = formData.get(key);
  return typeof value === 'string' && value.length > 0;
};

export const handle = {
  renderInModal: true,
};

export const action: ActionFunction = async ({request, context, params}) => {
  const formData = await request.formData();

  const customerAccessToken = await context.session.get('customerAccessToken');

  invariant(
    customerAccessToken,
    'You must be logged in to update your account details.',
  );

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  await getCustomer(context, customerAccessToken);

  if (
    formDataHas(formData, 'newPassword') &&
    !formDataHas(formData, 'currentPassword')
  ) {
    return badRequest({
      fieldErrors: {
        currentPassword:
          'Please enter your current password before entering a new password.',
      },
    });
  }

  if (
    formData.has('newPassword') &&
    formData.get('newPassword') !== formData.get('newPassword2')
  ) {
    return badRequest({
      fieldErrors: {
        newPassword2: 'New passwords must match.',
      },
    });
  }

  try {
    const customer: CustomerUpdateInput = {};

    formDataHas(formData, 'firstName') &&
      (customer.firstName = formData.get('firstName') as string);
    formDataHas(formData, 'lastName') &&
      (customer.lastName = formData.get('lastName') as string);
    formDataHas(formData, 'email') &&
      (customer.email = formData.get('email') as string);
    formDataHas(formData, 'phone') &&
      (customer.phone = formData.get('phone') as string);
    formDataHas(formData, 'newPassword') &&
      (customer.password = formData.get('newPassword') as string);

    const data = await context.storefront.mutate<{
      customerUpdate: CustomerUpdatePayload;
    }>(CUSTOMER_UPDATE_MUTATION, {
      variables: {
        customerAccessToken,
        customer,
      },
    });

    assertApiErrors(data.customerUpdate);

    return redirect(
      params?.lang
        ? `${params.lang}/account?updated=true`
        : '/account?updated=true',
    );
  } catch (error: any) {
    return badRequest({formError: error.message});
  }
};

/**
 * Since this component is nested in `accounts/`, it is rendered in a modal via `<Outlet>` in `account.tsx`.
 *
 * This allows us to:
 * - preserve URL state (`/accounts/edit` when the modal is open)
 * - co-locate the edit action with the edit form (rather than grouped in account.tsx)
 * - use the `useOutletContext` hook to access the customer data from the parent route (no additional data loading)
 * - return a simple `redirect()` from this action to close the modal :mindblown: (no useState/useEffect)
 * - use the presence of outlet data (in `account.tsx`) to open/close the modal (no useState)
 */
export default function AccountDetailsEdit() {
  const actionData = useActionData<ActionData>();
  const {customer} = useOutletContext<AccountOutletContext>();
  const {state} = useNavigation();
  const [emailValue, setEmailValue] = useState(customer.email ?? '');
  const emailChanged =
    emailValue !== '' && emailValue !== (customer.email ?? '');

  return (
    <>
      <Text className="mt-4 mb-6" as="h3" size="lead">
        Update your profile
      </Text>
      <Form method="post">
        {actionData?.formError && (
          <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
            <p className="m-4 text-sm text-red-900">{actionData.formError}</p>
          </div>
        )}
        <div className="mt-3">
          <label htmlFor="firstName" className="text-sm text-primary/50 mb-1 block">
            First name
          </label>
          <input
            className={getInputStyleClasses()}
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            defaultValue={customer.firstName ?? ''}
          />
        </div>
        <div className="mt-3">
          <label htmlFor="lastName" className="text-sm text-primary/50 mb-1 block">
            Last name
          </label>
          <input
            className={getInputStyleClasses()}
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            defaultValue={customer.lastName ?? ''}
          />
        </div>
        <div className="mt-3">
          <label htmlFor="phone" className="text-sm text-primary/50 mb-1 block">
            Phone
          </label>
          <input
            className={getInputStyleClasses()}
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Mobile"
            aria-label="Mobile"
            defaultValue={customer.phone ?? ''}
          />
        </div>
        <div className="mt-3">
          <label htmlFor="email" className="text-sm text-primary/50 mb-1 block">
            Email address
          </label>
          <input
            className={getInputStyleClasses(actionData?.fieldErrors?.email)}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            aria-label="Email address"
            defaultValue={customer.email ?? ''}
            onChange={(e) => setEmailValue(e.target.value)}
          />
          {emailChanged && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
              <FaExclamationTriangle className="shrink-0" />
              <span>Changing your email will update your login credentials.</span>
            </div>
          )}
          {actionData?.fieldErrors?.email && (
            <p className="text-red-500 text-xs mt-1">
              {actionData.fieldErrors.email}
            </p>
          )}
        </div>
        <Text className="mb-6 mt-6" as="h3" size="lead">
          Change your password
        </Text>
        <Password
          name="currentPassword"
          label="Current password"
          passwordError={actionData?.fieldErrors?.currentPassword}
        />
        {actionData?.fieldErrors?.currentPassword && (
          <Text size="fine" className="mt-1 text-red-500">
            {actionData.fieldErrors.currentPassword}
          </Text>
        )}
        <Password
          name="newPassword"
          label="New password"
          passwordError={actionData?.fieldErrors?.newPassword}
        />
        <Password
          name="newPassword2"
          label="Re-enter new password"
          passwordError={actionData?.fieldErrors?.newPassword2}
        />
        <Text
          size="fine"
          color="subtle"
          className={clsx(
            'mt-1',
            actionData?.fieldErrors?.newPassword && 'text-red-500',
          )}
        >
          Passwords must be at least 8 characters.
        </Text>
        {actionData?.fieldErrors?.newPassword2 && (
          <Text size="fine" className="mt-1 text-red-500">
            {actionData.fieldErrors.newPassword2}
          </Text>
        )}
        <div className="mt-6">
          <Button
            className="text-sm mb-2"
            variant="primary"
            width="full"
            type="submit"
            disabled={state !== 'idle'}
          >
            {state !== 'idle' ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <div className="mb-4">
          <Button to=".." className="text-sm" variant="secondary" width="full">
            Cancel
          </Button>
        </div>
      </Form>
    </>
  );
}

function Password({
  name,
  passwordError,
  label,
}: {
  name: string;
  passwordError?: string;
  label: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-3">
      <label htmlFor={name} className="text-sm text-primary/50 mb-1 block">
        {label}
      </label>
      <div className="relative">
        <input
          className={getInputStyleClasses(passwordError)}
          id={name}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={
            name === 'currentPassword' ? 'current-password' : undefined
          }
          placeholder={label}
          aria-label={label}
          minLength={8}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
      </div>
    </div>
  );
}

const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;
