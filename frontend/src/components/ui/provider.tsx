"use client";

import { useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme";
import { useAuthStore } from "@/store/authStore";

export function Provider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}