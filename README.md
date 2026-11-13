# Smart City - Plataforma de Gestão de Demandas Urbanas

Bem-vindos ao repositório da nossa Plataforma de Gestão de Demandas Urbanas! Este projeto é um MVP (Minimum Viable Product) focado em centralizar o registro, acompanhamento e gestão de solicitações públicas (como buracos em vias, iluminação e saneamento), conectando cidadãos e gestores públicos.

O projeto é composto por um front-end em Next.js e um back-end em Flask (Python).

## 1 Tecnologias Utilizadas

### 1.1 Front-end
* **Framework:** Next.js (App Router) com TypeScript
* **Estilização:** Tailwind CSS + Chakra UI
* **Gerenciamento de Estado:** Zustand
* **Dados:** Fake API (Mock) / Integração com Back-end

### 1.2 Back-end
* **Framework:** Flask (Python)
* **Autenticação:** JWT (JSON Web Tokens)
* **Banco de Dados:** PostgreSQL

## 2 Como rodar o projeto localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento na sua máquina.

### 2.1 Pré-requisitos
* Node.js (v24.14.0)
* Python (v3.10+)
* Git instalado

### 2.2 Configuração do Back-end

1. Acesse a pasta do back-end:
   ```bash
   cd backend
   ```
2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   # No Windows:
   .\venv\Scripts\activate
   # No Linux/Mac:
   source venv/bin/activate
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na pasta `backend` (ou copie o `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Preencha as variáveis conforme detalhado na seção [Variáveis de Ambiente](#variáveis-de-ambiente).

5. Inicie o servidor:
   ```bash
   python app.py
   ```

### 2.3 Configuração do Front-end

1. Acesse a pasta do front-end:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra http://localhost:3000 no seu navegador para ver a aplicação rodando.

## 3 Variáveis de Ambiente (Back-end)

As seguintes variáveis devem ser configuradas no arquivo `backend/.env`:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o banco de dados PostgreSQL. | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY` | Chave secreta usada pelo Flask para assinar sessões e outros dados. | `sua_chave_secreta_aqui` |
| `JWT_SECRET` | Chave secreta específica para a geração e validação de tokens JWT. | `sua_chave_jwt_secreta_aqui` |
| `UPLOAD_FOLDER` | (Opcional) Pasta onde as fotos das demandas são salvas. Padrão: `backend/uploads/demandas` (ignorada pelo git). | `/var/data/smartcity/fotos` |
| `PUSH_NOTIFICATIONS_DISABLED` | (Opcional) `1` desliga o envio de notificações push (Expo Push API). | `1` |
| `MAX_UPLOAD_BYTES` | (Opcional) Tamanho máximo do upload de foto, em bytes. Padrão: 8 MB. | `8388608` |

## 4 Estrutura do Projeto

Nossa organização de pastas é baseada em responsabilidades para evitar conflitos:

### Front-end (/frontend)
- /src/app: Rotas e páginas da aplicação (Next.js App Router).
- /src/components: Componentes reutilizáveis (UI, formulários, layout).
- /src/services: Configuração e chamadas para API.
- /src/store: Gerenciamento de estado global com Zustand.
- /src/types: Definições de interfaces e tipos do TypeScript.

### Back-end (/backend)
Por favor, acessar a sessão 8 (Estrutura geral da API).

---

## 5 Localização da Documentação

A documentação completa da API pode ser encontrada no link: https://documenter.getpostman.com/view/47073825/2sBXwvHTeT

---

## 6 Principais Endpoints Implementados

### 6.1 Autenticação (`/auth`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cria uma nova conta de usuário |
| `POST` | `/auth/login` | Autentica e retorna `access_token` + `refresh_token` |
| `GET` | `/auth/me` | Retorna os dados do usuário logado |
| `PATCH` | `/auth/update` | Atualiza nome (`username`) e/ou senha do próprio usuário (o perfil de acesso não pode ser alterado por aqui) |
| `POST` | `/auth/refresh` | Renova o `access_token` usando o `refresh_token` |
| `GET` | `/auth/logout` | Invalida o token e encerra a sessão (e desativa as notificações do aparelho) |
| `PUT` | `/auth/push-token` | Registra o Expo push token do aparelho (`{"token": "ExponentPushToken[...]"}`) para receber notificações |
| `DELETE` | `/auth/push-token` | Desativa as notificações do aparelho |

### 6.2 Gerenciamento de Demandas (`/api/demandas`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/demandas` | Lista as demandas com paginação, busca (`q`: título, descrição ou localização, sem diferenciar acentos) e filtros (`status`, `categoria`, `prioridade`, `regiao`) |
| `POST` | `/api/demandas` | Cidadão cria uma nova solicitação urbana (`regiao` opcional: `CENTRO`, `NORTE`, `SUL`, `LESTE`, `OESTE`) |
| `GET` | `/api/demandas/metricas` | **Somente gestor.** Indicadores do painel: total, distribuição por status/categoria/região, tempo médio de atendimento (h) e taxa de resolução |
| `GET` | `/api/demandas/{id}` | Retorna os detalhes de uma demanda específica |
| `PATCH` | `/api/demandas/{id}` | Atualiza a demanda; quando o gestor muda o `status`, o autor recebe uma notificação push e a conclusão/recusa grava `resolvedAt` |
| `DELETE` | `/api/demandas/{id}` | Remove uma demanda (respeitando regras de role) |
| `PUT` | `/api/demandas/{id}/foto` | Envia/substitui a foto da demanda (`multipart/form-data`, campo `foto`) |
| `GET` | `/api/demandas/fotos/{arquivo}` | Serve a imagem (use o `photoUrl` retornado nas demandas) |

---


## 7 Métodos HTTP Utilizados

A API segue os princípios REST, utilizando os métodos HTTP de acordo com a semântica de cada operação:

| Método | Uso | Exemplo na API |
|--------|-----|----------------|
| `GET` | Leitura de dados | Listar demandas, obter perfil, logout |
| `POST` | Criação de recursos | Registrar usuário, fazer login, criar demanda |
| `PATCH` | Atualização parcial | Atualizar perfil/role, atualizar status de demanda |
| `DELETE` | Remoção de recursos | Deletar demanda urbana |

---

## 8 Estrutura Geral da API

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

### 8.1 Padrão de Resposta

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

### 8.2 Regras de Autorização por Role

- **CITIZEN (Cidadão):** cria demandas, edita e exclui apenas as próprias (enquanto pendentes), visualiza o próprio histórico.
- **Camada de segurança:** `required_token` valida o JWT e `required_role('gestor')` restringe rotas por perfil (ex.: `/api/demandas/metricas` responde 403 a cidadãos).
- **MANAGER (Gestor):** atualiza status e prioridade de qualquer demanda, não pode excluir demandas já concluídas.
- O cadastro público (`POST /auth/register`) sempre cria **Cidadãos**. Contas de **Gestor Público** são criadas (ou promovidas) por quem administra o servidor:
  ```bash
  cd backend
  flask --app config.config:create_app create-gestor --email gestor@prefeitura.gov.br --nome "Gestor" --senha "senha123"
  # Promover uma conta existente / voltar para cidadão:
  flask --app config.config:create_app create-gestor --email fulano@email.com
  flask --app config.config:create_app set-role fulano@email.com cidadao
  ```

---
