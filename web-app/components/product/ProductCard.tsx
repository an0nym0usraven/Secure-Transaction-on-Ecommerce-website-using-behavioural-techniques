import { Badge, Box, Flex, Image, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";

export const ProductCard = ({ data }: any) => {
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
        <Image src={data.image} alt={data.title} roundedTop="lg" />

        <Box p="6">
          <Box d="flex" alignItems="baseline">
            <Badge rounded="full" px="2" fontSize="0.8em" colorScheme="purple">
              New
            </Badge>
          </Box>
          <Flex mt="2" justifyContent="space-between" alignContent="center">
            <Box
              fontSize="2xl"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              isTruncated
            >
              <NextLink href={`/product/${data.product_id}`}>
                {data.title}
              </NextLink>
            </Box>
          </Flex>
          <Box fontSize="2xl" color={useColorModeValue("gray.800", "white")}>
            <Box as="span" color={"gray.400"} fontSize="xl">
              ₹
            </Box>
            {data.price}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};
