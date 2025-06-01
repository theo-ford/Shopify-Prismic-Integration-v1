// import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";

import { components } from "@/slices";
// import { PrismicNextLink } from "@prismicio/next";
// import Link from "next/link";

/**
 * This page renders a Prismic Document dynamically based on the URL.
 */

// export async function generateMetadata({
//   params
// }: {
//   params: Params;
// }): Promise<Metadata> {
//   const client = createClient();
//   const page = await client
//     .getByUID("product", params.uid)
//     .catch(() => notFound());

//   return {
//     title: page.data.meta_title,
//     description: page.data.meta_description
//   };
// }

export default async function Page({
  params
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const client = createClient();
  const page = await client.getByUID("product", uid).catch(() => notFound());

  return (
    <>
      <p>Product</p>
      {page.uid}

      <div className="">
        <SliceZone slices={page.data.slices} components={components} />
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const client = createClient();

  /**
   * Query all Documents from the API, except the homepage.
   */
  const pages = await client.getAllByType("product", {
    predicates: [prismic.filter.not("my.page.uid", "home")]
  });

  /**
   * Define a path for every Document.
   */
  return pages.map((page) => {
    return { uid: page.uid };
  });
}
