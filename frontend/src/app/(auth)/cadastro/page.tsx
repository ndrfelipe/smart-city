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

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function Cadastro() {

  const router = useRouter();

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCadastro() {
    setErro('');
    if (!nome || !sobrenome || !email || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      await api.register(`${nome} ${sobrenome}`, email, senha);
      router.push('/login');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro('Erro ao cadastrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

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
                <Input 
                placeholder="João"
                value={nome}
                onChange={e => setNome(e.target.value)}
                />
              </Field.Root>
              <Field.Root flex={1}>
                <Field.Label>Sobrenome</Field.Label>
                <Input 
                placeholder="Silva" 
                value={sobrenome}
                onChange={e => setSobrenome(e.target.value)}
                />
              </Field.Root>
            </Flex>

            <Field.Root>
              <Field.Label>E-mail</Field.Label>
              <Input 
              type="email" 
              placeholder="joao@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              />
            </Field.Root>

            <Flex gap={4}>
              <Field.Root flex={1}>
                <Field.Label>Senha</Field.Label>
                <Input 
                type="password" 
                placeholder="••••••••" 
                value={senha}
                onChange={e => setSenha(e.target.value)}
                />
              </Field.Root>

              <Field.Root flex={1}>
                <Field.Label>Confirmar senha</Field.Label>
                <Input 
                type="password" 
                placeholder="••••••••" 
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                />
              </Field.Root>
            </Flex>

            {/* Mensagem de erro */}
            {erro && (
              <Text color="red.500" fontSize="sm">{erro}</Text>
            )}

            <Button 
            colorPalette="blue" 
            w="full" 
            mt={2}
            onClick={handleCadastro}
            loading={loading}
            >
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