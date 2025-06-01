// src/app/cart/page.tsx
"use client";
import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, loading, error, updateQuantity, removeProduct } = useCart();

  // Add this function to log cart data
  useEffect(() => {
    console.log("Current cart state:", cart);
    if (cart.lines.length > 0) {
      console.log("First line details:", cart.lines[0]);
    }
  }, [cart]);

  const handleQuantityChange = async (
    lineId: string | undefined,
    quantity: number
  ) => {
    try {
      // Log the line ID before validation
      console.log("Raw line ID received:", lineId);

      // Validate line ID
      if (!lineId || lineId.trim() === "") {
        console.error("Invalid line ID:", lineId);
        alert("Invalid line ID. Please refresh the page and try again.");
        return;
      }

      console.log("Attempting to update quantity for line:", lineId);
      await updateQuantity(lineId, quantity);
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const handleRemove = async (lineId: string | undefined) => {
    try {
      // Log the line ID before validation
      console.log("Raw line ID received:", lineId);

      // Validate line ID
      if (!lineId || lineId.trim() === "") {
        console.error("Invalid line ID:", lineId);
        alert("Invalid line ID. Please refresh the page and try again.");
        return;
      }

      console.log("Attempting to remove line:", lineId);
      await removeProduct(lineId);
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-8">Loading cart...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!cart.id || cart.lines.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link
          href="/products"
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Add a console log to check the cart data structure
  console.log("Cart data:", cart);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      <div className="space-y-4">
        {cart.lines.map((line) => (
          <div
            key={line.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div>
              <h3 className="font-semibold">
                {line.merchandise.product.title}
              </h3>
              <p className="text-gray-600">{line.merchandise.title}</p>
              <p className="text-gray-600">
                ${line.merchandise.price.amount}{" "}
                {line.merchandise.price.currencyCode}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuantityChange(line.id, line.quantity - 1)}
                disabled={line.quantity === 1}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                -
              </button>
              <span>{line.quantity}</span>
              <button
                onClick={() => handleQuantityChange(line.id, line.quantity + 1)}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                +
              </button>
              <button
                onClick={() => handleRemove(line.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <a
          href={cart.checkoutUrl}
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Proceed to Checkout
        </a>
      </div>
    </div>
  );
}
