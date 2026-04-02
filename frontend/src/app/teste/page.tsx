'use client'; // Muito importante no Next.js para usar Hooks como o Zustand

import { useEffect } from 'react';
import { useDemandStore } from '../../store/demandStore'; // Ajuste o caminho se precisar

export default function TesteZustand() {
  // Puxando tudo do nosso "cofre"
  const { 
    demandas, 
    isLoading, 
    error, 
    fetchDemandas, 
    addDemanda, 
    updateStatusDemanda 
  } = useDemandStore();

  // Action 1: Busca as demandas assim que a tela carregar
  useEffect(() => {
    fetchDemandas();
  }, [fetchDemandas]);

  // Action 2: Função para testar a adição
  const handleCriarNovaDemanda = () => {
    addDemanda({
      titulo: 'Semáforo quebrado',
      descricao: 'O semáforo do cruzamento está piscando no amarelo há 2 dias.',
      categoria: 'Trânsito',
      local: 'Av. Paulista com Rua Augusta',
    });
  };

  // Action 3: Função para testar a atualização
  const handleResolverDemanda = (id: string) => {
    updateStatusDemanda(id, 'Resolvido');
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🛠️ Área de Teste do Zustand</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleCriarNovaDemanda}
          style={{ padding: '10px', background: 'blue', color: 'white', cursor: 'pointer' }}
        >
          ➕ Criar Nova Demanda Falsa
        </button>
      </div>

      {/* Mostra mensagem de erro se houver */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Mostra o "Carregando" simulado pelo setTimeout */}
      {isLoading && <h2>Carregando demandas da Fake API... ⏳</h2>}

      {/* Lista as demandas na tela */}
      {!isLoading && demandas.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {demandas.map((demanda) => (
            <li 
              key={demanda.id} 
              style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}
            >
              <h3>[{demanda.id}] {demanda.titulo}</h3>
              <p><strong>Status:</strong> {demanda.status}</p>
              <p><strong>Local:</strong> {demanda.local}</p>
              
              {/* Botão para testar a mudança de status */}
              {demanda.status !== 'Resolvido' && (
                <button 
                  onClick={() => handleResolverDemanda(demanda.id)}
                  style={{ padding: '5px 10px', background: 'green', color: 'white', cursor: 'pointer' }}
                >
                  ✅ Marcar como Resolvido
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}