import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `ProductPageIntegrationField`.
 */
export type ProductPageIntegrationFieldProps =
  SliceComponentProps<Content.ProductPageIntegrationFieldSlice>;

/**
 * Component for "ProductPageIntegrationField" Slices.
 */
const ProductPageIntegrationField: FC<ProductPageIntegrationFieldProps> = ({
  slice,
}) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for product_page_integration_field (variation:{" "}
      {slice.variation}) Slices
    </section>
  );
};

export default ProductPageIntegrationField;
