// src/app/api/shopify/cart/[cartId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/shopify";
import { gql } from "graphql-request";

export async function GET(
  request: NextRequest,
  { params }: { params: { cartId: string } }
): Promise<NextResponse> {
  const { cartId } = params;

  const query = gql`
    query {
      cart(id: "gid://shopify/Cart/${cartId}") {
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

  try {
    const data = await client.request(query);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch cart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart data" },
      { status: 500 }
    );
  }
}
