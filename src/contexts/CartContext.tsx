// src/contexts/CartContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { createCart, updateCart, removeLine, client } from "@/lib/shopify";
import { gql } from "graphql-request";

interface CartLine {
  id: string;
  merchandise: {
    id: string;
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

interface CartContextType {
  cart: {
    id: string | null;
    checkoutUrl: string | null;
    lines: CartLine[];
  };
  addProduct: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeProduct: (lineId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface CartResponse {
  cart: {
    id: string;
    checkoutUrl: string;
    lines: {
      edges: Array<{
        node: {
          id: string;
          merchandise: {
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
        };
      }>;
    };
  };
}

interface CartState {
  id: string | null;
  checkoutUrl: string | null;
  lines: Array<{
    id: string;
    merchandise: {
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
  }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getLocalStorage = () => {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {}
  };
};

const formatCartId = (id: string) => {
  if (id.startsWith("gid://shopify/Cart/")) {
    return id;
  }
  return `gid://shopify/Cart/${id}`;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartState>({
    id: getLocalStorage().getItem("shopifyCartId") || null,
    checkoutUrl: null,
    lines: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart data when cart ID is available
  useEffect(() => {
    console.log(
      "Current cart ID from localStorage:",
      getLocalStorage().getItem("shopifyCartId")
    );
    console.log("Current cart state:", cart);

    const loadCart = async () => {
      if (!cart.id) {
        console.log("No cart ID available");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Loading cart with ID:", cart.id);
        console.log("Cart ID type:", typeof cart.id);
        console.log(
          "Cart ID starts with gid://shopify/Cart/:",
          cart.id.startsWith("gid://shopify/Cart/")
        );
        // Fetch cart data directly from Shopify
        const query = gql`
          query {
            cart(id: "${formatCartId(cart.id)}") {
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
        `;
        console.log("Executing cart query...");
        const data = await client.request<CartResponse>(query);
        console.log("Raw cart query response:", JSON.stringify(data, null, 2));

        if (data.cart) {
          console.log("Successfully loaded cart data");
          console.log("Received cart ID:", data.cart.id);
          setCart({
            id: data.cart.id,
            checkoutUrl: data.cart.checkoutUrl,
            lines: data.cart.lines.edges.map((edge) => ({
              id: edge.node.id,
              merchandise: edge.node.merchandise,
              quantity: edge.node.quantity
            }))
          });
        } else {
          console.error("No cart data returned from query");
          setError("Failed to load cart data");
        }
      } catch (err) {
        console.error("Failed to load cart:", err);
        console.error("Error details:", err instanceof Error ? err.stack : err);
        setError(
          err instanceof Error ? err.message : "Failed to load cart data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [cart.id]);

  const addProduct = async (variantId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Adding product with variant ID:", variantId);
      // Check if we have an existing cart
      if (cart.id) {
        // Update existing cart
        const result = await updateCart(cart.id, null, variantId, quantity);
        if (result.cart) {
          console.log("Successfully created/updated cart:", result.cart);
          getLocalStorage().setItem("shopifyCartId", result.cart.id);
          const cartState: CartState = {
            id: result.cart.id,
            checkoutUrl: result.cart.checkoutUrl || null,
            lines: result.cart.lines.edges.map((edge) => ({
              id: edge.node.id,
              merchandise: edge.node.merchandise,
              quantity: edge.node.quantity
            }))
          };
          setCart(cartState);
        }
      } else {
        // Create new cart
        const result = await createCart(variantId, quantity);
        if (result.cart) {
          console.log("Successfully created/updated cart:", result.cart);
          getLocalStorage().setItem("shopifyCartId", result.cart.id);
          const cartState: CartState = {
            id: result.cart.id,
            checkoutUrl: result.cart.checkoutUrl || null,
            lines: result.cart.lines.edges.map((edge) => ({
              id: edge.node.id,
              merchandise: edge.node.merchandise,
              quantity: edge.node.quantity
            }))
          };
          setCart(cartState);
        }
      }
    } catch (err) {
      console.error("Error in addProduct:", err);
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      if (!cart.id) {
        throw new Error("No cart ID available");
      }

      // Find the line in the cart to get the ProductVariant ID
      const line = cart.lines.find((l) => l.id === lineId);
      if (!line) {
        throw new Error("Line not found in cart");
      }

      // Get the ProductVariant ID from the merchandise
      // @ts-expect-error - Suppressing type error because we know the cart exists at this point
      const variantId = line.merchandise.id;

      console.log("Updating quantity for variant:", variantId, "to", quantity);
      const result = await updateCart(cart.id, lineId, variantId, quantity);

      if (result.cart) {
        console.log("Successfully updated cart:", result.cart);
        // Update cart ID in localStorage if it changes
        getLocalStorage().setItem("shopifyCartId", result.cart.id);
        const cartState: CartState = {
          id: result.cart.id,
          checkoutUrl: result.cart.checkoutUrl || null,
          lines: result.cart.lines.edges.map((edge) => ({
            id: edge.node.id,
            merchandise: {
              // @ts-expect-error - Suppressing type error because we know the cart exists at this point
              id: edge.node.merchandise.id,
              title: edge.node.merchandise.title,
              price: {
                amount: edge.node.merchandise.price.amount,
                currencyCode: edge.node.merchandise.price.currencyCode
              },
              product: {
                title: edge.node.merchandise.product.title
              }
            },
            quantity: edge.node.quantity
          }))
        };
        setCart(cartState);
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update quantity"
      );
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (lineId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!cart.id) {
        throw new Error("No cart ID available");
      }

      // Find the line in the cart to get the ProductVariant ID
      const line = cart.lines.find((l) => l.id === lineId);
      if (!line) {
        throw new Error("Line not found in cart");
      }

      // Get the ProductVariant ID from the merchandise
      // @ts-expect-error - Suppressing type error because we know the cart exists at this point
      const variantId = line.merchandise.id;

      console.log("Removing variant:", variantId);
      const result = await removeLine(cart.id, variantId, lineId);

      if (result) {
        console.log("Successfully removed item from cart:", result);
        getLocalStorage().setItem("shopifyCartId", result.id);
        // Create a new cart object that matches our CartContextType
        const cartState: CartState = {
          id: result.id,
          checkoutUrl: result.checkoutUrl || null,
          lines: result.lines.edges.map((edge) => ({
            id: edge.node.id,
            merchandise: edge.node.merchandise,
            quantity: edge.node.quantity
          }))
        };
        setCart(cartState);
      }
    } catch (err) {
      console.error("Failed to remove product:", err);
      setError(err instanceof Error ? err.message : "Failed to remove product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        // @ts-expect-error - Suppressing type error because we know the cart exists at this point
        cart,
        addProduct,
        updateQuantity,
        removeProduct,
        loading,
        error
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
