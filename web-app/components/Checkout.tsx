import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { startAuthentication } from "@simplewebauthn/browser";
import { AuthenticationCredentialJSON } from "@simplewebauthn/typescript-types";
import { useRouter } from "next/router";
import React, { useReducer } from "react";
import { useCheckout } from "../lib/req/useCheckout";
import { useLogOut } from "../lib/req/useLogOut";
import { useVerifyAuthentication } from "../lib/req/useVerifyAuthentication";

interface CheckoutProps {
  total: number;
}

const formReducer = (state: any, event: any) => {
  return {
    ...state,
    [event.name]: event.value,
  };
};

export const CheckoutModal = ({ total }: CheckoutProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useReducer(formReducer, {});
  const router = useRouter();
  const toast = useToast();

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    useCheckout({ ...formData })
      .then(async (res) => {
        if (res.data.ok) {
          onClose();
          setTimeout(async () => {
            const response = await useLogOut();
            if (response.data === "OK") router.push("/");
          }, 3000);
          toast({
            title: "Order successful",
            description: "Your order is on its way!",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        } else if (
          res.data.errors[0].message === "Your account has been blocked!"
        ) {
          toast({
            title: "Transaction failed",
            description: res.data.errors[0].message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          setTimeout(async () => {
            const response = await useLogOut();
            if (response.data === "OK") router.push("/");
          }, 3000);
        } else if (res.data.errors[0].message === "requireTFA") {
          toast({
            title: "Verification",
            description: "Two factor verification required",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          console.log("RECEIVED AUTH OPTIONS FROM SERVER");
          let opts = res.data.data.options;
          console.log(opts);
          let asseResp;

          try {
            asseResp = await startAuthentication(opts);
          } catch (error) {
            console.error(error);
          }

          console.log(asseResp);
          console.log("VERIFY AUTHENTICATION");
          useVerifyAuthentication({
            options: asseResp as AuthenticationCredentialJSON,
          })
            .then((res) => {
              if (res.data.verified) {
                console.log("VERIFIED");
                onClose();
                setTimeout(async () => {
                  const response = await useLogOut();
                  if (response.data === "OK") router.push("/");
                }, 5000);
                toast({
                  title: "Verification successful",
                  description:
                    "Your identity has been verified and order has been placed.",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                  position: "top",
                });
              } else {
                console.log("VERFICATION FAILED");
                setTimeout(async () => {
                  const response = await useLogOut();
                  if (response.data === "OK") router.push("/");
                }, 3000);
                toast({
                  title: "Verification unsuccessful",
                  description:
                    "Identity verification was unsuccessful. Account has been blocked.",
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                  position: "top",
                });
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          toast({
            title: "Transaction failed",
            description: res.data.errors[0].message,
            status: "error",
            duration: 2000,
            isClosable: true,
            position: "top",
          });
        }
      })
      .catch((error) => console.error(error));
  };
  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setFormData({
      name: e.currentTarget.name,
      value: e.currentTarget.value,
    });
  };
  return (
    <>
      <Button onClick={onOpen} size="lg" colorScheme="blue">
        Proceed To Checkout
      </Button>

      <Modal autoFocus={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Checkout</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={onSubmit}>
            <ModalBody pb={6}>
              <FormControl isRequired>
                <FormLabel>Card information</FormLabel>
                <Input
                  placeholder="1234 1234 1234 1234"
                  name="card_number"
                  onChange={handleChange}
                  type="text"
                />
              </FormControl>
              <HStack mt={3}>
                <FormControl isRequired>
                  <Input
                    name="card_expiry"
                    onChange={handleChange}
                    type="text"
                    placeholder="MM / YY"
                  />
                </FormControl>
                <FormControl isRequired>
                  <Input
                    name="card_cvc"
                    onChange={handleChange}
                    type="text"
                    placeholder="CVC"
                  />
                </FormControl>
              </HStack>
              <FormControl isRequired mt={6}>
                <FormLabel>Name on card</FormLabel>
                <Input name="card_name" onChange={handleChange} type="text" />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                isFullWidth={true}
                type="submit"
                colorScheme="blue"
                mr={3}
              >
                Pay ₹{total}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
