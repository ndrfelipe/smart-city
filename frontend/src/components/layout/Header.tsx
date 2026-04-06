'use client';
import { Box, Flex, Text, Avatar } from '@chakra-ui/react';
import Link from 'next/link';

export function Header() {
  return (
    <Box bg="blue.600" px={4} py={3} color="white" shadow="md">
      <Flex h={12} alignItems="center" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold">
          <Link href="/">Smart City</Link>
        </Text>
        
        <Flex alignItems="center" gap={4}>
          <Text fontSize="sm">Olá, Cidadão</Text>
          
          {/* Atualizado para a sintaxe de Namespace do Chakra v3 */}
          <Avatar.Root size="sm">
            <Avatar.Fallback bg="blue.400" color="white">
              C
            </Avatar.Fallback>
          </Avatar.Root>

        </Flex>
      </Flex>
    </Box>
  );
}