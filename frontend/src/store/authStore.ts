import { create } from 'zustand';

// Perfis definidos no manual do professor
export type UserRole = 'Cidadão' | 'Gestor' | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // Funções para simular a troca de perfil 
  loginAsCidadao: () => void;
  loginAsGestor: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Iniciamos simulando Ana Maria (Cidadã)
  user: { 
    id: 'USR-001', 
    name: 'Ana Maria', 
    role: 'Cidadão',
    email: 'ana.maria@exemplo.com' 
  },
  isAuthenticated: true,

  loginAsCidadao: () => set({ 
    user: { id: 'USR-001', name: 'Ana Maria', role: 'Cidadão', email: 'ana.maria@exemplo.com' },
    isAuthenticated: true 
  }),

  loginAsGestor: () => set({ 
    user: { id: 'USR-999', name: 'Joao Silva', role: 'Gestor', email: 'joao.silva@gestao.pe.gov.br' },
    isAuthenticated: true 
  }),

  logout: () => set({ user: null, isAuthenticated: false }),
}));