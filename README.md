# Smart City - Plataforma de Gestão de Demandas Urbanas

Bem-vindos ao repositório da nossa Plataforma de Gestão de Demandas Urbanas! Este projeto é um MVP (Minimum Viable Product) focado em centralizar o registro, acompanhamento e gestão de solicitações públicas (como buracos em vias, iluminação e saneamento), conectando cidadãos e gestores públicos.

O projeto é composto por um front-end em Next.js e um back-end em Flask (Python).

## Tecnologias Utilizadas

### Front-end
* **Framework:** Next.js (App Router) com TypeScript
* **Estilização:** Tailwind CSS + Chakra UI
* **Gerenciamento de Estado:** Zustand
* **Dados:** Fake API (Mock) / Integração com Back-end

### Back-end
* **Framework:** Flask (Python)
* **Autenticação:** JWT (JSON Web Tokens)
* **Banco de Dados:** PostgreSQL (Recomendado via `DATABASE_URL`)
* **Cache/Mensageria:** Redis

## Como rodar o projeto localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento na sua máquina.

### Pré-requisitos
* Node.js (v24.14.0)
* Python (v3.10+)
* Git instalado

### Configuração do Back-end

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

### Configuração do Front-end

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

## Variáveis de Ambiente (Back-end)

As seguintes variáveis devem ser configuradas no arquivo `backend/.env`:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o banco de dados PostgreSQL. | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY` | Chave secreta usada pelo Flask para assinar sessões e outros dados. | `sua_chave_secreta_aqui` |
| `REDIS_URL` | URL de conexão com a instância do Redis. | `redis://localhost:6379/0` |
| `JWT_SECRET` | Chave secreta específica para a geração e validação de tokens JWT. | `sua_chave_jwt_secreta_aqui` |

## Estrutura do Projeto

Nossa organização de pastas é baseada em responsabilidades para evitar conflitos:

### Front-end (/frontend)
- /src/app: Rotas e páginas da aplicação (Next.js App Router).
- /src/components: Componentes reutilizáveis (UI, formulários, layout).
- /src/services: Configuração e chamadas para API.
- /src/store: Gerenciamento de estado global com Zustand.
- /src/types: Definições de interfaces e tipos do TypeScript.

### Back-end (/backend)
- app.py: Ponto de entrada da aplicação Flask.
- /routes: Definição das rotas e endpoints da API.
- /middlewares: Interceptadores para tratamento de erros e autenticação.
- /utils: Funções auxiliares e utilitários.
