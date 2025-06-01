import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/shopify";
import { gql } from "graphql-request";

type Props = {
  params: Promise<{
    cartId: string;
  }>;
};

export async function GET(request: NextRequest, context: Props) {
  const { cartId } = await context.params;

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
