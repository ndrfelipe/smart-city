export type UserRole = 'CITIZEN' | 'MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}