'use client';

import { useEffect } from 'react';
import {
  Box,
  Heading,
  Stack,
  Text,
  Badge,
  HStack,
  Button,
  Icon,
  Spinner,
  Center,
  VStack,
} from '@chakra-ui/react';
import { useDemandStore } from '@/store/demandStore';
import Link from 'next/link';
import { FiPlus, FiMapPin, FiClock } from 'react-icons/fi';

const statusColors: Record<string, string> = {
  Pendente: 'yellow',
  'Em andamento': 'blue',
  Resolvido: 'green',
};

export default function ListagemDemandas() {
  const { demandas, isLoading, error, fetchDemandas } = useDemandStore();

  useEffect(() => {
    fetchDemandas();
  }, [fetchDemandas]);

  if (isLoading && demandas.length === 0) {
    return (
      <Center h="200px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="200px">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <Box>
          <Heading size="lg" color="blue.700">
            Minhas Demandas
          </Heading>
          <Text color="gray.600">Acompanhe o status das suas solicitações</Text>
        </Box>
        <Link href="/demandas/nova" passHref>
          <Button colorPalette="blue" size="md">
            <Icon as={FiPlus} mr={1} />
            Nova Demanda
          </Button>
        </Link>
      </HStack>

      {demandas.length === 0 ? (
        <Center h="300px" bg="white" borderRadius="xl" shadow="sm" borderStyle="dashed" borderWidth="2px" borderColor="gray.300">
          <VStack gap={4}>
            <Text color="gray.500" fontSize="lg">Nenhuma demanda encontrada.</Text>
            <Link href="/demandas/nova" passHref>
               <Button colorPalette="blue" variant="surface">Começar agora</Button>
            </Link>
          </VStack>
        </Center>
      ) : (
        <Stack gap={4}>
          {demandas.map((demanda) => (
            <Box
              key={demanda.id}
              p={5}
              bg="white"
              borderRadius="lg"
              shadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
              transition="all 0.2s"
              _hover={{ shadow: 'md', borderColor: 'blue.200', transform: 'translateY(-2px)' }}
            >
              <HStack justify="space-between" mb={3}>
                <HStack gap={3}>
                  <Badge colorPalette={statusColors[demanda.status] || 'gray'} variant="solid" size="sm" borderRadius="full" px={3}>
                    {demanda.status}
                  </Badge>
                  <Text fontWeight="bold" fontSize="lg" color="gray.800">
                    {demanda.titulo}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.400" fontWeight="mono">
                  {demanda.id}
                </Text>
              </HStack>

              <Text color="gray.600" mb={4}>
                {demanda.descricao}
              </Text>

              <HStack justify="space-between" fontSize="sm" color="gray.500" pt={3} borderTop="1px solid" borderColor="gray.50">
                <HStack gap={4}>
                  <HStack gap={1.5}>
                    <Icon as={FiMapPin} color="red.400" />
                    <Text>{demanda.local}</Text>
                  </HStack>
                  <HStack gap={1.5}>
                    <Icon as={FiClock} color="blue.400" />
                    <Text>{demanda.data}</Text>
                  </HStack>
                </HStack>
                <Badge variant="outline" colorPalette="gray" size="sm">
                  {demanda.categoria}
                </Badge>
              </HStack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
