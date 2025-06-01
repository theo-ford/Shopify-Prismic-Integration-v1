"use client";
// src/app/products/page.tsx

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";

interface ProductVariant {
  id: string;
  price: {
    amount: string;
    currencyCode: string;
  };
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
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  // Add other fields as needed
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addProduct } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

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

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product: Product) => (
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
                onClick={() => {
                  setAddingToCart(product.variants.edges[0].node.id);
                  addProduct(product.variants.edges[0].node.id, 1).finally(
                    () => {
                      setAddingToCart(null);
                    }
                  );
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {addingToCart === product.variants.edges[0].node.id
                  ? "Adding..."
                  : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
