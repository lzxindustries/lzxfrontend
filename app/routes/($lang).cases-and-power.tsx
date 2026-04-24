import {useLoaderData} from '@remix-run/react';
import type {MetaArgs} from '@shopify/remix-oxygen';

import {CategoryListing} from '~/components/CategoryListing';
import {
  casesAndPowerCategoryConfig,
  getCasesAndPowerEntries,
} from '~/data/category-configs/cases-and-power.config';
import {createCategoryListingLoader} from '~/lib/category-listing/loader';
import {routeHeaders} from '~/data/cache';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

export {getCasesAndPowerEntries};
export const headers = routeHeaders;

export const loader = createCategoryListingLoader(casesAndPowerCategoryConfig);

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

export default function CasesAndPowerPage() {
  const data = useLoaderData<typeof loader>();
  return <CategoryListing data={data} />;
}
