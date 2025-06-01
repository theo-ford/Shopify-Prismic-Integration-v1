import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { isFilled } from "@prismicio/client";

/**
 * Props for `Product`.
 */
export type ProductProps = SliceComponentProps<Content.ProductSlice>;

/**
 * Component for "Product" Slices.
 */
const Product: FC<ProductProps> = ({ slice }) => {
  if (isFilled.integrationField(slice.primary.product)) {
    // Do something if `my_integration_field` has a value.
    console.log("WE ARE FILLED BABY");
  } else console.log("not filled");

  // console.log(slice.primary.product);
  // console.log(slice.primary.product.handle);
  // console.log(slice.primary.product.published_at);
  // console.log(slice.primary.product.variants);
  console.log(Object.getOwnPropertyNames(slice.primary.product.variants));
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for product (variation: {slice.variation}) Slices
      <br></br>
      Handle: {slice.primary.product.handle}
      <br></br>
      Title: {slice.primary.product.title}
      <br></br>
      Published At: {slice.primary.product.published_at}
      <br></br>
      {/* Variants: {slice.primary.product.variants.[0]} */}
    </section>
  );
};

export default Product;
