import { Wrapper } from "../components/Wrapper";
import Navbar from "../components/Navbar";
import { ProductGrid } from "../components/product/ProductGrid";
import { GetStaticProps } from "next";
import { useGetAllProducts } from "../lib/req/useGetAllProducts";
import { Heading } from "@chakra-ui/react";

const Index = ({ data }: any) => {
  if (!data) {
    return (
      <>
        <Navbar />
        <Wrapper>
          <Heading mt={2} size="xl">
            No products found
          </Heading>
        </Wrapper>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <Wrapper>
        <ProductGrid data={data} />
      </Wrapper>
    </>
  );
};

export default Index;

export const getStaticProps: GetStaticProps = async () => {
  const { data, error } = await useGetAllProducts();
  if (error?.code === "ECONNREFUSED") console.error("Server is offline!");
  else console.error(error);
  if (!data) {
    return {
      props: {
        data: null,
      },
    };
  }
  return {
    props: { data },
  };
};
