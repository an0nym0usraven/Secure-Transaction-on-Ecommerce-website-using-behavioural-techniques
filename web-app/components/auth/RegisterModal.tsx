import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
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
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useReducer, useState } from "react";
import { useRegister } from "../../lib/req/useRegister";
import { useVerifyRegistration } from "../../lib/req/useVerifyRegistration";
import { startRegistration } from "@simplewebauthn/browser";
import { RegistrationCredentialJSON } from "@simplewebauthn/typescript-types";

const formReducer = (state: any, event: any) => {
  return {
    ...state,
    [event.name]: event.value,
  };
};

export const RegisterModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useReducer(formReducer, {});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // @ts-ignore
    const { ClientJS } = await import("clientjs");
    const client = new ClientJS();
    const fingerprint = client.getFingerprint().toString();

    useRegister({ ...formData, fingerprint })
      .then(async (res) => {
        if (res.data.ok && formData.TFA_auth) {
          console.log("RECEIVED REG OPTIONS FROM SERVER");
          let authOptions = res.data.data.options;
          let attResp;
          try {
            attResp = await startRegistration(authOptions);
          } catch (error: any) {
            if (error.name === "InvalidStateError") {
              console.error("Authenticator was  already registered by user");
            } else {
              console.error(error);
            }

            console.error(error);
          }

          console.log(attResp);
          console.log("VERIFY REGISTRATION");
          useVerifyRegistration({
            options: attResp as RegistrationCredentialJSON,
          })
            .then((res) => {
              setIsLoading(false);
              onClose();
              if (res.data.verified) {
                toast({
                  title: "Verification successful",
                  description:
                    "Your authentication method has been added successfully.",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                  position: "top",
                });
                setTimeout(() => {
                  router.reload();
                }, 3000);
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else if (res.data.ok) {
          router.reload();
        } else {
          console.error(res);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    let value;

    if (e.currentTarget.type === "checkbox") {
      value = e.currentTarget.checked;
    } else {
      value = e.currentTarget.value;
    }
    setFormData({
      name: e.currentTarget.name,
      value,
    });
  };
  return (
    <>
      <Button variant="link" onClick={onOpen}>
        Register
      </Button>

      <Modal autoFocus={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create your account</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={onSubmit}>
            <ModalBody pb={6}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input name="first_name" onChange={handleChange} type="text" />
              </FormControl>
              <FormControl isRequired mt={4}>
                <FormLabel>Last Name</FormLabel>
                <Input name="last_name" onChange={handleChange} type="text" />
              </FormControl>
              <FormControl isRequired mt={4}>
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
                <FormHelperText>
                  Password should be at least 8 characters long.
                </FormHelperText>
              </FormControl>
              <FormControl isRequired mt={4}>
                <Checkbox
                  type="checkbox"
                  name="TFA_auth"
                  onChange={handleChange}
                >
                  Enable extra layer of security
                </Checkbox>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={isLoading}
                type="submit"
                colorScheme="blue"
                mr={3}
              >
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
