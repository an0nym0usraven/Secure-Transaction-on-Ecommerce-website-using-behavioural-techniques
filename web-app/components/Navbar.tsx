import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useLogOut } from "../lib/req/useLogOut";
import { useWhoAmI } from "../lib/req/useWhoAmI";
import { LoginModal } from "./auth/LoginModal";
import { RegisterModal } from "./auth/RegisterModal";

interface LinkType {
  name: string;
  url: string;
}

const Links = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "Cart",
    url: "/cart",
  },
];

const NavLink = ({ children }: { children: LinkType }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    as={NextLink}
    href={children.url}
  >
    {children.name}
  </Link>
);

export default function Navbar() {
  const [name, setName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    useWhoAmI().then((response) => {
      if (response.data?.ok) {
        setIsLoggedIn(true);
        const name =
          response.data.data.first_name + " " + response.data.data.last_name;
        setName(name);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  const handleLogOut = async () => {
    const response = await useLogOut();
    if (response.data === "OK") {
      router.reload();
    }
  };

  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex
          h={{ base: "7vh", lg: "5vh" }}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {Links.map((link: LinkType) => (
                <NavLink key={link.name}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar size={"sm"} name={name} />
              </MenuButton>
              {isLoggedIn ? (
                <MenuList>
                  <MenuItem onClick={handleLogOut}>Log out</MenuItem>
                </MenuList>
              ) : (
                <MenuList>
                  <VStack>
                    <RegisterModal />
                    <MenuDivider />
                    <LoginModal />
                  </VStack>
                </MenuList>
              )}
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.name}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
