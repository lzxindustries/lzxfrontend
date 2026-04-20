import {redirect} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({params}: LoaderFunctionArgs) {
  const langPrefix = params.lang ? `/${params.lang}` : '';
  return redirect(`${langPrefix}/blog`, 301);
}
