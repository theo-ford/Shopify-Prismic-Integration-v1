"use client";

// src/app/products/page.tsx
import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addProduct } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/shopify/products");
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  // src/app/products/page.tsx
  // src/app/products/page.tsx
  // src/app/products/page.tsx
  const handleAddToCart = async (variantId: string) => {
    try {
      console.log("Attempting to add variant:", variantId);

      const response = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ variantId })
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Full cart response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || `Cart creation failed with status ${response.status}`
        );
      }

      if (data.cart?.checkoutUrl) {
        window.location.href = data.cart.checkoutUrl;
      } else {
        throw new Error("Invalid cart response format");
      }
    } catch (error) {
      console.error("Detailed error:", error);
      alert(
        `Failed to add to cart: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product: any) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* {product.images.edges[0]?.node && (
              <img
                src={product.images.edges[0].node.originalSrc}
                alt={product.images.edges[0].node.altText || product.title}
                className="w-full h-48 object-cover"
              />
            )} */}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold mb-4">
                ${product.priceRange.minVariantPrice.amount}
              </p>
              <button
                onClick={() => addProduct(product.variants.edges[0].node.id, 1)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
