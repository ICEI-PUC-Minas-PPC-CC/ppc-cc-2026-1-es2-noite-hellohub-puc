# Sprint 4 — Planejamento do MVP

**Projeto:** HelloHub  
**Disciplina:** Engenharia de Software II  
**Curso:** Ciência da Computação — Turma Noite  
**Instituição:** PUC Minas — 2026/1  
**Orientador:** Diego Roberto Gonçalves de Pontes  

**Integrantes:**
- César Henrique Policarpo de Melo
- Diogo Nascimento Ruis
- Marcos Henrique Gollin Filho
- Matheus Militão Santos
- Nathan Furchi Alvisi
- Pedro Henrique Franco Moreira Amaral
- Rafael de Souza Felisberto

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Descrição do Fluxo Principal do Sistema](#2-descrição-do-fluxo-principal-do-sistema)
3. [Definição do Escopo do MVP](#3-definição-do-escopo-do-mvp)
4. [Planejamento Técnico da Implementação](#4-planejamento-técnico-da-implementação)
5. [Resultado Esperado ao Final do MVP](#5-resultado-esperado-ao-final-do-mvp)

---

## 1. Visão Geral do Sistema

O HelloHub é uma plataforma web no-code voltada para a criação e publicação de chatbots personalizados. O sistema é direcionado a pequenos empreendedores, donos de lojas virtuais, criadores de conteúdo e profissionais autônomos que precisam automatizar atendimento ao cliente sem depender de conhecimento técnico em programação.

A proposta central da plataforma é oferecer um construtor visual de fluxo no qual o usuário monta a lógica do chatbot conectando blocos de mensagens, perguntas e respostas. Uma vez configurado, o chatbot pode ser publicado e integrado a canais digitais como site, WhatsApp e Instagram.

---

## 2. Descrição do Fluxo Principal do Sistema

O fluxo principal do HelloHub corresponde à jornada de criação e utilização de um chatbot pelo usuário. Esse fluxo está alinhado às histórias de usuário levantadas nas sprints anteriores e representa a funcionalidade que gera maior valor na plataforma.

### 2.1 Entrada de Dados

O fluxo se inicia com o acesso do usuário à plataforma:

- O usuário realiza o cadastro ou login na plataforma (entidade `Usuario`).
- Após autenticado, o usuário acessa o painel de gerenciamento de bots.
- O usuário inicia a criação de um novo `Chatbot`, informando nome, descrição e configurações visuais básicas.
- O usuário acessa o construtor visual de fluxo e começa a montar os nós do `FluxoDeConversa`.
- Cada nó representa um `BlocoDeConversa` com tipo (mensagem ou opção de resposta), conteúdo e conexões com outros blocos.

### 2.2 Processamento

O sistema processa as interações do usuário com o construtor da seguinte forma:

- O `FluxoDeConversa` armazena e valida a sequência de blocos criados, verificando se há um bloco inicial definido e se o fluxo está coerente (sem nós isolados).
- Ao adicionar ou conectar blocos, o sistema atualiza o modelo de dados em tempo real, mantendo a integridade das conexões entre `BlocoDeConversa`.
- Quando o usuário solicita a publicação, o sistema valida o fluxo e gera um token único para o `Chatbot` publicado.
- O sistema persiste os dados do chatbot, associando-o ao usuário responsável.

### 2.3 Resposta ao Usuário

Ao final do fluxo, o sistema entrega ao usuário os seguintes resultados:

- Visualização em tempo real do fluxo construído no construtor visual (canvas interativo).
- Confirmação de salvamento automático dos blocos e conexões.
- Após publicação: exibição de link ou código de embed para integração do chatbot.
- O chatbot publicado passa a responder os visitantes do canal configurado, seguindo os blocos definidos no fluxo.

### 2.4 Tabela do Fluxo Principal

| Etapa | Ator / Componente | Ação | Resultado |
|-------|-------------------|------|-----------|
| 1 | Usuário | Cadastro / Login | Sessão autenticada |
| 2 | Usuário + Interface | Cria novo Chatbot (nome, descrição) | Chatbot criado (status: rascunho) |
| 3 | Construtor Visual | Adiciona BlocoDeConversa ao FluxoDeConversa | Nó adicionado ao canvas |
| 4 | Construtor Visual | Conecta blocos definindo o fluxo lógico | Fluxo validado e salvo |
| 5 | Sistema (Backend) | Valida integridade do FluxoDeConversa | Fluxo aprovado ou erros sinalizados |
| 6 | Usuário + Sistema | Publicação do Chatbot | Link/embed gerado; chatbot ativo |
| 7 | Visitante / Usuário Final | Interação com o chatbot publicado | Respostas entregues conforme fluxo |

---

## 3. Definição do Escopo do MVP

O MVP (Minimum Viable Product) do HelloHub tem como objetivo entregar a funcionalidade principal da plataforma em sua forma mais simples e funcional, permitindo validar a proposta de valor central: **permitir que um usuário crie e publique um chatbot funcional sem escrever código**.

### 3.1 Funcionalidade Central do MVP

A funcionalidade principal escolhida para o MVP é o **Construtor Visual de Fluxo de Conversa com publicação simples**. Essa escolha se justifica por ser o diferencial competitivo do sistema e o elemento que conecta todas as demais funcionalidades.

A partir dessa funcionalidade, o usuário será capaz de:

- Criar uma conta e autenticar-se na plataforma.
- Criar um novo chatbot com nome e configurações básicas.
- Montar um fluxo de conversa simples no construtor visual (blocos de mensagem e opções de resposta).
- Salvar e publicar o chatbot.
- Obter um link de acesso ao chatbot publicado.
- Visualizar os bots criados no painel da conta.

### 3.2 O que ENTRA no MVP

| Funcionalidade | Status | Prioridade |
|----------------|--------|------------|
| Cadastro e login de usuário | ✅ Incluso | Alta |
| Criação de chatbot (nome, descrição) | ✅ Incluso | Alta |
| Construtor visual de fluxo (blocos e conexões) | ✅ Incluso | Alta |
| Tipos de bloco: Mensagem e Opção de Resposta | ✅ Incluso | Alta |
| Publicação do chatbot com link de acesso | ✅ Incluso | Alta |
| Painel de gerenciamento dos bots do usuário | ✅ Incluso | Média |
| Execução do chatbot pelo visitante (interface de chat) | ✅ Incluso | Alta |

### 3.3 O que NÃO ENTRA no MVP

| Funcionalidade | Status | Justificativa |
|----------------|--------|---------------|
| Templates prontos de chatbot | ❌ Fora do MVP | Versão futura |
| Integração com WhatsApp | ❌ Fora do MVP | Complexidade técnica elevada |
| Integração com Instagram | ❌ Fora do MVP | Complexidade técnica elevada |
| Captura e gerenciamento de leads | ❌ Fora do MVP | Versão futura |
| Personalização visual avançada (temas, cores, avatar) | ❌ Fora do MVP | Versão futura |
| FAQ automático com IA | ❌ Fora do MVP | Requer integração externa |
| Relatórios e analíticos de uso | ❌ Fora do MVP | Versão futura |

---

## 4. Planejamento Técnico da Implementação

### 4.1 Arquitetura Adotada

O HelloHub adota uma **arquitetura em camadas (Layered Architecture)** com separação clara de responsabilidades entre frontend (camada de apresentação), backend (camada de negócio e aplicação) e banco de dados (camada de persistência). A comunicação entre frontend e backend ocorre via **API REST**.

Essa decisão arquitetural garante:

- Independência entre as camadas, facilitando evolução e manutenção.
- Clareza de responsabilidades: o frontend consome dados, o backend processa regras, o banco persiste.
- Escalabilidade: cada camada pode evoluir de forma independente.

### 4.2 Camadas e Componentes do MVP

#### Camada de Apresentação (Frontend)

Responsável pela interface do usuário. Os principais componentes dessa camada no MVP são:

- **Página de Login e Cadastro:** formulários de autenticação do usuário.
- **Painel (Dashboard):** listagem dos chatbots do usuário, com opções de criar, editar e excluir.
- **Construtor Visual de Fluxo:** canvas interativo para arrastar, soltar e conectar `BlocoDeConversa`. Cada bloco exibe seu tipo e conteúdo. As arestas representam as conexões lógicas do fluxo.
- **Interface de Publicação:** tela de confirmação e exibição do link/embed gerado.
- **Interface de Chat (visitante):** tela simples de chat para o usuário final interagir com o chatbot publicado.

#### Camada de Aplicação (Backend / API REST)

Responsável pelas regras de negócio, validações e orquestração:

| Componente | Responsabilidade | Endpoints principais |
|------------|-----------------|----------------------|
| `UsuarioController` | Cadastro, login e gestão de conta | `POST /usuarios`, `POST /login` |
| `ChatbotController` | CRUD de chatbots do usuário | `GET/POST/PUT/DELETE /chatbots` |
| `FluxoController` | Gestão do fluxo de conversa | `GET/PUT /chatbots/{id}/fluxo` |
| `BlocoController` | CRUD de blocos do fluxo | `POST/PUT/DELETE /blocos` |
| `PublicacaoController` | Publicação e geração de link | `POST /chatbots/{id}/publicar` |
| `ChatbotRuntimeController` | Execução do chatbot pelo visitante | `POST /chat/{token}/mensagem` |

Cada Controller delega a lógica de negócio ao seu respectivo Service, que por sua vez utiliza os Repositories para acessar o banco de dados.

#### Camada de Persistência (Banco de Dados)

As principais entidades persistidas, coerentes com o diagrama de classes das sprints anteriores:

| Entidade / Classe | Principais Atributos | Relacionamentos |
|-------------------|----------------------|-----------------|
| `Usuario` | id, nome, email, senhaHash, dataCadastro | 1 para N com Chatbot |
| `Chatbot` | id, nome, descricao, status, dataCriacao, token | N para 1 com Usuario; 1 para 1 com FluxoDeConversa |
| `FluxoDeConversa` | id, blocoInicial, status | 1 para 1 com Chatbot; 1 para N com BlocoDeConversa |
| `BlocoDeConversa` | id, tipo (MENSAGEM/OPCAO), conteudo, ordem | N para 1 com FluxoDeConversa; 0..N conexões |
| `ConexaoBloco` | id, blocoOrigem, blocoDestino, rotulo | N para 1 com BlocoDeConversa (origem e destino) |

### 4.3 Comunicação entre Componentes

| Origem | → | Destino | Mecanismo |
|--------|---|---------|-----------|
| Frontend (Browser) | → | Backend (API) | Requisições HTTP/REST com JSON |
| Controller | → | Service | Chamada direta de método (injeção de dependência) |
| Service | → | Repository | Chamada direta de método (padrão Repository) |
| Repository | → | Banco de Dados | ORM / Queries SQL |
| ChatbotRuntime | → | FluxoDeConversa | Leitura do fluxo persistido + navegação nos blocos em memória |

### 4.4 Decisões Técnicas e Justificativas

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Arquitetura | Camadas (Layered Architecture) | Separa responsabilidades, facilita evolução e testes |
| Comunicação | API REST com JSON | Simplicidade, compatibilidade e padrão do mercado |
| Construtor de Fluxo | Canvas interativo (frontend) | Proposta no-code; o fluxo é o core do produto |
| Persistência do Fluxo | Estrutura de grafo (nós + arestas) | Representa naturalmente um fluxo de conversa com ramificações |
| Autenticação | Token JWT | Stateless, fácil de implementar e escalar |
| Acesso ao chatbot | Token único por chatbot publicado | Permite acesso público sem autenticação do visitante |

### 4.5 Alinhamento com o Diagrama de Classes

As classes utilizadas no planejamento técnico estão coerentes com o diagrama de classes produzido na Sprint 2:

| Classe (Diagrama) | Componente de Implementação | Camada |
|-------------------|-----------------------------|--------|
| `Usuario` | UsuarioController + UsuarioService + UsuarioRepository | Backend + Persistência |
| `Chatbot` | ChatbotController + ChatbotService + ChatbotRepository | Backend + Persistência |
| `FluxoDeConversa` | FluxoController + FluxoService + FluxoRepository | Backend + Persistência |
| `BlocoDeConversa` | BlocoController + BlocoService + BlocoRepository | Backend + Persistência |
| `ConexaoBloco` | Gerenciado pelo FluxoService; persiste como entidade | Backend + Persistência |
| `ChatbotRuntime` | ChatbotRuntimeController + RuntimeService | Backend (execução) |

---

## 5. Resultado Esperado ao Final do MVP

Ao concluir a implementação do MVP, o HelloHub deverá ser capaz de:

- Permitir que um usuário se cadastre, faça login e acesse seu painel de bots.
- Criar um chatbot com nome e configurações básicas.
- Montar um fluxo de conversa simples utilizando o construtor visual (blocos de mensagem e opções de resposta).
- Salvar o fluxo e publicar o chatbot.
- Gerar um link de acesso único ao chatbot publicado.
- Permitir que um visitante interaja com o chatbot publicado por meio de uma interface de chat simples.

Essas entregas representam a validação da proposta de valor central do HelloHub e servem como base para as próximas iterações, nas quais serão adicionadas funcionalidades como templates, integrações com canais externos e captura de leads.
