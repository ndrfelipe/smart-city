
import { User } from '@/types/User';
import { Demand, CreateDemandDTO, DemandStatus } from '@/types';

let demandasMock: Demand[] = [
  {
    id: 'CIV-2938',
    title: 'Poste apagado',
    description: 'Poste apagado há 3 dias na Rua das Flores.',
    category: 'PUBLIC_LIGHTING',
    location: 'Rua das Flores, Centro',
    status: 'PENDING',
    userId: '1',
    createdAt: '2026-03-25',
    updatedAt: '2026-03-25',
  },
  {
    id: 'CIV-2940',
    title: 'Reparo asfáltico',
    description: 'Reparo asfáltico emergencial na via.',
    category: 'ROAD_MAINTENANCE',
    location: 'Av. Central',
    status: 'IN_PROGRESS',
    userId: '1',
    createdAt: '2026-03-26',
    updatedAt: '2026-03-26',
  },
  {
    id: 'CIV-2941',
    title: 'Acúmulo de lixo',
    description: 'Acúmulo de resíduos sólidos em via pública.',
    category: 'GARBAGE_COLLECTION',
    location: 'Praça da Matriz',
    status: 'RESOLVED',
    userId: '1',
    createdAt: '2026-03-20',
    updatedAt: '2026-03-20',
  }
];

const usersMock: (User & { password: string })[] = [
  {
    id: '1',
    name: 'João Cidadão',
    email: 'joao@email.com',
    role: 'CITIZEN',
    createdAt: '2026-01-01',
    password: '123456'
  },
  {
    id: '2',
    name: 'Maria Gestora',
    email: 'maria@email.com',
    role: 'MANAGER',
    createdAt: '2026-01-01',
    password: '123456'
  }
];

export const api = {
  // Login
  login: async (email: string, password: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = usersMock.find(u => u.email === email && u.password === password);
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          resolve(null);
        }
      }, 500);
    });
  },

  // 1. Buscar todas
  getDemandas: async (): Promise<Demand[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...demandasMock]); // Retorna uma cópia do array
      }, 1000); 
    });
  },

  // 2. Criar uma nova
  addDemanda: async (dados: CreateDemandDTO): Promise<Demand> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novaDemanda: Demand = {
          ...dados,
          id: `CIV-${Math.floor(Math.random() * 10000)}`,
          status: 'PENDING',
          userId: '1', // Mocking current user
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        demandasMock = [novaDemanda, ...demandasMock]; // Salva no Mock
        resolve(novaDemanda);
      }, 1000);
    });
  },

  // 3. Atualizar status
  updateStatus: async (id: string, novoStatus: DemandStatus): Promise<Demand> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = demandasMock.findIndex(d => d.id === id);
        if (index === -1) return reject(new Error('Demanda não encontrada'));

        demandasMock[index] = { 
          ...demandasMock[index], 
          status: novoStatus,
          updatedAt: new Date().toISOString()
        };
        resolve(demandasMock[index]);
      }, 800); 
    });
  }
};