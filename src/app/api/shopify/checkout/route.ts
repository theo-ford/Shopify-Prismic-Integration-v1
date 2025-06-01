// src/app/api/shopify/checkout/route.ts
import { NextResponse } from "next/server";
import { createCart } from "@/lib/shopify";

export async function POST(request: Request) {
  try {
    const { variantId, quantity = 1 } = await request.json();

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    console.log("Creating cart for variant:", variantId);

    const result = await createCart(variantId, quantity);
    console.log("Cart creation result:", JSON.stringify(result, null, 2));

    if (result.cartUserErrors && result.cartUserErrors.length > 0) {
      return NextResponse.json(
        {
          error: result.cartUserErrors[0].message,
          details: result.cartUserErrors[0].field
        },
        { status: 400 }
      );
    }

    if (!result.cart) {
      return NextResponse.json(
        {
          error: "No cart data returned",
          result
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      cart: result.cart,
      success: true
    });
  } catch (error) {
    console.error("Cart creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create cart",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
