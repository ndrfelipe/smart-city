export type UserRole = 'cidadao' | 'gestor' | 'servidor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}