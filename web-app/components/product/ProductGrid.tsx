import { Grid } from "@chakra-ui/layout";
import { ProductCard } from "./ProductCard";

export const ProductGrid = ({ data }: any) => {
  return (
    <Grid
      pt={{ base: "10", lg: "100" }}
      templateColumns={{ lg: "repeat(3,1fr)" }}
      justifyContent="center"
    >
      {data?.data?.products.map((productData: any) => {
        return <ProductCard key={productData.product_id} data={productData} />;
      })}
    </Grid>
  );
};
