import {redirect} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {SITE_DECISIONS} from '~/config/site-decisions';

export async function loader({params}: LoaderFunctionArgs) {
  const langPrefix = params.lang ? `/${params.lang}` : '';
  return redirect(
    `${langPrefix}/collections/${SITE_DECISIONS.collections.accessories}`,
    302,
  );
}
