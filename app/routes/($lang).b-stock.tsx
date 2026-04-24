import {json, redirect} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, MetaFunction} from '@shopify/remix-oxygen';
import {SITE_DECISIONS} from '~/config/site-decisions';

export const meta: MetaFunction = () => {
  return [
    {title: 'B-Stock | LZX Industries'},
    {
      name: 'description',
      content:
        'Discounted B-Stock modules and instruments from LZX Industries. Cosmetically imperfect units with full functionality and standard warranty coverage.',
    },
  ];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  const handle = SITE_DECISIONS.collections.bStock;

  // Verify the collection exists before redirecting
  const {collection} = await context.storefront.query<{
    collection: {id: string} | null;
  }>(
    `#graphql
      query BStockCheck($handle: String!) {
        collection(handle: $handle) { id }
      }
    `,
    {variables: {handle}},
  );

  if (!collection) {
    // Collection doesn't exist or is unpublished — render a friendly message
    return json({exists: false});
  }

  const langPrefix = params.lang ? `/${params.lang}` : '';
  return redirect(`${langPrefix}/collections/${handle}`, 302);
}

export default function BStockPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 text-center">
      <h1 className="text-3xl font-bold mb-4">B-Stock</h1>
      <p className="text-base-content/70 mb-6">
        No B-Stock items are available right now. Check back later or browse our{' '}
        <a href="/catalog" className="link link-primary">
          full catalog
        </a>
        .
      </p>
    </div>
  );
}
