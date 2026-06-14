describe('ATDD — Cidadão abre nova demanda', () => {
beforeEach(() => {

cy.window().then((win) => {
win.localStorage.setItem('user', JSON.stringify({
id: '1',
name: 'João Cidadão',
email: 'joao@email.com',
role: 'CITIZEN'
}));
});
});
it('deve permitir ao cidadão registrar uma demanda com todos os campos', () => {
cy.visit('/demandas/nova');

cy.get('input[placeholder*="Poste apagado"]')
.type('Buraco na calçada da Rua das Flores');

cy.get('select').first()
.select('ROAD_MAINTENANCE');

cy.get('textarea')
.type('Há um buraco de aproximadamente 30cm que oferece risco de queda.');

cy.get('select').eq(1)
.select('Rua das Flores, Centro');

cy.contains('button', 'Cadastrar Demanda').click();

cy.url().should('include', '/demandas');

cy.contains('Buraco na calçada da Rua das Flores').should('be.visible');
});
it('deve bloquear envio quando campos obrigatórios estão vazios', () => {
cy.visit('/demandas/nova');
cy.contains('button', 'Cadastrar Demanda').click();

cy.contains('Título é obrigatório').should('be.visible');
cy.contains('Selecione uma categoria').should('be.visible');
cy.contains('Descrição é obrigatória').should('be.visible');

cy.url().should('include', '/demandas/nova');
});
});
