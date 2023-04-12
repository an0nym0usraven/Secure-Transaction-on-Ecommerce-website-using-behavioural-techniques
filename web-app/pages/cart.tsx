import { Box, Heading, HStack, Spacer } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CartGrid } from "../components/cart/CartGrid";
import { CheckoutModal } from "../components/Checkout";
import Navbar from "../components/Navbar";
import { Wrapper } from "../components/Wrapper";
import { useGetCart } from "../lib/req/useGetCart";

const Cart = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    useGetCart()
      .then((c) => {
        setData(c.data.data.cart);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const setTotalCallback = (price: number) => {
    let qty: number = 0;
    data.map((i) => {
      qty = qty + i.qty;
    });
    setTotal(price * qty);
  };

  return (
    <>
      <Navbar />
      <Wrapper>
        <HStack spacing="10">
          <Heading size="2xl">My Cart</Heading>
          <Spacer />
          <Box fontSize="4xl">
            <Box as="span" color={"gray.400"} fontSize="xl">
              ₹
            </Box>
            {total}
          </Box>
          <CheckoutModal total={total} />
        </HStack>
        <CartGrid setTotalCallback={setTotalCallback} data={data} />
      </Wrapper>
    </>
  );
};

export default Cart;
