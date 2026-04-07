import {
  redirect,
  type ActionFunction,
  type ActionFunctionArgs,
  type AppLoadContext,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';

export async function doLogout(context: AppLoadContext, redirectPath?: string) {
  const {session} = context;
  session.unset('customerAccessToken');
  session.flash('sessionExpired', true); // Flash message for expired session

  return redirect(redirectPath || `${context.storefront.i18n.pathPrefix}/account/login`, {
    headers: {
      'Set-Cookie': await session.commit(),
    },
  });
}

export async function loader({context}: LoaderFunctionArgs) {
  return redirect(context.storefront.i18n.pathPrefix);
}

export const action: ActionFunction = async ({context}: ActionFunctionArgs) => {
  return doLogout(context);
};
