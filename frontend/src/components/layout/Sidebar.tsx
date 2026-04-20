'use client';
import { Box, VStack, Button } from '@chakra-ui/react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <Box w="250px" bg="gray.50" h="100vh" p={4} borderRight="1px solid" borderColor="gray.200">
      <VStack align="stretch" gap={2}>
        <Link href="/demandas" passHref>
          <Button w="full" variant="ghost" justifyContent="flex-start">
            Ver Demandas
          </Button>
        </Link>
        <Link href="/demandas/nova" passHref>
          <Button w="full" colorScheme="blue" justifyContent="flex-start">
            Nova Demanda
          </Button>
        </Link>
        <Link href="/painel-administrativo" passHref>
          <Button w="full" variant="ghost" justifyContent="flex-start">
            Painel Administrativo
          </Button>
        </Link>
        {/* Este link seria visível apenas para o Gestor no futuro */}
        <Link href="/dashboard" passHref>
          <Button w="full" variant="ghost" justifyContent="flex-start">
            Painel do Gestor
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}