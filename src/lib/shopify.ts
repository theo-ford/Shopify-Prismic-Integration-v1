// src/lib/shopify.ts
import { GraphQLClient, gql } from "graphql-request";

interface CartLine {
  id: string;
  merchandise: {
    __typename: "ProductVariant";
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    product: {
      title: string;
    };
  };
  quantity: number;
}

interface Cart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
}

interface CartResponse {
  cartLinesAdd?: {
    cart: Cart;
  };
  cartCreate?: {
    cart: Cart;
  };
}

interface ProductVariant {
  id: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
}

interface ProductImage {
  originalSrc: string;
  altText: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: ProductImage;
    }>;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
}

interface ProductsResponse {
  products: {
    edges: Array<{
      node: Product;
    }>;
  };
}

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
export const getProducts = async (): Promise<Product[]> => {
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

  const data = await client.request<ProductsResponse>(query);
  return data.products.edges.map((edge) => edge.node);
};

export const createCart = async (variantId: string, quantity: number = 1) => {
  const existingCartId = localStorage.getItem("shopifyCartId");

  console.log("Existing cart ID from localStorage:", existingCartId);
  console.log("Existing cart ID type:", typeof existingCartId);

  if (existingCartId) {
    // If cart exists, update it with the new product
    const query = gql`
      mutation {
        cartLinesAdd(
          cartId: "${existingCartId}",
          lines: [{merchandiseId: "${variantId}", quantity: ${quantity}}]
        ) {
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
    const result = await client.request<CartResponse>(query);
    if (result.cartCreate?.cart) {
      return { cart: result.cartCreate.cart };
    }
    throw new Error("Failed to add product to existing cart");
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
    const result = await client.request<CartResponse>(query);
    if (result.cartCreate?.cart) {
      localStorage.setItem("shopifyCartId", result.cartCreate.cart.id);
      return { cart: result.cartCreate.cart };
    }
    throw new Error("Failed to create new cart");
  }
};

interface CheckoutLineItemsReplaceResponse {
  checkoutLineItemsReplace: {
    checkout: {
      id: string;
      webUrl: string;
    };
  };
}

export const updateCheckout = async (
  checkoutId: string,
  variantId: string,
  quantity: number
): Promise<{ checkout: { id: string; webUrl: string } }> => {
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
  const data = await client.request<CheckoutLineItemsReplaceResponse>(query);
  return { checkout: data.checkoutLineItemsReplace.checkout };
};

interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: Cart;
  };
}

export const updateCart = async (
  cartId: string,
  lineId: string | null,
  variantId: string,
  quantity: number
): Promise<{ cart: Cart }> => {
  if (lineId) {
    const mutationQuery = gql`
      mutation {
        cartLinesUpdate(
          cartId: "${cartId}",
          lines: [{
            id: "${lineId}",
            quantity: ${quantity}
          }]
        ) {
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

    const data = await client.request<CartLinesUpdateResponse>(mutationQuery);
    if (data.cartLinesUpdate?.cart) {
      return { cart: data.cartLinesUpdate.cart };
    }
    throw new Error("Failed to update cart line");
  }

  // If no lineId, we're adding a new line
  const mutationQuery = gql`
    mutation {
      cartLinesAdd(
        cartId: "${cartId}",
        lines: [{
          merchandiseId: "${variantId}",
          quantity: ${quantity}
        }]
      ) {
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

  const data = await client.request<CartResponse>(mutationQuery);
  if (data.cartLinesAdd?.cart) {
    return { cart: data.cartLinesAdd.cart };
  }
  throw new Error("Failed to add cart line");
};

interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: Cart;
  };
}

export const removeLine = async (
  cartId: string,
  variantId: string,
  lineId: string
) => {
  const query = gql`
    mutation {
      cartLinesRemove(cartId: "${cartId}", lineIds: ["${lineId}"]) {
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

  const data = await client.request<CartLinesRemoveResponse>(query);
  return data.cartLinesRemove.cart;
};
