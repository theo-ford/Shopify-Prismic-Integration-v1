"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function Nav() {
  const { cart } = useCart();
  const itemCount = cart.lines.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <>
      <div className="flex m-[20px]">
        <div className="inline">
          <Link href="/products">Products</Link>
        </div>
        <div className="inline ml-[20px]">
          <p>
            <Link href="/cart">Cart</Link> [{itemCount}]
          </p>
        </div>
      </div>
    </>
  );
}
