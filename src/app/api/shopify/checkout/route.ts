// src/app/api/shopify/checkout/route.ts
import { NextResponse } from "next/server";
import { createCart } from "@/lib/shopify";

// interface CartUserError {
//   message: string;
//   field: string[];
// }

// interface CartResponse {
//   cartUserErrors: CartUserError[];
//   cart?: {
//     id: string;
//     checkoutUrl: string;
//     lines: {
//       edges: Array<{
//         node: {
//           id: string;
//           merchandise: {
//             title: string;
//             price: {
//               amount: string;
//               currencyCode: string;
//             };
//             product: {
//               title: string;
//             };
//           };
//           quantity: number;
//         };
//       }>;
//     };
//   };
// }

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

    if (!result.cart) {
      return NextResponse.json(
        {
          error: "No cart data returned",
          result
        },
        { status: 500 }
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
