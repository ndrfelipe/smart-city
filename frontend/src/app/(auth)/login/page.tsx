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
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const tokens = await api.login(email, password);
      if (tokens && tokens.access_token) {
        // Here we ideally want the user object. 
        // For now, let's create a partial user from what we know or wait for a user fetch.
        // Since we don't have a /me endpoint yet, I'll mock the user object from the email.
        const mockUser: any = { 
          id: '1', 
          name: email.split('@')[0], 
          email: email, 
          role: 'CITIZEN' 
        };
        setAuth(mockUser, tokens.access_token);
        router.push('/dashboard');
      } else {
        setError('Email ou senha inválidos');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
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
        <VStack gap={4} align="flex-start" w="full">
          <Heading as="h1" size="lg" textAlign="center" w="full">
            Login - Smart City
          </Heading>
          <Text textAlign="center" w="full" color="gray.600">
            Entre com suas credenciais
          </Text>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack gap={4} w="full">
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
                <Alert.Root status="error">
                  <MdError />
                  <Text ml={2}>{error}</Text>
                </Alert.Root>
              )}
              <Button
                type="submit"
                colorPalette="blue"
                width="full"
                loading={isLoading}
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