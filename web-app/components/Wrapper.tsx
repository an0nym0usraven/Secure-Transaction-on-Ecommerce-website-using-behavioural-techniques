import React from "react";
import { Box, Grid } from "@chakra-ui/react";

export const Wrapper: React.FC = ({ children }) => {
  return (
    <Box
      maxW="1250px"
      ml="1.5rem"
      mr="1.5rem"
      h={{ lg: "95vh" }}
      m={{ lg: "auto" }}
      display="grid"
      gridGap="1rem"
    >
      {children}
    </Box>
  );
};
