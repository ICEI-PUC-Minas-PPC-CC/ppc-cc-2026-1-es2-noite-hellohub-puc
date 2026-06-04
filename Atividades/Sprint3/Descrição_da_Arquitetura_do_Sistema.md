# Sprint 3 — Descrição da Arquitetura do Sistema

## 1. Contexto

O HelloHub é uma plataforma web no-code para criação, personalização e publicação de chatbots. O sistema tem como foco permitir que usuários sem conhecimento técnico criem fluxos de atendimento usando um construtor visual, conectando blocos de conversa por meio de uma interface simples.

A arquitetura proposta nesta Sprint 3 dá continuidade às decisões tomadas nas etapas anteriores do projeto, principalmente à modelagem do **Construtor Visual de Fluxo Drag & Drop**, no qual o fluxo do chatbot é tratado como uma estrutura formada por:

* `Flow`: fluxo completo da conversa;
* `Block`: bloco visual da conversa;
* `Connection`: ligação entre dois blocos;
* `Bot`: chatbot criado pelo usuário;
* `User`: usuário responsável pela criação e gerenciamento dos bots.

A arquitetura foi organizada para permitir evolução gradual do sistema, mantendo separação clara entre interface, regras de negócio, validação, persistência e integrações externas.

---

## 2. Objetivo da Arquitetura

O objetivo da arquitetura do HelloHub é organizar o sistema de forma coerente, modular e fácil de manter, permitindo que a equipe desenvolva o produto de maneira incremental.

A arquitetura deve atender aos seguintes objetivos:

1. Separar responsabilidades entre interface, aplicação, domínio e persistência.
2. Permitir que o frontend se comunique com o backend por meio de uma API REST.
3. Centralizar regras de negócio em services e validadores.
4. Isolar o acesso ao banco de dados por meio de repositories.
5. Permitir futuras integrações com canais externos, como site, WhatsApp e Instagram.
6. Facilitar testes, manutenção e evolução do sistema.
7. Manter o construtor visual de fluxo como núcleo funcional da solução.

---

## 3. Estilo Arquitetural Escolhido

A arquitetura escolhida para o HelloHub é uma **arquitetura em camadas**, combinada com uma comunicação baseada em **API REST**.

A aplicação será dividida em quatro camadas principais:

```text
Interface Web
    ↓
Controller
    ↓
Service
    ↓
Domain / Validator
    ↓
Repository
    ↓
Database
```

Essa organização permite que cada parte do sistema tenha uma responsabilidade clara.

---

## 4. Visão Geral das Camadas

| Camada               | Responsabilidade Principal                                                     |
| -------------------- | ------------------------------------------------------------------------------ |
| Interface Web        | Exibir telas, capturar ações do usuário e consumir a API REST                  |
| Controller           | Receber requisições HTTP, validar entrada básica e acionar os services         |
| Service              | Coordenar casos de uso e aplicar regras de negócio                             |
| Domain               | Representar as entidades principais do sistema                                 |
| Validator            | Validar regras específicas do domínio                                          |
| Repository           | Realizar acesso e persistência dos dados                                       |
| Database             | Armazenar usuários, bots, fluxos, leads, integrações e mensagens               |
| External Integration | Comunicação com serviços externos, como WhatsApp, Instagram ou scripts de site |

---

## 5. Camada de Interface Web

A camada de interface representa tudo que o usuário visualiza e manipula no navegador.

No HelloHub, essa camada inclui:

* tela de login;
* dashboard do usuário;
* listagem de bots;
* criação e edição de bot;
* editor visual de fluxo;
* painel de propriedades dos blocos;
* tela de publicação;
* visualização de leads;
* configuração de integrações.

O componente mais importante dessa camada é o **EditorCanvas**, responsável por permitir que o usuário crie fluxos de conversa usando drag and drop.

### Responsabilidades da Interface

A interface deve:

* renderizar blocos e conexões;
* capturar eventos de arrastar e soltar;
* enviar ações para a API;
* exibir mensagens de erro e sucesso;
* atualizar a tela conforme respostas do backend;
* não acessar diretamente o banco de dados;
* não conter regras de negócio complexas.

Exemplo de ação da interface:

```text
Usuário arrasta uma seta entre dois blocos
        ↓
EditorCanvas captura o evento
        ↓
Frontend envia requisição REST para o backend
        ↓
Backend valida e salva a conexão
        ↓
Frontend atualiza a tela
```

---

## 6. Camada Controller

A camada Controller é responsável por receber as requisições HTTP feitas pelo frontend.

Os controllers não devem conter regras de negócio complexas. Eles devem apenas:

* receber a requisição;
* extrair parâmetros;
* validar dados obrigatórios básicos;
* chamar o service correto;
* retornar uma resposta HTTP adequada.

### Controllers principais

| Controller               | Responsabilidade                               |
| ------------------------ | ---------------------------------------------- |
| `AuthController`         | Login, cadastro e autenticação                 |
| `UserController`         | Dados do usuário                               |
| `BotController`          | Criação, edição, listagem e publicação de bots |
| `FlowController`         | Manipulação do fluxo visual                    |
| `BlockController`        | Criação, edição e remoção de blocos            |
| `ConnectionController`   | Criação e remoção de conexões entre blocos     |
| `LeadController`         | Consulta e gerenciamento de leads capturados   |
| `IntegrationController`  | Configuração de integrações externas           |
| `ConversationController` | Execução e histórico de conversas              |

### Exemplo de responsabilidade

O `FlowController` recebe uma requisição para conectar dois blocos:

```text
POST /api/flows/{flowId}/connections
```

Depois disso, ele chama o método correspondente no `FlowService`.

---

## 7. Camada Service

A camada Service representa a camada de aplicação. Ela coordena os casos de uso do sistema.

Os services são responsáveis por:

* executar regras de negócio;
* coordenar entidades do domínio;
* chamar validadores;
* acessar repositories;
* controlar o fluxo das operações;
* impedir que controllers acessem diretamente repositories;
* impedir que regras importantes fiquem espalhadas pela interface.

### Services principais

| Service               | Responsabilidade                               |
| --------------------- | ---------------------------------------------- |
| `AuthService`         | Autenticação e controle de sessão              |
| `UserService`         | Operações relacionadas ao usuário              |
| `BotService`          | Criação, edição, listagem e publicação de bots |
| `FlowService`         | Casos de uso do fluxo visual                   |
| `BlockService`        | Manipulação de blocos do fluxo                 |
| `ConnectionService`   | Manipulação de conexões entre blocos           |
| `LeadService`         | Registro e consulta de leads                   |
| `IntegrationService`  | Configuração e teste de integrações            |
| `ConversationService` | Execução de conversas do chatbot               |

---

## 8. Camada de Domínio

A camada de domínio contém as entidades principais do sistema. Essas classes representam os conceitos centrais do HelloHub.

### Entidades principais

| Entidade              | Descrição                            |
| --------------------- | ------------------------------------ |
| `User`                | Usuário da plataforma                |
| `Bot`                 | Chatbot criado pelo usuário          |
| `Flow`                | Fluxo de conversa do bot             |
| `Block`               | Bloco visual do fluxo                |
| `Connection`          | Ligação entre dois blocos            |
| `Lead`                | Contato capturado pelo chatbot       |
| `Integration`         | Integração externa do bot            |
| `ConversationSession` | Sessão de conversa com usuário final |
| `Message`             | Mensagem trocada durante a conversa  |
| `Template`            | Modelo pronto de chatbot             |
| `FAQ`                 | Pergunta e resposta frequente        |

---

## 9. Camada Validator

A camada Validator concentra validações específicas do domínio.

No HelloHub, o principal validador é o `FlowValidator`, pois o fluxo visual precisa obedecer regras para funcionar corretamente.

### Responsabilidades do FlowValidator

O `FlowValidator` deve validar:

* se o bloco de origem existe;
* se o bloco de destino existe;
* se os dois blocos pertencem ao mesmo fluxo;
* se a conexão não liga um bloco a ele mesmo;
* se o fluxo possui bloco inicial;
* se não existem blocos obrigatórios desconectados;
* se o fluxo está apto para publicação.

### Exemplo de regra

```text
Uma conexão não pode ter o mesmo bloco como origem e destino.
```

---

## 10. Camada Repository

A camada Repository abstrai o acesso ao banco de dados.

Ela permite que os services trabalhem com entidades e objetos do domínio sem conhecer detalhes da persistência.

### Repositories principais

| Repository               | Responsabilidade                    |
| ------------------------ | ----------------------------------- |
| `UserRepository`         | Persistência de usuários            |
| `BotRepository`          | Persistência de bots                |
| `FlowRepository`         | Persistência de fluxos              |
| `BlockRepository`        | Persistência de blocos              |
| `ConnectionRepository`   | Persistência de conexões            |
| `LeadRepository`         | Persistência de leads               |
| `IntegrationRepository`  | Persistência de integrações         |
| `ConversationRepository` | Persistência de sessões e mensagens |
| `TemplateRepository`     | Persistência de templates           |
| `FAQRepository`          | Persistência de FAQs                |

---

## 11. Camada Database

A camada Database representa o armazenamento dos dados do sistema.

Para o HelloHub, o banco deve armazenar:

* usuários;
* bots;
* fluxos;
* blocos;
* conexões;
* leads;
* integrações;
* sessões de conversa;
* mensagens;
* templates;
* FAQs.

Como o fluxo visual é formado por blocos e conexões, ele pode ser armazenado de forma estruturada, por exemplo:

```json
{
  "flowId": "flow-001",
  "blocks": [
    {
      "id": "block-001",
      "type": "START",
      "content": "Olá! Como posso ajudar?",
      "positionX": 100,
      "positionY": 200
    }
  ],
  "connections": [
    {
      "id": "connection-001",
      "sourceBlockId": "block-001",
      "targetBlockId": "block-002"
    }
  ]
}
```

Esse formato facilita a renderização do fluxo no editor visual.

---

## 12. Camada de Integrações Externas

A camada de integrações externas será responsável por conectar o HelloHub a canais externos.

Exemplos de integrações previstas:

* site;
* WhatsApp;
* Instagram.

### Responsabilidades

A camada de integração deve:

* isolar chamadas para APIs externas;
* armazenar tokens e identificadores externos;
* receber eventos externos, quando necessário;
* transformar mensagens externas em objetos internos;
* proteger o domínio contra mudanças nas APIs de terceiros.

### Exemplos de classes

| Classe                        | Responsabilidade                |
| ----------------------------- | ------------------------------- |
| `WebsiteIntegrationAdapter`   | Publicação do bot em sites      |
| `WhatsAppIntegrationAdapter`  | Comunicação com WhatsApp        |
| `InstagramIntegrationAdapter` | Comunicação com Instagram       |
| `WebhookController`           | Recebimento de eventos externos |

---

## 13. Estrutura Sugerida de Pastas

A estrutura abaixo serve como referência para organização do código:

```text
src/
├── presentation/
│   ├── controllers/
│   │   ├── AuthController
│   │   ├── BotController
│   │   ├── FlowController
│   │   ├── BlockController
│   │   ├── ConnectionController
│   │   ├── LeadController
│   │   └── IntegrationController
│   └── dto/
│       ├── requests/
│       └── responses/
│
├── application/
│   └── services/
│       ├── AuthService
│       ├── BotService
│       ├── FlowService
│       ├── BlockService
│       ├── ConnectionService
│       ├── LeadService
│       └── IntegrationService
│
├── domain/
│   ├── models/
│   │   ├── User
│   │   ├── Bot
│   │   ├── Flow
│   │   ├── Block
│   │   ├── Connection
│   │   ├── Lead
│   │   ├── Integration
│   │   ├── ConversationSession
│   │   └── Message
│   ├── validators/
│   │   └── FlowValidator
│   └── enums/
│       ├── BotStatus
│       ├── BlockType
│       ├── ConnectionType
│       └── IntegrationChannel
│
├── infrastructure/
│   ├── repositories/
│   │   ├── UserRepository
│   │   ├── BotRepository
│   │   ├── FlowRepository
│   │   ├── LeadRepository
│   │   └── IntegrationRepository
│   ├── database/
│   └── external/
│       ├── WebsiteIntegrationAdapter
│       ├── WhatsAppIntegrationAdapter
│       └── InstagramIntegrationAdapter
│
└── web/
    ├── pages/
    ├── components/
    │   ├── EditorCanvas
    │   ├── FlowEditorView
    │   ├── BlockComponent
    │   └── PropertiesPanel
    └── api/
        └── httpClient
```

---

## 14. Justificativa da Arquitetura Escolhida

A arquitetura em camadas foi escolhida porque o HelloHub é um sistema com regras de negócio claras, várias entidades de domínio e necessidade de comunicação entre frontend, backend, banco de dados e integrações externas.

Essa arquitetura é adequada porque:

1. **Facilita manutenção**
   Cada camada tem uma responsabilidade específica, reduzindo acoplamento.

2. **Facilita testes**
   Services, validators e repositories podem ser testados de forma isolada.

3. **Evita regras de negócio na interface**
   A interface apenas envia ações e exibe respostas, enquanto o backend valida e executa as operações.

4. **Organiza o crescimento do projeto**
   Novas funcionalidades podem ser adicionadas sem reestruturar todo o sistema.

5. **Permite integração com canais externos**
   A camada de integração isola detalhes de APIs como WhatsApp, Instagram e site.

6. **Combina com o MVP**
   A arquitetura em camadas é mais simples que microsserviços e suficiente para o estágio atual do projeto.

7. **Permite evolução futura**
   Caso o sistema cresça, partes específicas podem ser separadas em serviços independentes futuramente.

---

## 15. Decisões Arquiteturais

### 15.1 Uso de arquitetura em camadas

Foi adotada uma arquitetura em camadas para separar responsabilidades e organizar o sistema.

### 15.2 Uso de API REST

A comunicação entre frontend e backend será feita por API REST, usando JSON como formato principal de troca de dados.

### 15.3 Uso de Services

Os services concentram os casos de uso e evitam que controllers tenham regras de negócio.

### 15.4 Uso de Repositories

Os repositories isolam o acesso ao banco de dados e tornam a persistência mais flexível.

### 15.5 Uso de Validators

Validadores específicos, como `FlowValidator`, concentram regras de consistência do domínio.

### 15.6 Fluxo como grafo

O fluxo do chatbot será tratado como um grafo composto por blocos e conexões.

### 15.7 Não adoção inicial de microsserviços

Microsserviços não foram escolhidos para o MVP porque aumentariam a complexidade de infraestrutura, deploy e comunicação. Para o estágio atual, uma arquitetura em camadas é mais adequada.

---

## 16. Atributos de Qualidade

| Atributo         | Como a arquitetura atende                                     |
| ---------------- | ------------------------------------------------------------- |
| Manutenibilidade | Separação clara entre camadas                                 |
| Testabilidade    | Services e validators podem ser testados isoladamente         |
| Escalabilidade   | Camadas podem evoluir separadamente                           |
| Segurança        | Controllers podem aplicar autenticação e autorização          |
| Reutilização     | Services podem ser usados por diferentes controllers          |
| Evolutividade    | Novas integrações podem ser adicionadas por adapters          |
| Clareza          | A estrutura facilita entendimento por novos membros da equipe |

---

## 17. Conclusão

A arquitetura proposta para o HelloHub organiza o sistema em camadas bem definidas, com responsabilidades claras para interface, controllers, services, domínio, validators, repositories, banco de dados e integrações externas.

Essa estrutura atende ao objetivo da Sprint 3, pois define como o sistema será organizado, como os componentes se comunicam e por que a arquitetura escolhida é adequada para o projeto.

A solução é coerente com o escopo atual do HelloHub, especialmente com o construtor visual de fluxos, que é o núcleo funcional da plataforma.
