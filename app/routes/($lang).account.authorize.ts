import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

/**
 * The /account/authorize route is expected by Shopify's Customer Account API
 * (CAAPI) OAuth flow. This project uses the classic Storefront API with
 * email/password login, so authorise requests simply redirect to login.
 */
export async function loader({params}: LoaderFunctionArgs) {
  return redirect(
    params.lang ? `/${params.lang}/account/login` : '/account/login',
  );
}
