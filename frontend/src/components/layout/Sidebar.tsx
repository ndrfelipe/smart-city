'use client';

import { Box, VStack, Button, ButtonProps } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {

  const pathname = usePathname();
  const linkIsActive = (path: string) => pathname === path;
  const linkActiveStyle: ButtonProps = {
    colorPalette: 'blue',
    variant: 'solid',
    _hover: {
      bg: 'blue.700',
    },
  };

  const linkInactiveStyle: ButtonProps = {
    variant: 'ghost',
    color: 'gray.700',
    _hover: {
      bg: 'gray.200',
    },
  };

  return (
    <Box w="250px" bg="gray.50" h="100vh" p={4} borderRight="1px solid" borderColor="gray.200">
      <VStack align="stretch" gap={2}>
        {/* Este link seria visível apenas para o Gestor no futuro */}
        <Link href="/dashboard" passHref>
          <Button as="div"
            w="full"
            cursor="pointer" 
            justifyContent="flex-start" {...(linkIsActive('/dashboard') ? linkActiveStyle : linkInactiveStyle)}
            >
            Dashboard
          </Button>
        </Link>

        <Link href="/demandas/nova" passHref>
          <Button  as="div"
            w="full"
            cursor="pointer" 
            justifyContent="flex-start" {...(linkIsActive('/demandas/nova') ? linkActiveStyle :
             linkInactiveStyle)}>
            Nova Demanda
          </Button>
        </Link>

        <Link href="/demandas" passHref>
          <Button as="div"
            w="full"
            cursor="pointer" 
            justifyContent="flex-start" {...(linkIsActive('/demandas') ? linkActiveStyle : linkInactiveStyle)}
            >
            Ver Demandas
          </Button>
        </Link>

        {/* esse painel adm será visivél apenas para o gestor. */}
        <Link href="/painel-administrativo" passHref>
          <Button as="div"
            w="full"
            cursor="pointer" 
            justifyContent="flex-start" {...(linkIsActive('/painel-administrativo') ? linkActiveStyle :
             linkInactiveStyle)}>
            Painel Administrativo
          </Button>
        </Link>
        
      </VStack>
    </Box>
  );
}