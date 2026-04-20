"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
} from '@chakra-ui/react';
import { MdError } from 'react-icons/md';
import { api } from '@/services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await api.login(email, password);
      if (user) {
        // In a real app, you'd store the user in context or localStorage
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } else {
        setError('Email ou senha inválidos');
      }
    } catch {
      setError('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container centerContent minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={4} align="flex-start" w="full">
          <Heading as="h1" size="lg" textAlign="center" w="full">
            Login - Smart City
          </Heading>
          <Text textAlign="center" w="full" color="gray.600">
            Entre com suas credenciais
          </Text>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} w="full">
              <Box w="full">
                <Text as="label" fontWeight="semibold" mb={2} display="block">
                  Email
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </Box>
              <Box w="full">
                <Text as="label" fontWeight="semibold" mb={2} display="block">
                  Senha
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                />
              </Box>
              {error && (
                <Alert status="error">
                  <MdError />
                  <Text ml={2}>{error}</Text>
                </Alert>
              )}
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
                loadingText="Entrando..."
              >
                Entrar
              </Button>
            </VStack>
          </form>
          <Text fontSize="sm" color="gray.500" textAlign="center" w="full">
            Usuários de teste: joao@email.com ou maria@email.com (senha: 123456)
          </Text>
        </VStack>
      </Box>
    </Container>
  );
}