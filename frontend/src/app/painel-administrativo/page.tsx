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
import { api, Demanda } from '@/services/api';

const STATUS_OPTIONS: Demanda['status'][] = ['Em análise', 'Em andamento', 'Resolvido'];

const STATUS_COLOR: Record<Demanda['status'], string> = {
  'Em análise': 'yellow',
  'Em andamento': 'blue',
  Resolvido: 'green',
};

export default function PainelAdministrativoPage() {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tudo' | Demanda['status']>('Tudo');
  const [categoryFilter, setCategoryFilter] = useState('Tudo');
  const [pendingStatusById, setPendingStatusById] = useState<Record<string, Demanda['status']>>({});
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

  async function handleUpdateStatus(demanda: Demanda) {
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
    () => Array.from(new Set(demandas.map((demanda) => demanda.categoria))).sort(),
    [demandas]
  );

  const filteredDemandas = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return demandas.filter((demanda) => {
      const matchesSearch =
        !termo ||
        [
          demanda.id,
          demanda.titulo,
          demanda.descricao,
          demanda.categoria,
          demanda.local,
          demanda.status,
          demanda.data,
        ]
          .join(' ')
          .toLowerCase()
          .includes(termo);

      const matchesStatus = statusFilter === 'Tudo' || demanda.status === statusFilter;
      const matchesCategory = categoryFilter === 'Tudo' || demanda.categoria === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [demandas, search, statusFilter, categoryFilter]);

  const totals = useMemo(
    () => ({
      total: demandas.length,
      emAnalise: demandas.filter((demanda) => demanda.status === 'Em análise').length,
      emAndamento: demandas.filter((demanda) => demanda.status === 'Em andamento').length,
      resolvidas: demandas.filter((demanda) => demanda.status === 'Resolvido').length,
    }),
    [demandas]
  );

  return (
    <Box py={8} px={[4, 6, 8]} maxW="1200px" mx="auto">
      <Box mb={6}>
        <Heading size="lg" color="blue.600">
          Painel Administrativo
        </Heading>
        <Text color="gray.600" mt={2} maxW="3xl">
          Aqui você visualiza todas as demandas cadastradas, filtra por status e categoria, e atualiza o andamento diretamente.
        </Text>
      </Box>

      <Stack direction={['column', 'row']} spacing={4} mb={6}>
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
            Em análise
          </Text>
          <Heading size="md" color="yellow.600">
            {totals.emAnalise}
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
          onChange={(event) => setStatusFilter(event.target.value as 'Tudo' | Demanda['status'])}
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
          <option value="Em análise">Em análise</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Resolvido">Resolvido</option>
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
              {categoria}
            </option>
          ))}
        </select>

        <Button
          colorScheme="gray"
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
              <Button size="sm" colorScheme="blue" onClick={fetchDemandas}>
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
                              {demanda.titulo}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {demanda.descricao}
                            </Text>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                            <Badge colorScheme="purple" variant="subtle">
                              {demanda.categoria}
                            </Badge>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>{demanda.local}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                            <Badge colorScheme={STATUS_COLOR[demanda.status]} variant="subtle">
                              {demanda.status}
                            </Badge>
                          </td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>{new Date(demanda.data).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                            <Flex direction="column" gap={2}>
                              <select
                                value={selectedStatus}
                                onChange={(event) =>
                                  setPendingStatusById((prev) => ({
                                    ...prev,
                                    [demanda.id]: event.target.value as Demanda['status'],
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
                                    {status}
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleUpdateStatus(demanda)}
                                isLoading={isUpdating}
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
