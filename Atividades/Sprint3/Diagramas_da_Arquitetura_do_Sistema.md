# Sprint 3 — Diagramas da Arquitetura do Sistema

## 1. Objetivo

Este documento apresenta as representações visuais da arquitetura do HelloHub.

Os diagramas têm como objetivo explicar:

* a visão geral do sistema;
* a organização em camadas;
* os principais componentes internos;
* o fluxo de comunicação entre frontend, backend e banco de dados;
* o funcionamento do caso de uso principal: conectar blocos no editor visual;
* a visão de implantação da solução.

---

## 2. Diagrama de Contexto

O diagrama de contexto mostra o HelloHub como sistema central e seus principais atores e integrações externas.

```mermaid
flowchart LR
    U[Usuário da Plataforma] -->|Cria e gerencia bots| HH[HelloHub]

    V[Usuário Final / Cliente] -->|Conversa com chatbot publicado| HH

    HH -->|Publica widget| SITE[Site do Cliente]
    HH -->|Envia e recebe mensagens| WPP[WhatsApp]
    HH -->|Envia e recebe mensagens| IG[Instagram]

    HH -->|Armazena dados| DB[(Banco de Dados)]

    U -->|Acessa via navegador| WEB[Interface Web]
    WEB -->|API REST / JSON| HH
```

### Explicação

O usuário da plataforma cria e configura chatbots dentro do HelloHub.
O usuário final interage com o chatbot publicado em canais como site, WhatsApp ou Instagram.
O sistema armazena informações em banco de dados, incluindo usuários, bots, fluxos, leads e conversas.

---

## 3. Diagrama de Camadas

O diagrama abaixo representa a arquitetura em camadas adotada no projeto.

```mermaid
flowchart TB
    A[Interface Web]

    B[Controllers]

    C[Services]

    D[Domain Models]
    E[Validators]

    F[Repositories]

    G[(Database)]

    H[External Integration Adapters]
    I[APIs Externas]

    A -->|HTTP REST / JSON| B
    B --> C
    C --> D
    C --> E
    C --> F
    F --> G

    C --> H
    H --> I
```

### Explicação

A interface web se comunica com o backend por meio de requisições REST.
Os controllers recebem as requisições e chamam os services.
Os services aplicam regras de negócio, usam validators e acessam repositories.
Os repositories fazem a comunicação com o banco de dados.
Adapters de integração são usados para comunicação com canais externos.

---

## 4. Diagrama de Componentes do Backend

```mermaid
flowchart LR
    subgraph Presentation[Camada de Apresentação]
        AuthController
        BotController
        FlowController
        BlockController
        ConnectionController
        LeadController
        IntegrationController
    end

    subgraph Application[Camada de Aplicação]
        AuthService
        BotService
        FlowService
        BlockService
        ConnectionService
        LeadService
        IntegrationService
    end

    subgraph Domain[Camada de Domínio]
        User
        Bot
        Flow
        Block
        Connection
        Lead
        Integration
        ConversationSession
        Message
        FlowValidator
    end

    subgraph Persistence[Camada de Persistência]
        UserRepository
        BotRepository
        FlowRepository
        LeadRepository
        IntegrationRepository
    end

    subgraph Infrastructure[Infraestrutura]
        Database[(Database)]
        WebsiteAdapter
        WhatsAppAdapter
        InstagramAdapter
    end

    AuthController --> AuthService
    BotController --> BotService
    FlowController --> FlowService
    BlockController --> BlockService
    ConnectionController --> ConnectionService
    LeadController --> LeadService
    IntegrationController --> IntegrationService

    FlowService --> Flow
    FlowService --> Block
    FlowService --> Connection
    FlowService --> FlowValidator

    BotService --> Bot
    LeadService --> Lead
    IntegrationService --> Integration

    AuthService --> UserRepository
    BotService --> BotRepository
    FlowService --> FlowRepository
    LeadService --> LeadRepository
    IntegrationService --> IntegrationRepository

    UserRepository --> Database
    BotRepository --> Database
    FlowRepository --> Database
    LeadRepository --> Database
    IntegrationRepository --> Database

    IntegrationService --> WebsiteAdapter
    IntegrationService --> WhatsAppAdapter
    IntegrationService --> InstagramAdapter
```

### Explicação

Este diagrama detalha a organização interna do backend.
Controllers recebem chamadas externas.
Services executam casos de uso.
Models representam o domínio.
Repositories realizam persistência.
Adapters isolam integrações externas.

---

## 5. Diagrama do Domínio do Construtor Visual

O construtor visual é a funcionalidade central do HelloHub.
Ele é representado por um fluxo composto por blocos e conexões.

```mermaid
classDiagram

class User {
  +UUID id
  +String name
  +String email
  +String passwordHash
  +UserStatus status
}

class Bot {
  +UUID id
  +String name
  +String description
  +BotStatus status
  +publish()
  +unpublish()
}

class Flow {
  +UUID id
  +String name
  +addBlock()
  +removeBlock()
  +addConnection()
  +removeConnection()
}

class Block {
  +UUID id
  +BlockType type
  +String title
  +String content
  +Integer positionX
  +Integer positionY
}

class Connection {
  +UUID id
  +UUID sourceBlockId
  +UUID targetBlockId
  +ConnectionType type
  +String label
}

class FlowValidator {
  +validateConnection()
  +validateFlowConsistency()
}

class Lead {
  +UUID id
  +String name
  +String email
  +String phone
  +DateTime capturedAt
}

class Integration {
  +UUID id
  +IntegrationChannel channel
  +IntegrationStatus status
}

User "1" --> "0..*" Bot : cria
Bot "1" *-- "1" Flow : possui
Flow "1" *-- "1..*" Block : contem
Flow "1" *-- "0..*" Connection : contem
Connection "1" --> "1" Block : origem
Connection "1" --> "1" Block : destino
FlowValidator --> Flow : valida
Bot "1" *-- "0..*" Lead : captura
Bot "1" *-- "0..*" Integration : possui
```

### Explicação

O fluxo do chatbot é representado como um grafo.
Cada `Block` é um nó e cada `Connection` é uma ligação entre dois nós.
Essa estrutura permite representar conversas de forma visual e flexível.

---

## 6. Diagrama de Sequência — Conectar Blocos

Este diagrama representa o caso de uso principal do editor visual: conectar dois blocos.

```mermaid
sequenceDiagram
    actor User as Usuário
    participant Canvas as EditorCanvas
    participant Controller as FlowController
    participant Service as FlowService
    participant Validator as FlowValidator
    participant Repository as FlowRepository
    participant DB as Database

    User->>Canvas: Arrasta seta entre dois blocos
    Canvas->>Canvas: Exibe conexão temporária
    Canvas->>Controller: POST /api/flows/{id}/connections
    Controller->>Service: connectBlocks(flowId, sourceBlockId, targetBlockId)
    Service->>Repository: findById(flowId)
    Repository->>DB: buscar fluxo
    DB-->>Repository: dados do fluxo
    Repository-->>Service: Flow
    Service->>Validator: validateConnection(flow, sourceBlockId, targetBlockId)
    Validator-->>Service: conexão válida
    Service->>Service: cria Connection
    Service->>Repository: save(flow)
    Repository->>DB: salvar fluxo atualizado
    DB-->>Repository: confirmação
    Repository-->>Service: fluxo salvo
    Service-->>Controller: FlowResponse
    Controller-->>Canvas: 201 Created
    Canvas->>User: Renderiza conexão definitiva
```

### Explicação

A interface apenas captura a ação do usuário.
A validação da conexão ocorre no backend.
O fluxo só é salvo se a conexão for válida.

---

## 7. Diagrama de Sequência — Publicar Bot

```mermaid
sequenceDiagram
    actor User as Usuário
    participant Web as Interface Web
    participant Controller as BotController
    participant BotService as BotService
    participant FlowService as FlowService
    participant Validator as FlowValidator
    participant Repository as BotRepository
    participant DB as Database

    User->>Web: Clica em publicar bot
    Web->>Controller: POST /api/bots/{botId}/publish
    Controller->>BotService: publishBot(botId)
    BotService->>FlowService: loadFlow(botId)
    FlowService->>Validator: validateFlowConsistency(flow)
    Validator-->>FlowService: fluxo consistente
    FlowService-->>BotService: fluxo validado
    BotService->>Repository: updateStatus(botId, PUBLISHED)
    Repository->>DB: salvar status publicado
    DB-->>Repository: confirmação
    Repository-->>BotService: bot publicado
    BotService-->>Controller: BotResponse
    Controller-->>Web: 200 OK
    Web->>User: Exibe confirmação de publicação
```

### Explicação

Antes da publicação, o sistema valida se o fluxo do bot está consistente.
Isso evita que um chatbot seja publicado com blocos desconectados ou regras inválidas.

---

## 8. Diagrama de Implantação

```mermaid
flowchart TB
    subgraph Client[Cliente]
        Browser[Navegador Web]
    end

    subgraph Server[Servidor da Aplicação]
        Frontend[Frontend Web]
        API[Backend API REST]
    end

    subgraph Data[Persistência]
        DB[(Banco de Dados)]
    end

    subgraph External[Serviços Externos]
        Website[Site do Cliente]
        WhatsApp[WhatsApp API]
        Instagram[Instagram API]
    end

    Browser -->|HTTPS| Frontend
    Frontend -->|HTTPS / REST / JSON| API
    API -->|Consulta e persistência| DB
    API -->|Publicação / Webhook / API| Website
    API -->|Mensagens / Webhook| WhatsApp
    API -->|Mensagens / Webhook| Instagram
```

### Explicação

O usuário acessa o sistema pelo navegador.
O frontend se comunica com o backend via HTTPS e REST.
O backend acessa o banco de dados e integrações externas quando necessário.

---

## 9. Diagrama de Fluxo de Dados Simplificado

```mermaid
flowchart LR
    U[Usuário] --> A[Editor Visual]
    A --> B[API REST]
    B --> C[FlowService]
    C --> D[FlowValidator]
    D --> C
    C --> E[FlowRepository]
    E --> F[(Database)]
    F --> E
    E --> C
    C --> B
    B --> A
    A --> U
```

### Explicação

O fluxo de dados principal começa na interação do usuário com o editor visual.
A interface envia os dados para a API.
O backend valida, persiste e retorna o estado atualizado.

---

## 10. Conclusão

Os diagramas apresentados mostram que o HelloHub será estruturado com uma arquitetura em camadas, comunicação REST e separação clara entre interface, controllers, services, domínio, repositories, banco de dados e integrações externas.

Essa representação atende à Sprint 3 porque demonstra:

* como o sistema será estruturado;
* como as camadas se relacionam;
* quais componentes fazem parte da solução;
* como ocorre a comunicação entre frontend e backend;
* como o caso de uso principal funciona internamente.
