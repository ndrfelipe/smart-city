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

// Dados mockados 
export const demandasMock: Demanda[] = [
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

// Simulação de uma requisição da API
export const api = {
  getDemandas: async (): Promise<Demanda[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(demandasMock);
      }, 1000); 
    });
  },
};