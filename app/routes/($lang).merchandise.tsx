import {useLoaderData} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';

import {CategoryListing} from '~/components/CategoryListing';
import {merchandiseCategoryConfig} from '~/data/category-configs/merchandise.config';
import {createCategoryListingLoader} from '~/lib/category-listing/loader';
import {routeHeaders} from '~/data/cache';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

export const headers = routeHeaders;

export const loader = createCategoryListingLoader(merchandiseCategoryConfig);

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

export default function MerchandisePage() {
  const data = useLoaderData<typeof loader>();
  return <CategoryListing data={data} />;
}
