# Smart City - Plataforma de Gestão de Demandas Urbanas

Bem-vindos ao repositório da nossa Plataforma de Gestão de Demandas Urbanas! Este projeto é um MVP (Minimum Viable Product) focado em centralizar o registro, acompanhamento e gestão de solicitações públicas (como buracos em vias, iluminação e saneamento), conectando cidadãos e gestores públicos.

**Componentes do Grupo:** André Felipe, Deyvison Conrado, Jeniffer Cristine, Letícia Gabriella, Manuele Macêdo, Maria Aparecida

---

## Requisitos para a disciplina Fundamentos de Computação Concorrente, Paralela e Distribuída


## 1. Arquitetura Distribuída e Desenho da Arquitetura
O projeto adota o modelo arquitetural **Cliente-Servidor (Web Desacoplada)**. A escolha justifica-se pela separação clara de responsabilidades: o cliente lida estritamente com a interface do usuário e visualização, enquanto o servidor gerencia as regras de negócio, persistência e integridade dos dados da cidade.

### Componentes e Tecnologias:
* **Frontend (Cliente):** Desenvolvido em **Next.js (React / TypeScript)**, responsável por renderizar os painéis e interações da Smart City.
* **Backend (Servidor):** Desenvolvido em **Python**, utilizando uma estrutura modular organizada em rotas, controllers, schemas e services (Flask/FastAPI).
* **Comunicação:** Ocorre exclusivamente através do protocolo **HTTP/REST**, utilizando o formato JSON para o intercâmbio de dados.

### Diagrama de Arquitetura:
* **Fluxo:** [ FRONTEND (Next.js) ] --( Requisições HTTP/REST / JSON )--> [ BACKEND (Python API) ]
* **Simulação:** [ SCRIPT DE TESTE (Python) ] --( Multi-threads / HTTP POST )--> [ BACKEND (Python API) ]

---

## 2. Concorrência e Paralelismo
* **Mecanismo Utilizado:** Múltiplas Threads (módulo nativo `threading` do Python).
* **Componente/Módulo:** Localizado no script de simulação/testes (`backend/test_register.py`).
* **Problema Resolvido:** Em uma Smart City real, múltiplos dispositivos IoT e usuários enviam eventos ao mesmo tempo. O mecanismo de threads permite simular múltiplos fluxos paralelos injetando dados na API HTTP de forma assíncrona, garantindo que o envio de uma requisição não bloqueie nem atrase a execução das outras.

---

## 3. Otimização
* **Ponto de Implementação:** No módulo de serviços do servidor (`backend/services/demandas_service.py`).
* **O que foi feito:** Foi implementada uma técnica de **Cache em Memória** na listagem de demandas. Ao receber requisições de leitura ou consultas repetitivas dos estados da cidade, o sistema consulta primeiro uma estrutura de cache local (`_LISTAR_DEMANDAS_CACHE`). Se o dado existir, ele é retornado instantaneamente, reduzindo drasticamente o tempo de resposta e poupando recursos de processamento e acessos ao banco de dados. O cache é automaticamente invalidado (limpo) em qualquer operação de escrita (criação, edição ou deleção) para garantir a consistência dos dados.
* **Otimização Futura:** Para cenários de grande escala, o cache em memória local poderia ser migrado para uma instância dedicada de **Redis**, e o protocolo HTTP tradicional substituído por **WebSockets** ou **gRPC** para comunicação bidirecional de baixíssima latência.

## 4. Otimização
* **Ponto de Implementação:** No componente de regras de negócio do servidor, localizado em `backend/services/demandas_service.py`.
* **O que foi feito e Impacto Esperado:** Foi implementado um mecanismo de **Cache em Memória** (`_LISTAR_DEMANDAS_CACHE`) no método `listar_demandas`. Quando um gestor ou cidadão solicita a listagem de demandas com os mesmos parâmetros de busca repetidas vezes, o sistema intercepta a requisição e devolve o resultado direto da memória RAM. O impacto esperado é uma redução drástica no tempo de resposta (latência) para o usuário final, além de poupar o overhead do ORM e evitar consultas redundantes de I/O na base de dados PostgreSQL. Para garantir a consistência de dados, o cache é completamente limpo (`cache.clear()`) em qualquer operação de mutação (`criar_demanda`, `atualizar_demanda` ou `deletar_demanda`).
* **Otimização Futura:** Como a arquitetura do projeto já mapeia o uso de **Redis**, o próximo passo evolutivo de otimização consiste em mover esse cache em memória volátil do processo Python para a instância isolada do Redis. Isso garantirá que, em caso de escalabilidade horizontal (múltiplas instâncias do servidor Flask rodando em paralelo), todos os servidores compartilhem do mesmo estado de cache centralizado e persistente em memória.





---

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
