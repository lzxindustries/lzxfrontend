import {useLoaderData} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';
import {type SeoConfig, getSeoMeta} from '@shopify/hydrogen';

import {CategoryListing} from '~/components/CategoryListing';
import {systemsCategoryConfig} from '~/data/category-configs/systems.config';
import {createCategoryListingLoader} from '~/lib/category-listing/loader';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export const loader = createCategoryListingLoader(systemsCategoryConfig);

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta(data!.seo as SeoConfig);
};

export default function SystemsPage() {
  const data = useLoaderData<typeof loader>();
  return <CategoryListing data={data} />;
}
