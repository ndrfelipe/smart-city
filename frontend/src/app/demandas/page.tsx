'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  NativeSelect,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useDemandStore } from '@/store/demandStore';
import { Demanda } from '@/services/api';

const STATUS_OPTIONS: Demanda['status'][] = ['Em análise', 'Em andamento', 'Resolvido'];

const STATUS_COLOR: Record<Demanda['status'], string> = {
  'Em análise': 'yellow',
  'Em andamento': 'blue',
  Resolvido: 'green',
};

export default function Demandas() {
  const { demandas, isLoading, error, fetchDemandas, updateStatusDemanda } = useDemandStore();
  const [pendingStatusById, setPendingStatusById] = useState<Record<string, Demanda['status']>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDemandas();
  }, [fetchDemandas]);

  function handleSelectStatus(id: string, status: Demanda['status']) {
    setPendingStatusById((prev) => ({ ...prev, [id]: status }));
  }

  async function handleUpdateStatus(demanda: Demanda) {
    const nextStatus = pendingStatusById[demanda.id] ?? demanda.status;
    if (nextStatus === demanda.status) return;

    setUpdatingId(demanda.id);
    await updateStatusDemanda(demanda.id, nextStatus);
    setUpdatingId(null);
  }

  return (
    <Box py={8} px={6} maxW="1100px" w="full" mx="auto">
      <Heading size="lg" mb={6} color="blue.600">
        Demandas
      </Heading>

      <Box bg="white" borderRadius="lg" p={6} shadow="sm" borderWidth="1px" borderColor="gray.200">
        {isLoading && demandas.length === 0 ? (
          <Flex justify="center" py={12}>
            <Spinner size="lg" color="blue.500" />
          </Flex>
        ) : (
          <Stack gap={4}>
            {demandas.map((demanda) => {
              const selectedStatus = pendingStatusById[demanda.id] ?? demanda.status;
              const hasStatusChanged = selectedStatus !== demanda.status;
              const isUpdatingCurrent = updatingId === demanda.id;

              return (
                <Box key={demanda.id} borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4}>
                  <Flex justify="space-between" align="flex-start" gap={4} wrap="wrap">
                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color="gray.800">
                        {demanda.titulo}
                      </Text>
                      <Text color="gray.600" fontSize="sm" mt={1}>
                        {demanda.descricao}
                      </Text>
                      <Text color="gray.500" fontSize="sm" mt={2}>
                        {demanda.local} • {demanda.categoria}
                      </Text>
                    </Box>

                    <Stack gap={2} minW="230px">
                      <Badge colorPalette={STATUS_COLOR[demanda.status]} alignSelf="flex-start">
                        {demanda.status}
                      </Badge>

                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field
                          value={selectedStatus}
                          onChange={(e) => handleSelectStatus(demanda.id, e.target.value as Demanda['status'])}
                          disabled={isUpdatingCurrent}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>

                      <Button
                        size="sm"
                        colorPalette="blue"
                        onClick={() => handleUpdateStatus(demanda)}
                        disabled={!hasStatusChanged || isUpdatingCurrent}
                        loading={isUpdatingCurrent}
                        loadingText="Atualizando"
                      >
                        Atualizar status
                      </Button>
                    </Stack>
                  </Flex>
                </Box>
              );
            })}

            {!isLoading && demandas.length === 0 && (
              <Text color="gray.500" textAlign="center" py={6}>
                Nenhuma demanda cadastrada no momento.
              </Text>
            )}

            {error && (
              <Text color="red.500" fontSize="sm" textAlign="center" pt={2}>
                {error}
              </Text>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}