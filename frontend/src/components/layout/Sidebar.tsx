'use client';

import {
  Box,
  VStack,
  Button,
  ButtonProps,
  useDisclosure,
  IconButton,
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerCloseTrigger,
  DrawerBody,
  DrawerHeader,
  Flex,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const { open, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const activeStyle: ButtonProps = {
    bg: 'blue.600',
    color: 'white',
    _hover: { bg: 'blue.700' },
  };

  const inactiveStyle: ButtonProps = {
    variant: 'ghost',
    color: 'gray.700',
    _hover: { bg: 'gray.200' },
  };

  const SidebarContent = () => (
    <VStack align="stretch" gap={2}>
      {[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Nova Demanda', href: '/demandas/nova' },
        { label: 'Ver Demandas', href: '/demandas' },
        { label: 'Painel Administrativo', href: '/painel-administrativo' },
      ].map((link) => (
        <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }} onClick={onClose}>
          <Button
            as="div"
            w="full"
            cursor="pointer"
            justifyContent="flex-start"
            {...(isActive(link.href) ? activeStyle : inactiveStyle)}
          >
            {link.label}
          </Button>
        </Link>
      ))}
    </VStack>
  );

  return (
    <>
      {/* TRIGGER MOBILE: 
          Usamos display base:flex e md:none. 
          Se ele estiver empurrando o conteúdo, o flex-col do RootLayout cuidará disso, 
          mas ele sumirá totalmente no MD.
      */}
      <Box 
        display={{ base: 'flex', md: 'none' }} 
        p={4} 
        bg="white" 
        borderBottom="1px solid" 
        borderColor="gray.200"
        alignItems="center"
      >
        <IconButton variant="outline" onClick={onOpen} aria-label="Abrir Menu">
          <HamburgerIcon />
        </IconButton>
        <Box ml={3} fontWeight="bold">Menu</Box>
      </Box>

      {/* SIDEBAR DESKTOP: 
          Importante: Ocupa espaço APENAS no desktop.
      */}
      <Box
        as="aside"
        display={{ base: 'none', md: 'block' }}
        w="250px"
        minW="250px" // Garante que a largura não colapse
        h="full"
        bg="gray.50"
        p={4}
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <SidebarContent />
      </Box>

      {/* DRAWER MOBILE */}
      <DrawerRoot open={open} onOpenChange={(details) => !details.open && onClose()} placement="start">
        <DrawerBackdrop />
        <DrawerContent bg="gray.50" p={4} pt={12}>
          <DrawerCloseTrigger />
          <DrawerHeader borderBottomWidth="1px" mb={4}>Navegação</DrawerHeader>
          <DrawerBody>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
}