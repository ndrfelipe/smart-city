'use client';

import { Box, VStack, HStack, Button, ButtonProps, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useBreakpointValue } from '@chakra-ui/react';
import { useAuthStore } from '@/store/authStore';
import { useRole } from '@/hooks/useRole';
import { api } from '@/services/api';

// Cada link pode ter um array de roles permitidas.
// Se 'allowedRoles' estiver ausente, o link é visível para todos.
const navLinks = [
  { href: '/dashboard',             label: 'Dashboard',            shortLabel: 'Início', },
  { href: '/demandas/nova',         label: 'Nova Demanda',         shortLabel: 'Nova' },
  { href: '/demandas',              label: 'Ver Demandas',         shortLabel: 'Demandas' },
  { href: '/painel-administrativo', label: 'Painel Administrativo', shortLabel: 'Painel',   allowedRoles: ['gestor', 'servidor'] },
] as const;

export function Sidebar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const isMobile   = useBreakpointValue({ base: true, md: false });
  const { role }   = useRole();
  const logout     = useAuthStore((state) => state.logout);

  const visibleLinks = navLinks.filter(({ allowedRoles }) =>
    !allowedRoles || (allowedRoles as readonly string[]).includes(role)
  );

  const linkIsActive = (path: string) => pathname === path;

  const linkActiveStyle: ButtonProps = {
    colorPalette: 'blue',
    variant: 'solid',
    _hover: { bg: 'blue.700' },
  };

  const linkInactiveStyle: ButtonProps = {
    variant: 'ghost',
    color: 'gray.700',
    _hover: { bg: 'gray.200' },
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();   // chama GET /auth/logout no backend
    } catch {
      // ignora erros de rede — o logout local acontece de qualquer forma
    } finally {
      logout();                  // limpa localStorage + store
      router.push('/login');
    }
  };

  // ── Mobile: bottom navigation bar ─────────────────────────────
  if (isMobile) {
    return (
      <Box
        as="nav"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={100}
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        px={2}
        py={1}
        shadow="0 -2px 10px rgba(0,0,0,0.06)"
      >
        <HStack justify="space-around" align="center">
          {visibleLinks.map(({ href, shortLabel }) => {
            const active = linkIsActive(href);
            return (
              <Link key={href} href={href} passHref>
                <Box
                  as="div"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  cursor="pointer"
                  bg={active ? 'blue.50' : 'transparent'}
                  transition="background 0.15s"
                  minW="60px"
                >
                  <Text
                    fontSize="xs"
                    fontWeight={active ? 'bold' : 'medium'}
                    color={active ? 'blue.600' : 'gray.500'}
                    mt={1}
                    textAlign="center"
                  >
                    {shortLabel}
                  </Text>
                </Box>
              </Link>
            );
          })}

          {/* Logout no mobile */}
          <Box
            as="div"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            px={3}
            py={2}
            borderRadius="lg"
            cursor="pointer"
            onClick={handleLogout}
            _hover={{ bg: 'red.50' }}
            transition="background 0.15s"
            minW="60px"
          >
            <Text fontSize="xs" fontWeight="medium" color="red.500" mt={1} textAlign="center">
              Sair
            </Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  // ── Desktop: sidebar lateral ───────────────────────────────────
  return (
  <Box
    as="nav"
    w="250px"
    bg="gray.50"
    h="100vh"
    p={4}
    borderRight="1px solid"
    borderColor="gray.200"
    flexShrink={0}
  >
    <VStack align="stretch" gap={2}>
      {visibleLinks.map(({ href, label }) => (
        <Link key={href} href={href} passHref>
          <Button
            as="div"
            w="full"
            cursor="pointer"
            justifyContent="flex-start"
            {...(linkIsActive(href) ? linkActiveStyle : linkInactiveStyle)}
          >
            {label}
          </Button>
        </Link>
      ))}

      {/* Sair logo abaixo dos links */}
      <Button
        w="full"
        variant="ghost"
        color="red.500"
        justifyContent="flex-start"
        _hover={{ bg: 'red.50' }}
        onClick={handleLogout}
      >
        Sair
      </Button>
    </VStack>
  </Box>
);
}
