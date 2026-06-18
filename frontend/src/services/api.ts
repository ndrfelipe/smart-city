import { User } from '@/types/User';
import { Demand, CreateDemandDTO } from '@/types/Demand';
import { DemandStatus } from '@/types/Status';
import apiClient from './apiClient';

export const api = {

  // ------------------------------------------------------------------ //
  //  AUTH                                                                //
  // ------------------------------------------------------------------ //
  auth: {
    login: async (email: string, password: string): Promise<{ access_token: string; refresh_token: string; user: User }> => {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data.data;
    },

    register: async (username: string, email: string, password: string): Promise<User> => {
      const response = await apiClient.post('/auth/register', { username, email, password });
      return response.data.data;
    },

    logout: async (): Promise<void> => {
      await apiClient.get('/auth/logout');
    },

    // Não está implementado ainda
    getMe: async (): Promise<User> => {
      const response = await apiClient.get('/auth/me');
      return response.data.data;
    },

    // Não está implementado ainda
    updateProfile: async (dados: Partial<User & { password?: string }>): Promise<User> => {
      const payload: Record<string, unknown> = { ...dados };
      if (dados.name) {
        payload.username = dados.name;
        delete payload.name;
      }
      const response = await apiClient.patch('/auth/update', payload);
      return response.data.data;
    },

    // Não está implementado ainda - O role é trocado por enquanto via req direta à api.
    updateUserRole: async (userId: string, role: 'cidadao' | 'gestor' | 'servidor'): Promise<User> => {
      const response = await apiClient.patch(`/auth/users/${userId}/role`, { role });
      return response.data.data;
    },
  },

  // ------------------------------------------------------------------ //
  //  DEMANDAS                                                            //
  // ------------------------------------------------------------------ //
  demandas: {
    getAll: async (): Promise<Demand[]> => {
      const response = await apiClient.get('/api/demandas');
      return response.data.data.demandas;
    },

    create: async (dados: CreateDemandDTO): Promise<Demand> => {
      const payload = {
        titulo:     dados.title,
        descricao:  dados.description,
        categoria:  dados.category,
        localizacao: dados.location,
        prioridade: 'media', // feature em desenvolvimento
      };
      const response = await apiClient.post('/api/demandas', payload);
      return response.data.data.demanda;
    },

    updateStatus: async (id: string, novoStatus: DemandStatus): Promise<Demand> => {
      const response = await apiClient.patch(`/api/demandas/${id}`, { status: novoStatus });
      return response.data.data.demanda;
    },
  },
};