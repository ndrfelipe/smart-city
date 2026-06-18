// store/demandStore.ts

import { create } from 'zustand';
import { api } from '../services/api';
import { Demand, CreateDemandDTO } from '@/types/Demand';
import { DemandStatus } from '@/types/Status';

interface DemandState {
  demandas: Demand[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDemandas: () => Promise<void>;
  addDemanda: (data: CreateDemandDTO) => Promise<void>;
  updateStatusDemanda: (id: string, newStatus: DemandStatus) => Promise<void>;
}

export const useDemandStore = create<DemandState>((set, get) => ({
  demandas: [],
  isLoading: false,
  error: null,

  fetchDemandas: async () => {
    set({ isLoading: true, error: null });
    try {
      // Chama a SUA Fake API
      const dados = await api.demandas.getAll();
      
      set({ demandas: dados, isLoading: false });
    } catch (err) {
      console.error("Falha ao buscar demandas:", err);
      set({ error: 'Erro ao carregar demandas', isLoading: false });
    }
  },

  addDemanda: async (dados) => {
    set({ isLoading: true, error: null });
    try {
      const novaDemandaCriada = await api.demandas.create(dados);

      set((state) => ({
        demandas: [novaDemandaCriada, ...state.demandas],
        isLoading: false
      }));
    } catch (err) {
      console.error("Falha ao criar demanda:", err);
      set({ error: 'Erro ao criar demanda', isLoading: false });
    }
  },

  updateStatusDemanda: async (id, newStatus) => {
    set({ isLoading: true, error: null });
    try {
      const demandaAtualizada = await api.demandas.updateStatus(id, newStatus);

      set((state) => ({
        demandas: state.demandas.map((demanda) =>
          demanda.id === id ? demandaAtualizada : demanda
        ),
        isLoading: false
      }));
    } catch (err) {
      console.error("Falha ao atualizar status:", err);
      set({ error: 'Erro ao atualizar status', isLoading: false });
    }
  }
}));