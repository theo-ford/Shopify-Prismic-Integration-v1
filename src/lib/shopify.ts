// src/lib/shopify.ts
import { GraphQLClient, gql } from "graphql-request";

const client = new GraphQLClient(
  `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
  {
    headers: {
      "X-Shopify-Storefront-Access-Token":
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN!
    }
  }
);

export { client, gql };
export const getProducts = async () => {
  const query = gql`
    query {
      products(first: 100) {
        edges {
          node {
            id
            title
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await client.request(query);
  return data.products.edges.map((edge) => edge.node);
};

// src/lib/shopify.ts
// src/lib/shopify.ts
export const createCart = async (variantId: string, quantity: number = 1) => {
  const existingCartId = localStorage.getItem("shopifyCartId");

  console.log("Existing cart ID from localStorage:", existingCartId);
  console.log("Existing cart ID type:", typeof existingCartId);

  if (existingCartId) {
    // If cart exists, update it with the new product
    const query = gql`
      mutation {
        cartLinesAdd(cartId: "${existingCartId}", lines: [{merchandiseId: "${variantId}", quantity: ${quantity}}]) {
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  merchandise {
                    ... on ProductVariant {
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                      }
                    }
                  }
                  quantity
                }
              }
            }
          }
        }
      }
    `;
    const result = await client.request(query);
    console.log("Add to cart result:", JSON.stringify(result, null, 2));
    return { cart: result.cartLinesAdd.cart };
  } else {
    // If no cart exists, create a new one
    const query = gql`
      mutation {
        cartCreate(input: {
          lines: [{merchandiseId: "${variantId}", quantity: ${quantity}}]
        }) {
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  merchandise {
                    ... on ProductVariant {
                      title
                      price {
                        amount
                        currencyCode
                      }
                      product {
                        title
                      }
                    }
                  }
                  quantity
                }
              }
            }
          }
        }
      }
    `;
    const result = await client.request(query);
    console.log("Create cart result:", JSON.stringify(result, null, 2));
    return { cart: result.cartCreate.cart };
  }
};

export const updateCheckout = async (
  checkoutId: string,
  variantId: string,
  quantity: number
) => {
  const query = gql`
    mutation {
      checkoutLineItemsReplace(
        checkoutId: "gid://shopify/Checkout/${checkoutId}"
        lineItems: [{variantId: "gid://shopify/ProductVariant/${variantId}", quantity: ${quantity}}]
      ) {
        checkout {
          id
          webUrl
        }
      }
    }
  `;
  const data = await client.request(query);
  return data.checkoutLineItemsReplace;
};

// src/lib/shopify.ts
export const updateCart = async (
  cartId: string,
  lineId: string,
  quantity: number
) => {
  const cleanCartId = cartId.replace("gid://shopify/Cart/", "");
  const query = gql`
    mutation {
      cartLinesUpdate(cartId: "gid://shopify/Cart/${cleanCartId}", lines: [{id: "${lineId}", quantity: ${quantity}}]) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                merchandise {
                  ... on ProductVariant {
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                    }
                  }
                }
                quantity
              }
            }
          }
        }
      }
    }
  `;

  const data = await client.request(query);
  return data.cartLinesUpdate;
};

export const removeLine = async (cartId: string, lineId: string) => {
  const cleanCartId = cartId.replace("gid://shopify/Cart/", "");
  const query = gql`
    mutation {
      cartLinesRemove(cartId: "gid://shopify/Cart/${cleanCartId}", lineIds: ["${lineId}"]) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                merchandise {
                  ... on ProductVariant {
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                    }
                  }
                }
                quantity
              }
            }
          }
        }
      }
    }
  `;

  const data = await client.request(query);
  return data.cartLinesRemove;
};
