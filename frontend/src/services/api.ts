
//Estrutura da interface

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  local: string;
  status: 'Pendente' | 'Em andamento' | 'Resolvido';
  data: string;
}

// Omitimos id, status e data, pois a API quem vai gerar isso ao criar
export type CriarDemandaDTO = Omit<Demanda, 'id' | 'status' | 'data'>;

let demandasMock: Demanda[] = [
  {
    id: 'CIV-2938',
    titulo: 'Poste apagado',
    descricao: 'Poste apagado há 3 dias na Rua das Flores.',
    categoria: 'Iluminação',
    local: 'Rua das Flores, Centro',
    status: 'Pendente',
    data: '2026-03-25',
  },
  {
    id: 'CIV-2940',
    titulo: 'Reparo asfáltico',
    descricao: 'Reparo asfáltico emergencial na via.',
    categoria: 'Obras',
    local: 'Av. Central',
    status: 'Em andamento',
    data: '2026-03-26',
  },
  {
    id: 'CIV-2941',
    titulo: 'Acúmulo de lixo',
    descricao: 'Acúmulo de resíduos sólidos em via pública.',
    categoria: 'Lixo',
    local: 'Praça da Matriz',
    status: 'Resolvido',
    data: '2026-03-20',
  }
];

// SUA FAKE API COMPLETA
export const api = {
  // 1. Buscar todas
  getDemandas: async (): Promise<Demanda[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...demandasMock]); // Retorna uma cópia do array
      }, 1000); 
    });
  },

  // 2. Criar uma nova
  addDemanda: async (dados: CriarDemandaDTO): Promise<Demanda> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const novaDemanda: Demanda = {
          ...dados,
          id: `CIV-${Math.floor(Math.random() * 10000)}`,
          status: 'Pendente',
          data: new Date().toISOString().split('T')[0], // Pega a data de hoje no formato YYYY-MM-DD
        };
        demandasMock = [novaDemanda, ...demandasMock]; // Salva no Mock
        resolve(novaDemanda);
      }, 1000);
    });
  },

  // 3. Atualizar status
  updateStatus: async (id: string, novoStatus: Demanda['status']): Promise<Demanda> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = demandasMock.findIndex(d => d.id === id);
        if (index === -1) return reject(new Error('Demanda não encontrada'));

        demandasMock[index] = { ...demandasMock[index], status: novoStatus };
        resolve(demandasMock[index]);
      }, 800); 
    });
  }
};