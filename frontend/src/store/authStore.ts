import { create } from 'zustand';
import { User } from '@/types/User';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  initialize: () => void;
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

  initialize: () => {
    if (typeof window === 'undefined') return;
    
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      try {
        set({ user: JSON.parse(storedUser), isAuthenticated: true });
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
  },
}));
