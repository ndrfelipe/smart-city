"use client";

import { Box, Heading, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

type AppCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function AppCard({ title, subtitle, children }: AppCardProps) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="2xl"
      p={6}
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      {title && (
        <Heading size="md" fontWeight="bold" color="gray.800">
          {title}
        </Heading>
      )}

      {subtitle && (
        <Text fontSize="sm" color="gray.500" mt={1}>
          {subtitle}
        </Text>
      )}

      <Box mt={title || subtitle ? 5 : 0}>{children}</Box>
    </Box>
  );
}