# Smart City API
**Documentação Técnica — Seção 3**

---

## 3.1 Localização da Documentação

O contrato completo da API está definido em formato OpenAPI 3.0 e versionado diretamente no repositório:

| Item | Detalhe |
|------|---------|
| **Arquivo** | `backend/swagger.yaml` |
| **Formato** | OpenAPI 3.0 |
| **Como visualizar** | Importar no [Swagger Editor](https://editor.swagger.io) ou no Insomnia/Postman |

O arquivo descreve todos os endpoints, schemas de request/response, códigos de erro e o esquema de autenticação Bearer JWT. Para testá-la localmente, basta subir o backend e importar o `swagger.yaml` em qualquer cliente REST.

---

## 3.2 Principais Endpoints Implementados

### Autenticação (`/auth`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cria uma nova conta de usuário |
| `POST` | `/auth/login` | Autentica e retorna `access_token` + `refresh_token` |
| `GET` | `/auth/me` | Retorna os dados do usuário logado |
| `PATCH` | `/auth/update` | Atualiza perfil ou promove cargo (Admin/Gestor) |
| `POST` | `/auth/refresh` | Renova o `access_token` usando o `refresh_token` |
| `GET` | `/auth/logout` | Invalida o token e encerra a sessão |

### Gerenciamento de Demandas (`/api/demandas`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/demandas` | Lista todas as demandas (com filtros e paginação) |
| `POST` | `/api/demandas` | Cidadão cria uma nova solicitação urbana |
| `GET` | `/api/demandas/{id}` | Retorna os detalhes de uma demanda específica |
| `PATCH` | `/api/demandas/{id}` | Atualiza status ou prioridade da demanda |
| `DELETE` | `/api/demandas/{id}` | Remove uma demanda (respeitando regras de role) |

---

## 3.3 Métodos HTTP Utilizados

A API segue os princípios REST, utilizando os métodos HTTP de acordo com a semântica de cada operação:

| Método | Uso | Exemplo na API |
|--------|-----|----------------|
| `GET` | Leitura de dados | Listar demandas, obter perfil, logout |
| `POST` | Criação de recursos | Registrar usuário, fazer login, criar demanda |
| `PATCH` | Atualização parcial | Atualizar perfil/role, atualizar status de demanda |
| `DELETE` | Remoção de recursos | Deletar demanda urbana |

---

## 3.4 Estrutura Geral da API

A API segue uma arquitetura em camadas inspirada no padrão MVC, separando responsabilidades entre roteamento, controle, regras de negócio e acesso a dados:

| Camada | Pasta | Responsabilidade |
|--------|-------|-----------------|
| Roteamento | `/routes` | Recebe requisições HTTP, mapeia URLs para controllers e aplica middlewares |
| Segurança | `/middlewares` | Valida JWT, extrai usuário autenticado e injeta em `request.current_user` |
| Controle | `/controllers` | Orquestra o fluxo: extrai dados da requisição, aciona schemas e services, devolve resposta padronizada |
| Negócio | `/services` | Concentra todas as regras de negócio (ex.: cidadão só edita a própria demanda, gestor não fecha demanda já resolvida) |
| Validação | `/schemas` | Deserialização (valida input) e serialização (formata output, ocultando campos sensíveis como `password_hash`) via Marshmallow |
| Dados | `/models` | Define tabelas (`users`, `demandas`) e relacionamentos via SQLAlchemy. Contém queries de acesso ao banco |
| Utilitários | `/utils` & `/config` | Funções reutilizáveis (formatação de respostas HTTP padronizadas) e configurações globais (Flask, banco, CORS, registro de rotas) |

### Padrão de Resposta

Todas as respostas da API seguem o mesmo contrato JSON:

| Campo | Descrição |
|-------|-----------|
| `data` | Payload da resposta (objeto, lista ou `null` em caso de erro) |
| `message` | Mensagem descritiva do resultado (ex.: `"Demanda criada com sucesso."`) |
| `status_code` | Código HTTP espelhado no corpo (200, 201, 400, 401, 403, 404, 422, 500) |

```json
{
  "data": { ... },
  "message": "Operação realizada com sucesso",
  "status_code": 200
}
```

### Regras de Autorização por Role

- **CITIZEN (Cidadão):** cria demandas, edita e exclui apenas as próprias (enquanto pendentes), visualiza o próprio histórico.
- **MANAGER (Gestor):** atualiza status e prioridade de qualquer demanda, não pode excluir demandas já concluídas.
- **ADMIN:** pode promover usuários para Gestor via `PATCH /auth/update`.

---

*Documentação gerada com base no contrato OpenAPI 3.0 (`swagger.yaml`) — versão 1.0.0*
