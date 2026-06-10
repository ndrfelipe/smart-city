'use client';
import { useMemo } from 'react';
import { Box, Flex, Text, Avatar } from '@chakra-ui/react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const user = useAuthStore((state) => state.user);
  
  const userName = useMemo(() => {
    if (!user || !user.name) return 'Visitante';
    // Pega apenas o primeiro nome
    return user.name.trim().split(' ')[0];
  }, [user]);

  return (
    <Box bg="blue.600" px={4} py={3} color="white" shadow="md">
      <Flex h={12} alignItems="center" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold">
          <Link href="/">Smart City</Link>
        </Text>
        
        <Flex alignItems="center" gap={4}>
          <Text fontSize="sm">Olá, {userName}</Text>
          
          <Avatar.Root size="sm">
            <Avatar.Fallback bg="blue.400" color="white">
              {userName[0].toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>

        </Flex>
      </Flex>
    </Box>
  );
}
