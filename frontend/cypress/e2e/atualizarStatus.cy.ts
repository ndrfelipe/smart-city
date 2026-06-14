describe('ATDD-02 — Gestor atualiza e resolve demanda', () => {
  beforeEach(() => {
    // 1. Simula o login da Maria Gestora salvando os dados no localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: '2',
        name: 'Maria Gestora',
        email: 'maria@email.com',
        role: 'MANAGER'
      }));
    });

    // 2. Cria a demanda mockada respeitando o modelo do seu componente
    cy.intercept('GET', '**/api/demandas*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          title: 'Poste apagado',
          description: 'O poste da rua principal está totalmente apagado.',
          category: 'PUBLIC_LIGHTING',
          location: 'Rua das Flores, Centro',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }
      ]
    }).as('getDemandas');

    // 3. Mock para responder com sucesso ao clique de Salvar (PUT ou POST dependendo do seu service)
    cy.intercept('PUT', '**/api/demandas/*', {
      statusCode: 200,
      body: {
        id: '1',
        title: 'Poste apagado',
        description: 'O poste da rua principal está totalmente apagado.',
        category: 'PUBLIC_LIGHTING',
        location: 'Rua das Flores, Centro',
        status: 'RESOLVED',
        createdAt: new Date().toISOString()
          }
    }).as('updateStatus');
  });

  it('deve permitir ao gestor filtrar por status PENDING no topo do painel', () => {
    cy.visit('http://localhost:3000/painel-administrativo');
    
    // Garante que o painel carregou a demanda mockada
    cy.contains('Poste apagado').should('be.visible');
    
    // Seleciona o filtro do topo usando o valor real do seu código ('PENDING')
    cy.get('select').eq(0).select('PENDING');
  });

  it('deve permitir ao gestor alterar o status e clicar em Salvar', () => {
    cy.visit('http://localhost:3000/painel-administrativo');

    // Procura a linha da tabela nativa <tr> que contém o Poste apagado
    cy.contains('td', 'Poste apagado')
      .closest('tr')
      .within(() => {
        // Encontra o select daquela linha específica e altera para RESOLVED
        cy.get('select').select('RESOLVED');
        
        // Clica no botão Salvar que agora foi habilitado
        cy.contains('button', 'Salvar').click();
      });
  });

  it('deve manter botão Salvar desabilitado se o status não foi alterado', () => {
    cy.visit('http://localhost:3000/painel-administrativo');
    
    cy.contains('td', 'Poste apagado')
      .closest('tr')
      .within(() => {
        // Como o status inicial é PENDING e não mudou, o botão deve estar desativado
        cy.contains('button', 'Salvar').should('be.disabled');
      });
  });
});