import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `FeaturedProductTwo`.
 */
export type FeaturedProductTwoProps =
  SliceComponentProps<Content.FeaturedProductTwoSlice>;

/**
 * Component for "FeaturedProductTwo" Slices.
 */
const FeaturedProductTwo: FC<FeaturedProductTwoProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for featured_product_two (variation:{" "}
      {slice.variation}) Slices
    </section>
  );
};

export default FeaturedProductTwo;
