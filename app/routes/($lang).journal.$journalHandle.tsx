import {redirect} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

export async function loader({params}: LoaderFunctionArgs) {
  invariant(params.journalHandle, 'Missing journal handle');
  const langPrefix = params.lang ? `/${params.lang}` : '';
  return redirect(`${langPrefix}/blog/${params.journalHandle}`, 301);
}
