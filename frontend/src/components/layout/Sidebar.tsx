'use client';

import { Box, VStack, HStack, Button, ButtonProps, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBreakpointValue } from '@chakra-ui/react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Início' },
  { href: '/demandas/nova', label: 'Nova Demanda', shortLabel: 'Nova' },
  { href: '/demandas', label: 'Ver Demandas', shortLabel: 'Demandas' },
  { href: '/painel-administrativo', label: 'Painel Administrativo', shortLabel: 'Painel' },
];

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useBreakpointValue({ base: true, md: false });

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

  // ── Mobile: bottom navigation bar ──────────────────────────────
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
          {navLinks.map(({ href, shortLabel }) => {
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
        </HStack>
      </Box>
    );
  }

  // ── Desktop: sidebar lateral (comportamento original) ───────────
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
        {navLinks.map(({ href, label }) => (
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
      </VStack>
    </Box>
  );
}