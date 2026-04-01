"use client";

import { Button, Box, Text, Heading } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-gray-50 p-10">
      <Box bg="white" p="6" borderRadius="xl" shadow="md" maxW="lg">
        <Heading size="lg">Chakra funcionando!</Heading>

        <p className="text-gray-600 mt-2">
          Esse texto está com Tailwind.
        </p>

        <Button mt="4" colorPalette="brand">
          Novo Chamado
        </Button>
      </Box>
    </main>
  );
}