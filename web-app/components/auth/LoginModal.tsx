import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/dist/client/router";
import React, { useReducer, useRef } from "react";
import { useLogin } from "../../lib/req/useLogin";
import { useVerifyOTP } from "../../lib/req/useVerifyOTP";

const formReducer = (state: any, event: any) => {
  return {
    ...state,
    [event.name]: event.value,
  };
};

export const LoginModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useReducer(formReducer, {});
  const router = useRouter();

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    // @ts-ignore
    const { ClientJS } = await import("clientjs");
    const client = new ClientJS();
    const fingerprint = client.getFingerprint().toString();

    useLogin({ ...formData, fingerprint })
      .then((res) => {
        if (res.data.ok) {
          router.reload();
        } else if (
          !res.data.ok &&
          res.data.errors[0].message === "requireOTP"
        ) {
          onClose();
          let email = res.data.data.email;
          let otp = prompt("Please enter the OTP");
          useVerifyOTP({
            otp,
            email,
          })
            .then((res) => {
              if (res.data.ok) router.reload();
              else if (
                !res.data.ok &&
                res.data.errors[0].message === "OTP entered was wrong!"
              ) {
                alert("Wrong OTP!");
              } else {
                alert(res.data);
              }
            })
            .catch((error) => console.error(error));
        } else {
          console.error(res.data);
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
      <Button variant="link" onClick={onOpen}>
        Login
      </Button>

      <Modal autoFocus={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign in to your account</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={onSubmit}>
            <ModalBody pb={6}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" onChange={handleChange} type="email" />
              </FormControl>
              <FormControl isRequired mt={4}>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  onChange={handleChange}
                  type="password"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blue" mr={3}>
                Continue
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
