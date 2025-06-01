import { FC } from "react";
import { Content, isFilled, ImageFieldImage } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
// import styles from "./index.module.css";
import { createClient } from "@/prismicio";

interface ProductData {
  image: ImageFieldImage | null;
  title: string;
  price: string;
}

interface ProductData {
  image: ImageFieldImage | null;
  title: string;
  price: string;
}

/**
 * Props for `HomepageFeaturedProductsX4`.
 */
export type HomepageFeaturedProductsX4Props =
  SliceComponentProps<Content.HomepageFeaturedProductsX4Slice>;

/**
 * Component for "HomepageFeaturedProductsX4" Slices.
 */
const HomepageFeaturedProductsX4: FC<HomepageFeaturedProductsX4Props> = async ({
  slice
}) => {
  const client = createClient();

  // Fetch all linked products
  const products = await Promise.all([
    slice.primary.product ? client.getByID(slice.primary.product.id) : null,
    slice.primary.product_2 ? client.getByID(slice.primary.product_2.id) : null,
    slice.primary.product_3 ? client.getByID(slice.primary.product_3.id) : null,
    slice.primary.product_4 ? client.getByID(slice.primary.product_4.id) : null
  ]);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className=""
    >
      <div className="float-left relative ] w-[calc(100%-20px)] m-[10px] 0 grid grid-cols-4 gap-x-[10px]">
        {products.map((product, index) => {
          if (!product) return null;

          console.log("Product data:", product.data);

          const productData = product.data as unknown as ProductData;
          return (
            <div key={index} className=" col-span-1 bg-red-800">
              {isFilled.image(productData.image) && (
                <div className="relative float-left w-[100%] h-auto overflow-hidden ">
                  <PrismicNextImage
                    field={productData.image}
                    className="w-[100%]"
                    alt=""
                  />
                </div>
              )}
              <div className="relative float-left">
                {/* <h3 className="">{productData.title}</h3> */}
                <h3 className="">{product.data.shopify_product.title}</h3>
                <p className="">
                  ${product.data.shopify_product.variants[0].price}
                </p>
                <button className="font-bold">Add to Cart</button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HomepageFeaturedProductsX4;
