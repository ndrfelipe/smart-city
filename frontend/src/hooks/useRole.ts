'use client'; 
import { useAuthStore } from '@/store/authStore';
 
export type UserRole = 'cidadao' | 'gestor' | 'servidor';
 
export function useRole() {
  const user = useAuthStore((state) => state.user);
  const role = (user?.role ?? 'cidadao') as UserRole;
 
  return {
    role,
    isCidadao: role === 'cidadao',
    isGestor:  role === 'gestor',
    isServidor: role === 'servidor',
    isStaff:   role === 'gestor' || role === 'servidor',
  };
}
 