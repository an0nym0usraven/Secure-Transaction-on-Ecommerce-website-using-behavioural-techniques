import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { GetStaticProps } from "next";
import NextLink from "next/link";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { useAddToCart } from "../../lib/req/useAddToCart";
import { useGetAllProducts } from "../../lib/req/useGetAllProducts";
import { useGetProduct } from "../../lib/req/useGetProduct";

const Product = ({ data }: any) => {
  const [price, setPrice] = useState(data.data?.price);
  const [isAdding, setIsAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const metadata: string[] = data.data?.metadata.split(";");
  const handleChange = (_: any, value: number) => {
    let price = data.data?.price * value;
    setPrice(price);
    setQty(value);
  };
  const toast = useToast();
  const handleClick = async () => {
    setIsAdding(true);

    const response = await useAddToCart({
      product_id: data.data.product_id,
      qty,
    });

    if (response.data?.ok) {
      setIsAdding(false);
      toast({
        title: "Item added",
        description: "We've added this item to your cart.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } else {
      console.error(response.data);
      toast({
        title: "Error",
        description: response.data.errors[0].message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };
  return (
    <>
      <Navbar />
      <Stack h={"95vh"} direction={{ base: "column", md: "row" }}>
        <Flex flex={1}>
          <Image
            alt={data.data?.title}
            objectFit={"cover"}
            src={data.data?.image}
          />
        </Flex>

        <Flex p={8} flex={1} align={"center"} justify={"center"}>
          <Stack spacing={6} w={"full"} maxW={"lg"}>
            <Text
              cursor="pointer"
              fontSize={{ base: "md", lg: "3xl" }}
              color={"gray.500"}
            >
              <NextLink href="/">
                <ArrowBackIcon />
              </NextLink>
            </Text>
            <Text fontSize={{ base: "md", lg: "xl" }} color={"gray.500"}>
              {data.data?.category}
            </Text>
            <Heading fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}>
              <Text color={"blue.400"} as={"span"}>
                {data.data?.title}
              </Text>
            </Heading>
            <Text fontSize={{ base: "md", lg: "lg" }} color={"gray.500"}>
              {data.data?.description}
            </Text>
            <Stack direction="row">
              {metadata.map((metadata) => {
                return (
                  <Badge variant="outline" colorScheme="purple">
                    {metadata}
                  </Badge>
                );
              })}
            </Stack>
            <Stack direction="row" spacing={50}>
              <NumberInput
                onChange={handleChange}
                size="sm"
                maxW={20}
                defaultValue={1}
                min={1}
                max={5}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Box fontSize="2xl" fontWeight="bold">
                <Box as="span" color={"gray.400"} fontSize="xl">
                  ₹
                </Box>
                {price}
              </Box>
            </Stack>
            <Button
              isLoading={isAdding}
              onClick={handleClick}
              colorScheme="blue"
              variant="solid"
            >
              Add To Cart
            </Button>
          </Stack>
        </Flex>
      </Stack>
    </>
  );
};
export const getStaticProps: GetStaticProps = async (context) => {
  const product_id = context.params?.product_id;
  const { data, error } = await useGetProduct(product_id);
  if (error) console.error(error);
  return {
    props: { data },
  };
};

export async function getStaticPaths() {
  const { data, error } = await useGetAllProducts();
  if (error) console.error(error);

  const paths = data.data.products.map((p: any) => ({
    params: {
      product_id: p.product_id,
    },
  }));
  return {
    paths,
    fallback: false,
  };
}

export default Product;
