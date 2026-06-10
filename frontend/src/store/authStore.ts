import { create } from 'zustand';
import { User } from '@/types/User';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  // Mantendo funções de simulação para visualização
  loginAsCidadao: () => void;
  loginAsGestor: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user, accessToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  loginAsCidadao: () => set({ 
    user: { id: 'USR-001', name: 'Ana Maria', role: 'CITIZEN', email: 'ana.maria@exemplo.com', createdAt: new Date().toISOString() },
    isAuthenticated: true 
  }),

  loginAsGestor: () => set({ 
    user: { id: 'USR-999', name: 'Joao Silva', role: 'MANAGER', email: 'joao.silva@gestao.pe.gov.br', createdAt: new Date().toISOString() },
    isAuthenticated: true 
  }),
}));
