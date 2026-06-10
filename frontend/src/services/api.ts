import { User } from '@/types/User';
import { Demand, CreateDemandDTO } from '@/types/Demand';
import { DemandStatus } from '@/types/Status';
import apiClient from './apiClient';

export const api = {
  // Login
  login: async (email: string, password: string): Promise<{ access_token: string; refresh_token: string; user: User }> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data.data;
  },

  // Registro
  register: async (username: string, email: string, password: string): Promise<User> => {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data.data;
  },

  // Buscar usuário atual
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  // 1. Buscar todas as demandas
  getDemandas: async (): Promise<Demand[]> => {
    const response = await apiClient.get('/api/demandas');
    return response.data.data.demandas;
  },

  // 2. Criar uma nova demanda
  addDemanda: async (dados: CreateDemandDTO): Promise<Demand> => {
    // Mapeando campos do front para o back (provisório até unificar)
    const payload = {
      titulo: dados.title,
      descricao: dados.description,
      categoria: dados.category,
      localizacao: dados.location,
      prioridade: 'media' // Valor padrão pois o front não envia
    };
    const response = await apiClient.post('/api/demandas', payload);
    return response.data.data.demanda;
  },

  // 3. Atualizar status
  updateStatus: async (id: string, novoStatus: DemandStatus): Promise<Demand> => {
    const response = await apiClient.patch(`/api/demandas/${id}`, { status: novoStatus });
    return response.data.data.demanda;
  }
};
