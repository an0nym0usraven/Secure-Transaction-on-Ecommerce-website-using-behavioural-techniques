import { Badge, Box, Flex, Image, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useGetProduct } from "../../lib/req/useGetProduct";

export const CartItem = ({ data, setTotalCallback }) => {
  const [product, setProduct] = useState({});
  useEffect(() => {
    useGetProduct(data.product_id)
      .then((p) => {
        setProduct(p.data.data);
        setTotalCallback(p.data.data.price);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Flex
      pb={{ base: "20" }}
      w="full"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg={useColorModeValue("white", "gray.800")}
        maxW="xs"
        borderWidth="1px"
        rounded="lg"
        shadow="lg"
        position="relative"
      >
        <Image src={product.image} alt={product.title} roundedTop="lg" />

        <Box p="6">
          <Flex mt="2" justifyContent="space-between" alignContent="center">
            <Box
              fontSize="2xl"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              isTruncated
            >
              {product.title}
            </Box>
          </Flex>
          <Box fontSize="2xl" color={useColorModeValue("gray.800", "white")}>
            QTY: {data.qty}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};
