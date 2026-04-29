import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {
  ProductConnection,
  CollectionConnection,
  PageConnection,
  ArticleConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {isHiddenProductHandle} from '~/data/product-catalog';

export async function loader({request, context}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';

  if (!q || q.length < 2) {
    return json({products: [], collections: [], pages: [], articles: []});
  }

  const {products, collections, pages, articles} =
    await context.storefront.query<{
      products: ProductConnection;
      collections: CollectionConnection;
      pages: PageConnection;
      articles: ArticleConnection;
    }>(PREDICTIVE_SEARCH_QUERY, {
      variables: {
        query: q,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    });

  return json({
    products: products.nodes.filter((p) => !isHiddenProductHandle(p.handle)),
    collections: collections.nodes,
    pages: pages.nodes,
    articles: articles.nodes,
  });
}

const PREDICTIVE_SEARCH_QUERY = `#graphql
  query predictiveSearch(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 6, query: $query, sortKey: RELEVANCE) {
      nodes {
        id
        title
        handle
        featuredImage {
          url
          altText
          width
          height
        }
        variants(first: 1) {
          nodes {
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
    collections(first: 3, query: $query) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
      }
    }
    pages(first: 3, query: $query) {
      nodes {
        id
        title
        handle
      }
    }
    articles(first: 3, query: $query) {
      nodes {
        id
        title
        handle
        blog {
          handle
        }
      }
    }
  }
`;
