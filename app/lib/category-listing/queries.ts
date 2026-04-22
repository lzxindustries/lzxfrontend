/**
 * Shared GraphQL queries used by every product category overview page
 * (modules, instruments, cases-and-power, legacy, systems).
 *
 * Two fetch paths:
 *  - by-IDs (preferred): looks up products by stored Shopify GID, immune to
 *    canonical-slug / handle drift.
 *  - by-handles (fallback): looks up by handle for entries that lack a
 *    stored GID.
 */

export const CATEGORY_LISTING_FRAGMENT = `#graphql
  fragment CategoryListingProductFields on Product {
    id
    title
    handle
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    variants(first: 1) {
      nodes {
        id
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

export const CATEGORY_LISTING_BY_IDS_QUERY = `#graphql
  ${CATEGORY_LISTING_FRAGMENT}
  query CategoryListingByIds(
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...CategoryListingProductFields
      }
    }
  }
`;

export const CATEGORY_LISTING_BY_HANDLES_QUERY = `#graphql
  ${CATEGORY_LISTING_FRAGMENT}
  query CategoryListingByHandles(
    $first: Int!
    $query: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        ...CategoryListingProductFields
      }
    }
  }
`;

export const MAX_PRODUCTS_PER_QUERY = 250;

export function buildHandleFilterQuery(handles: string[]): string {
  return handles.map((handle) => `handle:${handle}`).join(' OR ');
}
