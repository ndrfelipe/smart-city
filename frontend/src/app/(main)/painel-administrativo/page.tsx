'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { api } from '@/services/api';
import { Demand, DemandStatus } from '@/types';

const STATUS_OPTIONS: DemandStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

const STATUS_COLOR: Record<DemandStatus, string> = {
  PENDING: 'yellow',
  IN_PROGRESS: 'blue',
  RESOLVED: 'green',
  REJECTED: 'red',
};

const STATUS_LABEL: Record<DemandStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvido',
  REJECTED: 'Rejeitado',
};

const CATEGORY_LABEL: Record<string, string> = {
  ROAD_MAINTENANCE: 'Manutenção de Vias',
  PUBLIC_LIGHTING: 'Iluminação Pública',
  GARBAGE_COLLECTION: 'Coleta de Lixo',
  SANITATION: 'Saneamento',
  INSPECTION: 'Fiscalização',
  OTHER: 'Outros',
};

export default function PainelAdministrativoPage() {
  const [demandas, setDemandas] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tudo' | DemandStatus>('Tudo');
  const [categoryFilter, setCategoryFilter] = useState('Tudo');
  const [pendingStatusById, setPendingStatusById] = useState<Record<string, DemandStatus>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDemandas();
  }, []);

  async function fetchDemandas() {
    setLoading(true);
    setError('');

    try {
      const data = await api.getDemandas();
      setDemandas(data);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar demandas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(demanda: Demand) {
    const nextStatus = pendingStatusById[demanda.id] ?? demanda.status;
    if (nextStatus === demanda.status) {
      return;
    }

    setUpdatingId(demanda.id);
    try {
      const updated = await api.updateStatus(demanda.id, nextStatus);
      setDemandas((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar status. Tente novamente.');
    } finally {
      setUpdatingId(null);
    }
  }

  const categories = useMemo(
    () => Array.from(new Set(demandas.map((demanda) => demanda.category))).sort(),
    [demandas]
  );

  const filteredDemandas = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return demandas.filter((demanda) => {
      const categoryLabel = CATEGORY_LABEL[demanda.category] || demanda.category;
      const statusLabel = STATUS_LABEL[demanda.status] || demanda.status;

      const matchesSearch =
        !termo ||
        [
          demanda.id,
          demanda.title,
          demanda.description,
          demanda.category,
          categoryLabel,
          demanda.location,
          demanda.status,
          statusLabel,
          demanda.createdAt,
        ]
          .join(' ')
          .toLowerCase()
          .includes(termo);

      const matchesStatus = statusFilter === 'Tudo' || demanda.status === statusFilter;
      const matchesCategory = categoryFilter === 'Tudo' || demanda.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [demandas, search, statusFilter, categoryFilter]);

  const totals = useMemo(
    () => ({
      total: demandas.length,
      pendentes: demandas.filter((demanda) => demanda.status === 'PENDING').length,
      emAndamento: demandas.filter((demanda) => demanda.status === 'IN_PROGRESS').length,
      resolvidas: demandas.filter((demanda) => demanda.status === 'RESOLVED').length,
    }),
    [demandas]
  );

  return (
    <Box py={8} px={[4, 10, 20]} maxW="1600px" mx="auto">
      <Box mb={6}>
        <Heading size="lg" color="blue.600">
          Painel Administrativo
        </Heading>
        <Text color="gray.600" mt={2} maxW="3xl">
          Aqui você visualiza todas as demandas cadastradas, filtra por status e categoria, e atualiza o andamento diretamente.
        </Text>
      </Box>

      <Stack direction={['column', 'row']} gap={4} mb={6}>
        <Box flex={1} bg="white" borderRadius="lg" p={4} shadow="sm" borderWidth="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Total de demandas
          </Text>
          <Heading size="md" color="gray.900">
            {totals.total}
          </Heading>
        </Box>
        <Box flex={1} bg="white" borderRadius="lg" p={4} shadow="sm" borderWidth="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Pendentes
          </Text>
          <Heading size="md" color="yellow.600">
            {totals.pendentes}
          </Heading>
        </Box>
        <Box flex={1} bg="white" borderRadius="lg" p={4} shadow="sm" borderWidth="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Em andamento
          </Text>
          <Heading size="md" color="blue.600">
            {totals.emAndamento}
          </Heading>
        </Box>
        <Box flex={1} bg="white" borderRadius="lg" p={4} shadow="sm" borderWidth="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.500" mb={2}>
            Resolvidas
          </Text>
          <Heading size="md" color="green.600">
            {totals.resolvidas}
          </Heading>
        </Box>
      </Stack>

      <Flex direction={['column', 'row']} gap={3} align="center" mb={4}>
        <Input
          placeholder="Buscar por título, descrição, local, categoria ou código"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          bg="white"
          borderColor="gray.200"
          _focus={{ borderColor: 'blue.400' }}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'Tudo' | DemandStatus)}
          style={{
            maxWidth: '220px',
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            background: 'white',
            fontSize: '14px',
            color: '#4A5568'
          }}
        >
          <option value="Tudo">Todos os status</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{STATUS_LABEL[status]}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          style={{
            maxWidth: '220px',
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            background: 'white',
            fontSize: '14px',
            color: '#4A5568'
          }}
        >
          <option value="Tudo">Todas as categorias</option>
          {categories.map((categoria) => (
            <option key={categoria} value={categoria}>
              {CATEGORY_LABEL[categoria] || categoria}
            </option>
          ))}
        </select>

        <Button
          colorPalette="gray"
          variant="outline"
          onClick={() => {
            setSearch('');
            setStatusFilter('Tudo');
            setCategoryFilter('Tudo');
          }}
        >
          Limpar filtros
        </Button>
      </Flex>

      <Box bg="white" borderRadius="xl" p={4} shadow="sm" borderWidth="1px" borderColor="gray.200">
        {loading ? (
          <Flex justify="center" align="center" minH="220px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : error ? (
          <Text color="red.500" textAlign="center" py={8}>
            {error}
          </Text>
        ) : (
          <>
            <Flex justify="space-between" align="center" mb={4} gap={3} wrap="wrap">
              <Box>
                <Text color="gray.500">Demandas exibidas</Text>
                <Heading size="md" color="gray.900">
                  {filteredDemandas.length} de {demandas.length}
                </Heading>
              </Box>
              <Button size="sm" colorPalette="blue" onClick={fetchDemandas}>
                Atualizar lista
              </Button>
            </Flex>

            {filteredDemandas.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={10}>
                Não encontramos demandas com os filtros aplicados.
              </Text>
            ) : (
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Código', 'Título', 'Categoria', 'Local', 'Status', 'Data', 'Ação'].map((column) => (
                        <th
                          key={column}
                          style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 600, color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDemandas.map((demanda) => {
                      const selectedStatus = pendingStatusById[demanda.id] ?? demanda.status;
                      const isUpdating = updatingId === demanda.id;
                      return (
                        <tr key={demanda.id} style={{ transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontWeight: 600 }}>{demanda.id}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                            <Text fontWeight="bold" color="gray.800">
                              {demanda.title}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {demanda.description}
                            </Text>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                            <Badge colorPalette="purple" variant="subtle">
                              {CATEGORY_LABEL[demanda.category] || demanda.category}
                            </Badge>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>{demanda.location}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                            <Badge colorPalette={STATUS_COLOR[demanda.status]} variant="subtle">
                              {STATUS_LABEL[demanda.status]}
                            </Badge>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>{new Date(demanda.createdAt).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                            <Flex direction="column" gap={2}>
                              <select
                                value={selectedStatus}
                                onChange={(event) =>
                                  setPendingStatusById((prev) => ({
                                    ...prev,
                                    [demanda.id]: event.target.value as DemandStatus,
                                  }))
                                }
                                disabled={isUpdating}
                                style={{
                                  padding: '4px 8px',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  background: 'white'
                                }}
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {STATUS_LABEL[status]}
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                colorPalette="blue"
                                onClick={() => handleUpdateStatus(demanda)}
                                loading={isUpdating}
                                loadingText="Atualizando"
                                disabled={selectedStatus === demanda.status}
                              >
                                Salvar
                              </Button>
                            </Flex>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
