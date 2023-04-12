import { Grid } from "@chakra-ui/layout";
import { CartItem } from "./CartItem";

export const CartGrid = ({ data, setTotalCallback }: any) => {
  return (
    <Grid
      pt={{ base: "10", lg: "100" }}
      templateColumns={{ lg: "repeat(3,1fr)" }}
      justifyContent="center"
    >
      {data?.map((productData: any) => {
        return (
          <CartItem
            setTotalCallback={setTotalCallback}
            key={productData.product_id}
            data={productData}
          />
        );
      })}
    </Grid>
  );
};
