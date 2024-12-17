import {json} from '@shopify/remix-oxygen';
import {CACHE_LONG} from '~/data/cache';
import {countries} from '~/data/countries';

export async function loader() {
  return json(
    {
      ...countries,
    },
    {
      headers: {
        'Cache-Control': CACHE_LONG,
        'Oxygen-Cache-Control': 'public, max-age=3600, stale-while-revalidate=600'
      },
    },
  );
}

// no-op
export default function CountriesApiRoute() {
  return null;
}
