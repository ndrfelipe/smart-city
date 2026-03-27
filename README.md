# Smart City - Plataforma de Gestão de Demandas Urbanas

Bem-vindos ao repositório front-end da nossa Plataforma de Gestão de Demandas Urbanas! Este projeto é um MVP (Minimum Viable Product) focado em centralizar o registro, acompanhamento e gestão de solicitações públicas (como buracos em vias, iluminação e saneamento), conectando cidadãos e gestores públicos.

## Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:
* **Framework:** Next.js (App Router) com TypeScript
* **Estilização:** Tailwind CSS + Chakra UI
* **Gerenciamento de Estado:** Zustand
* **Dados:** Fake API (Mock)

## Como rodar o projeto localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento na sua máquina.

### Pré-requisitos
* Node.js (v24.14.0)
* Git instalado

### Instalação

1. Clone o repositório: git clone [https://github.com/ndrfelipe/smart-city.git](https://github.com/ndrfelipe/smart-city.git ) 
2. Acesse a página do projeto: cd frontend
3. Instale as deendências: npm install
4. Inicie o servidor de desenvolvimento: npm run dev
5. Abra http://localhost:3000 no seu navegador para ver a aplicação rodando

## Estrutura do Projeto:

Nossa organização de pastas é baseada em responsabilidades para evitar conflitos:
- /src/app: Rotas e páginas da aplicação (Next.js App Router).
- /src/components: Componentes reutilizáveis (UI, formulários, layout).
- /src/services: Configuração e chamadas para a nossa Fake API.
- /src/store: Gerenciamento de estado global com Zustand.
- /src/types: Definições de interfaces e tipos do TypeScript.
