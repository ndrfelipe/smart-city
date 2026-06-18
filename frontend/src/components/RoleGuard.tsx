'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useAuthStore } from '@/store/authStore';
import { useRole, UserRole } from '@/hooks/useRole';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * Envolve qualquer page.tsx que precise de proteção por role.
 *
 * Uso:
 *   <RoleGuard allowedRoles={['gestor', 'servidor']}>
 *     <DashboardPage />
 *   </RoleGuard>
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router          = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { role }        = useRole();

  const isAllowed = isAuthenticated && allowedRoles.includes(role);

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (!isAllowed) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
}

function AccessDeniedPage() {
  const router = useRouter();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <VStack gap={4} textAlign="center" maxW="400px" px={6}>
        <Heading fontSize="6xl" color="gray.300" fontWeight="black">
          404
        </Heading>
        <Heading fontSize="xl" color="gray.700">
          Página não encontrada
        </Heading>
        <Text color="gray.500">
          Você não tem permissão para acessar esta página.
        </Text>
        <Button
          colorPalette="blue"
          onClick={() => router.push('/login')}
          mt={2}
        >
          Ir para o login
        </Button>
      </VStack>
    </Box>
  );
}
