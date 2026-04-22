export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    subtitle: metafield(namespace: "descriptors", key: "subtitle") {
      value
    }
    publishedAt
    handle
    availableForSale
    variants(first: 100) {
      nodes {
        id
        availableForSale
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
        compareAtPrice {
          amount
          currencyCode
        }
        quantityAvailable
        selectedOptions {
          name
          value
        }
        product {
          handle
          title
        }
      }
    }
  }
`;
