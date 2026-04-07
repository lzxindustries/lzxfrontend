import {Form, useActionData, type MetaFunction} from '@remix-run/react';
import type {CustomerCreatePayload} from '@shopify/hydrogen/storefront-api-types';
import {
  redirect,
  json,
  type ActionFunction,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useState} from 'react';
import {doLogin} from './($lang).account.login';
import {Link} from '~/components/Link';
import {getInputStyleClasses} from '~/lib/utils';

export async function loader({context, params}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }

  return new Response(null);
}

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context, params}) => {
  const {session, storefront} = context;
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide both an email and a password.',
    });
  }

  try {
    const data = await storefront.mutate<{
      customerCreate: CustomerCreatePayload;
    }>(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {email, password},
      },
    });

    if (!data?.customerCreate?.customer?.id) {
      const errors = data?.customerCreate?.customerUserErrors ?? [];
      const hasTaken = errors.some(
        (e: any) => e.code === 'TAKEN' || e.code === 'CUSTOMER_DISABLED',
      );
      const hasTooShort = errors.some(
        (e: any) => e.code === 'TOO_SHORT',
      );

      if (hasTaken) {
        throw new Error(
          'An account with this email already exists. Please log in instead.',
        );
      }
      if (hasTooShort) {
        throw new Error('Password is too short. Please use at least 5 characters.');
      }
      throw new Error(
        errors.map((e: any) => e.message).join(', ') ||
          'Could not create account. Please try again.',
      );
    }

    const customerAccessToken = await doLogin(context, {email, password});
    session.set('customerAccessToken', customerAccessToken);

    return redirect(params.lang ? `${params.lang}/account` : '/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: any) {
    if (error.errors || error.extensions) {
      return badRequest({
        formError: 'Something went wrong. Please try again later.',
      });
    }

    return badRequest({
      formError: error.message || 'Sorry, we could not create your account. Please try again.',
    });
  }
};

export const meta: MetaFunction = () => {
  return [{title: 'Register'}];
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);

  function getPasswordStrength(password: string): string | null {
    if (!password) return null;
    if (password.length < 8) return 'Too short';
    if (password.length < 12) return 'Fair';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'Strong';
    return 'Good';
  }

  const strengthColor = passwordStrength === 'Strong' ? 'text-green-500' :
    passwordStrength === 'Good' ? 'text-yellow-500' :
    passwordStrength === 'Fair' ? 'text-orange-500' :
    'text-red-500';

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl">Create an Account.</h1>
        <p className="mt-2 text-sm text-primary/60">
          Get order tracking, save your addresses, and access exclusive updates on new releases.
        </p>
        <Form
          method="post"
          noValidate
          className="pt-6 pb-8 mt-4 mb-4 space-y-3"
        >
          {actionData?.formError && (
            <div className="flex flex-col items-center justify-center mb-6 rounded bg-red-500/10 border border-red-500/20">
              <p className="m-4 mb-2 text-s text-red-400">{actionData.formError}</p>
              {actionData.formError.includes('already exists') && (
                <a href="/account/login" className="mb-3 text-sm underline text-primary/60 hover:text-primary">
                  Go to login
                </a>
              )}
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                setNativeEmailError(
                  event.currentTarget.value.length &&
                    !event.currentTarget.validity.valid
                    ? 'Invalid email address'
                    : null,
                );
              }}
            />
            {nativeEmailError && (
              <p className="text-red-500 text-xs">{nativeEmailError} &nbsp;</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative">
              <input
                className={`mb-1 pr-12 ${getInputStyleClasses(nativePasswordError)}`}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Password"
                aria-label="Password"
                minLength={8}
                required
                onChange={(event) => {
                  setPasswordStrength(getPasswordStrength(event.currentTarget.value));
                }}
                onBlur={(event) => {
                  if (
                    event.currentTarget.validity.valid ||
                    !event.currentTarget.value.length
                  ) {
                    setNativePasswordError(null);
                  } else {
                    setNativePasswordError(
                      event.currentTarget.validity.valueMissing
                        ? 'Please enter a password'
                        : 'Passwords must be at least 8 characters',
                    );
                  }
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary/50 hover:text-primary"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordStrength && (
              <p className={`text-xs ${strengthColor}`}>
                Password strength: {passwordStrength}
              </p>
            )}
            {nativePasswordError && (
              <p className="text-red-500 text-xs">
                {' '}
                {nativePasswordError} &nbsp;
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-primary text-contrast rounded py-2 px-4 focus:shadow-outline block w-full"
              type="submit"
              disabled={!!(nativePasswordError || nativeEmailError)}
            >
              Create Account
            </button>
          </div>
          <div className="flex items-center mt-8 border-t border-gray-300">
            <p className="align-baseline text-sm mt-6">
              Already have an account? &nbsp;
              <Link className="inline underline" to="/account/login">
                Sign in
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
