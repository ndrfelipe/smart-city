'use client';

import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';

export default function Cadastro() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100">
      <Flex
        bg="white"
        borderRadius="xl"
        shadow="lg"
        overflow="hidden"
        w="full"
        maxW="900px"
        minH="520px"
      >
        {/* Lado esquerdo — formulário */}
        <Box flex={1} p={10}>
          <Heading size="lg" color="blue.600" mb={1}>
            Smart City
          </Heading>
          <Heading size="md" color="gray.800" mt={4} mb={1}>
            Criar conta
          </Heading>
          <Text color="gray.500" fontSize="sm" mb={6}>
            Preencha os dados para se cadastrar
          </Text>

          <Stack gap={4}>
            <Flex gap={4}>
              <Field.Root flex={1}>
                <Field.Label>Nome</Field.Label>
                <Input placeholder="João" />
              </Field.Root>
              <Field.Root flex={1}>
                <Field.Label>Sobrenome</Field.Label>
                <Input placeholder="Silva" />
              </Field.Root>
            </Flex>

            <Field.Root>
              <Field.Label>E-mail</Field.Label>
              <Input type="email" placeholder="joao@email.com" />
            </Field.Root>

            <Flex gap={4}>
              <Field.Root flex={1}>
                <Field.Label>Senha</Field.Label>
                <Input type="password" placeholder="••••••••" />
              </Field.Root>
              <Field.Root flex={1}>
                <Field.Label>Confirmar senha</Field.Label>
                <Input type="password" placeholder="••••••••" />
              </Field.Root>
            </Flex>

            <Button colorPalette="blue" w="full" mt={2}>
              Cadastrar
            </Button>
          </Stack>
        </Box>

        {/* Lado direito — painel azul */}
        <Flex
          flex={1}
          bg="blue.600"
          direction="column"
          align="center"
          justify="center"
          p={10}
          gap={4}
        >
          <Heading size="lg" color="white" textAlign="center">
            Já tem uma conta?
          </Heading>
          <Text color="blue.100" textAlign="center" fontSize="sm">
            Faça login e acesse a plataforma de gestão urbana
          </Text>
          <Link href="/login">
            <Button variant="outline" color="white" borderColor="white" mt={2} _hover={{ bg: 'blue.700' }}>
              Entrar
            </Button>
          </Link>
        </Flex>

      </Flex>
    </Flex>
  );
}