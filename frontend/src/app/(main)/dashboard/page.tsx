"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import { api } from "@/services/api";
import { Demand, DemandStatus } from "@/types";
import { AppCard } from "@/components/ui/AppCard";

// --- SUB-COMPONENTES DE UI ---

const StatCard = ({ title, value, label, icon: Icon, badge, color }: any) => (
  <AppCard>
    <Flex justify="space-between" align="start">
      <Box>
        <HStack gap={2} mb={2}>
          <Box
            p={1.5}
            borderRadius="md"
            bg={`${color}.50`}
            color={`${color}.600`}
          >
            <Icon />
          </Box>

          <Text fontSize="xs" color="gray.500" fontWeight="bold">
            {title}
          </Text>
        </HStack>

        <Text fontSize="3xl" fontWeight="bold" color="gray.900">
          {value}
        </Text>

        <Text fontSize="xs" color="gray.400" mt={1}>
          {label}
        </Text>
      </Box>

      {badge && (
        <Badge colorPalette={color} variant="solid" borderRadius="full">
          {badge}
        </Badge>
      )}
    </Flex>
  </AppCard>
);

// --- HELPERS ---

const getStatusColor = (status: DemandStatus) => {
  const map: Record<string, string> = { 
    PENDING: "orange", 
    IN_PROGRESS: "blue", 
    RESOLVED: "green",
    REJECTED: "red"
  };
  return map[status] || "gray";
};

const getStatusLabel = (status: DemandStatus) => {
  const map: Record<string, string> = {
    PENDING: "Pendente",
    IN_PROGRESS: "Em andamento",
    RESOLVED: "Resolvido",
    REJECTED: "Rejeitado"
  };
  return map[status] || status;
};

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    ROAD_MAINTENANCE: "Manutenção de Rua",
    PUBLIC_LIGHTING: "Iluminação Pública",
    GARBAGE_COLLECTION: "Coleta de Lixo",
    SANITATION: "Saneamento",
    INSPECTION: "Fiscalização",
    OTHER: "Outros",
  };
  return map[category] || category;
};

// --- ICONS ---
const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconTrend = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M22 7L13.5 15.5L8.5 10.5L2 17" />
  </svg>
);

const IconClock = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const IconAlert = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
    <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// --- COMPONENTE PRINCIPAL ---

export default function DashboardPage() {
  const [demandas, setDemandas] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getDemandas().then((data) => {
      setDemandas(data);
      setLoading(false);
    });
  }, []);

  const demandasFiltradas = useMemo(() => {
    const termo = search.toLowerCase().trim();
    if (!termo) return demandas;

    return demandas.filter((d) =>
      Object.values(d).some((v) => String(v).toLowerCase().includes(termo))
    );
  }, [search, demandas]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = demandas.length;
    const pendentes = demandas.filter((d) => d.status === "PENDING").length;
    const andamento = demandas.filter((d) => d.status === "IN_PROGRESS").length;
    const resolvidas = demandas.filter((d) => d.status === "RESOLVED").length;

    return {
      total,
      emAberto: pendentes + andamento,
      resolvidas,
      pendentes,
      taxa: total > 0 ? Math.round((resolvidas / total) * 100) : 0,
    };
  }, [demandas]);

  // Categorias
  const categoriasData = useMemo(() => {
    const count: Record<string, number> = {};

    demandas.forEach((d) => {
      count[d.category] = (count[d.category] || 0) + 1;
    });

    return Object.entries(count)
      .map(([name, qty]) => ({
        name,
        qty,
        percent:
          demandas.length > 0 ? Math.round((qty / demandas.length) * 100) : 0,
      }))
      .sort((a, b) => b.qty - a.qty);
  }, [demandas]);

  // 📊 Gráfico real: demandas por mês
  const demandasPorMes = useMemo(() => {
    const meses = [
      "JAN",
      "FEV",
      "MAR",
      "ABR",
      "MAI",
      "JUN",
      "JUL",
      "AGO",
      "SET",
      "OUT",
      "NOV",
      "DEZ",
    ];

    const mapa: Record<number, number> = {};

    demandas.forEach((d) => {
      const date = new Date(d.createdAt);
      const mesIndex = date.getMonth();
      mapa[mesIndex] = (mapa[mesIndex] || 0) + 1;
    });

    const hoje = new Date();
    const mesAtual = hoje.getMonth();

    return Array.from({ length: 6 }).map((_, i) => {
      const idx = (mesAtual - (5 - i) + 12) % 12;

      return {
        month: meses[idx],
        value: mapa[idx] || 0,
      };
    });
  }, [demandas]);

  const maxBar = Math.max(...demandasPorMes.map((b) => b.value), 1);

  if (loading) {
    return (
      <Flex h="80vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box py={5} px={6}>
      {/* HEADER LOCAL INTERNO (OPCIONAL) */}
      <Box className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-100 px-8 md:px-20 py-4">
        <Flex justify="center" align="center" gap={6}>
          <Box flex="1" maxW="780px" mx="auto">
            <Box position="relative">
              <Box
                position="absolute"
                left="14px"
                top="50%"
                transform="translateY(-50%)"
                color="gray.400"
              >
                <SearchIcon />
              </Box>

              <Input
                placeholder="Buscar em todo o sistema..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                pl="44px"
                py={6}
                bg="white"
                borderRadius="full"
                border="1px solid"
                borderColor="gray.200"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3b82f6",
                }}
                mb={5}
              />
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* CONTEÚDO */}
      <Box className="px-8 md:px-20 py-8">
        {/* ESPAÇO ENTRE PESQUISA E TITULO */}
        <Box mt={10} />

        {/* TITULO MAIS PRA ESQUERDA */}
        <VStack align="start" gap={2} mb={10} pl={1}>
          <Heading size="2xl" fontWeight="extrabold" color="gray.800">
            Dashboard
          </Heading>

          <Text color="gray.500" fontSize="md" fontWeight="medium">
            Gerenciamento em tempo real das demandas da cidade.
          </Text>
        </VStack>

        {/* CARDS */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={10}>
          <StatCard
            title="Total Geral"
            value={stats.total}
            label="Demandas totais"
            icon={IconTrend}
            color="blue"
            badge="+12%"
          />

          <StatCard
            title="SLA Médio"
            value="18.5h"
            label="Tempo de resposta"
            icon={IconClock}
            color="orange"
            badge="-4h"
          />

          <StatCard
            title="Em Aberto"
            value={stats.emAberto}
            label="Aguardando ação"
            icon={IconAlert}
            color="red"
            badge={`${stats.pendentes} críticos`}
          />

          <StatCard
            title="Resolução"
            value={`${stats.taxa}%`}
            label="Eficiência mensal"
            icon={IconCheck}
            color="green"
          />
        </SimpleGrid>

        {/* GRID PRINCIPAL */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* GRÁFICO */}
          <GridItem>
            <AppCard
              title="Evolução de Demandas"
              subtitle="Últimos 6 meses"
            >
              <Flex align="end" justify="space-between" gap={4} mt={10} h="240px">
                {demandasPorMes.map((item) => {
                  const heightPx = Math.round((item.value / maxBar) * 180);

                  return (
                    <Box key={item.month} flex="1" textAlign="center">
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        fontWeight="bold"
                        mb={2}
                      >
                        {item.value}
                      </Text>

                      {/* BARRA DO GRÁFICO */}
                      <Box
                        height={`${Math.max(heightPx, 18)}px`}
                        bg="blue.500"
                        borderRadius="xl"
                        boxShadow="lg"
                        transition="0.2s"
                        _hover={{ bg: "blue.600", transform: "scale(1.04)" }}
                      />

                      <Text
                        fontSize="xs"
                        mt={3}
                        fontWeight="bold"
                        color="gray.600"
                      >
                        {item.month}
                      </Text>
                    </Box>
                  );
                })}
              </Flex>
            </AppCard>
          </GridItem>

          {/* CATEGORIAS */}
          <GridItem>
            <AppCard title="Distribuição" subtitle="Categorias mais frequentes">
              <VStack gap={5} mt={6} align="stretch">
                {categoriasData.map((cat) => (
                  <Box key={cat.name}>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        {getCategoryLabel(cat.name)}
                      </Text>

                      <Text fontSize="sm" color="blue.600" fontWeight="bold">
                        {cat.percent}%
                      </Text>
                    </Flex>

                    <Box
                      h="8px"
                      bg="gray.100"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <Box
                        h="full"
                        bg="blue.500"
                        w={`${cat.percent}%`}
                        borderRadius="full"
                      />
                    </Box>
                  </Box>
                ))}
              </VStack>
            </AppCard>
          </GridItem>
        </Grid>

        {/* LISTA */}
        <Box mt={6}>
          <AppCard
            title="Demandas Recentes"
            subtitle={`Exibindo ${demandasFiltradas.length} demanda(s)`}
          >
            <VStack gap={3} align="stretch" mt={4}>
              {demandasFiltradas.map((d) => (
                <Flex
                  key={d.id}
                  p={4}
                  bg="gray.50"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor="gray.100"
                  align="center"
                  justify="space-between"
                  _hover={{
                    bg: "white",
                    shadow: "md",
                    transform: "translateY(-1px)",
                  }}
                  transition="all 0.2s"
                >
                  <HStack gap={4}>
                    <Box
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg={`${getStatusColor(d.status)}.500`}
                    />

                    <Box>
                      <Text fontWeight="bold" color="gray.800">
                        {d.title}
                      </Text>

                      <Text fontSize="xs" color="gray.500">
                        {d.location} • {getCategoryLabel(d.category)}
                      </Text>
                    </Box>
                  </HStack>

                  <Badge
                    colorPalette={getStatusColor(d.status)}
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="lg"
                  >
                    {getStatusLabel(d.status)}
                  </Badge>
                </Flex>
              ))}
            </VStack>
          </AppCard>
        </Box>

        <Box h="50px" />
      </Box>
    </Box>
  );
}