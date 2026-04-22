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
import { Demand } from '@/types/Demand';
import { DemandStatus } from '@/types/Status';
import { DemandCategory } from '@/types/Category';


const STATUS_OPTIONS: DemandStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

const STATUS_COLOR: Record<DemandStatus, string> = {
  PENDING: 'yellow',
  IN_PROGRESS: 'blue',
  RESOLVED: 'green',
  REJECTED: 'red',
};

const STATUS_LABELS: Record<DemandStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvido',
  REJECTED: 'Rejeitado',
};

const CATEGORY_LABELS: Record<DemandCategory, string> = {
  ROAD_MAINTENANCE: 'Manutenção de Rua',
  PUBLIC_LIGHTING: 'Iluminação Pública',
  GARBAGE_COLLECTION: 'Coleta de Lixo',
  SANITATION: 'Saneamento',
  INSPECTION: 'Fiscalização',
  OTHER: 'Outros',
};

export default function Demandas() {
  const { demandas, isLoading, error, fetchDemandas, updateStatusDemanda } = useDemandStore();
  const [pendingStatusById, setPendingStatusById] = useState<Record<string, DemandStatus>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDemandas();
  }, [fetchDemandas]);

  function handleSelectStatus(id: string, status: DemandStatus) {
    setPendingStatusById((prev) => ({ ...prev, [id]: status }));
  }

  async function handleUpdateStatus(demanda: Demand) {
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
                        {demanda.title}
                      </Text>
                      <Text color="gray.600" fontSize="sm" mt={1}>
                        {demanda.description}
                      </Text>
                      <Text color="gray.500" fontSize="sm" mt={2}>
                        {demanda.location} • {CATEGORY_LABELS[demanda.category]}
                      </Text>
                    </Box>

                    <Stack gap={2} minW="230px">
                      <Badge colorPalette={STATUS_COLOR[demanda.status]} alignSelf="flex-start">
                        {STATUS_LABELS[demanda.status]}
                      </Badge>

                      <NativeSelect.Root size="sm" disabled={isUpdatingCurrent}>
                        <NativeSelect.Field
                          value={selectedStatus}
                          onChange={(e) => handleSelectStatus(demanda.id, e.target.value as DemandStatus)}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
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