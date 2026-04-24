import {countries} from '~/data/countries';

/**
 * First path segments that are real storefront locale prefixes (e.g. en-de).
 * Anything else under the optional `($lang)` segment must 404 so we do not
 * serve duplicate homepage content at `/random-slug`.
 */
export const VALID_LOCALE_PATH_SEGMENTS = new Set(
  Object.keys(countries)
    .filter((k) => k !== 'default')
    .map((k) => k.replace(/^\//, '').toLowerCase()),
);
