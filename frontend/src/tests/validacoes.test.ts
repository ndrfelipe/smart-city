import { describe, it, expect } from 'vitest';

// ==========================================
// TDD-01: VALIDADOR DE SENHA
// ==========================================
function validarSenha(senha: string, confirmar: string): string | null {
  if (!senha || senha.trim().length === 0) return 'A senha é obrigatória';
  if (senha.length < 6) return 'A senha deve ter no mínimo 6 caracteres';
  if (senha !== confirmar) return 'As senhas não coincidem';
  return null; 
}

describe('validarSenha()', () => {
  it('deve retornar erro quando a senha tem menos de 6 caracteres', () => {
    const resultado = validarSenha('abc', 'abc');
    expect(resultado).toBe('A senha deve ter no mínimo 6 caracteres');
  });

  it('deve retornar null quando a senha é válida', () => {
    const resultado = validarSenha('minhasenha123', 'minhasenha123');
    expect(resultado).toBeNull();
  });
});

// ==========================================
// TDD-02: TRANSIÇÃO DE STATUS
// ==========================================
const transicoesPermitidas: Record<string, string[]> = {
  PENDING: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED', 'PENDING'],
  RESOLVED: [], 
  REJECTED: [], 
};

function podeTransicionar(atual: string, novo: string): boolean {
  return transicoesPermitidas[atual]?.includes(novo) || false;
}

describe('podeTransicionar()', () => {
  it('NÃO deve permitir voltar de RESOLVED para PENDING', () => {
    expect(podeTransicionar('RESOLVED', 'PENDING')).toBe(false);
  });
});