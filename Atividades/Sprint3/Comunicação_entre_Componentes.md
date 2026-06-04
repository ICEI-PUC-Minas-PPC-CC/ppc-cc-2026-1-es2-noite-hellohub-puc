# Sprint 3 — Comunicação entre Componentes

## 1. Objetivo

Este documento descreve como os componentes do HelloHub se comunicam dentro da arquitetura proposta.

A comunicação principal será baseada em **HTTP REST com JSON**, permitindo que a interface web envie comandos ao backend e receba respostas estruturadas.

Além da comunicação REST, o sistema também prevê comunicação interna entre camadas por chamadas de métodos e comunicação externa com serviços de terceiros por adapters e webhooks.

---

## 2. Visão Geral da Comunicação

A comunicação geral do sistema segue o fluxo abaixo:

```text
Interface Web
    ↓ HTTP REST / JSON
Controller
    ↓ chamada de método
Service
    ↓ chamada de método
Validator / Domain
    ↓ chamada de método
Repository
    ↓ consulta ou gravação
Database
```

Esse modelo garante que cada camada se comunique apenas com a camada imediatamente necessária, evitando dependências diretas indevidas.

---

## 3. Comunicação entre Frontend e Backend

A comunicação entre frontend e backend será feita por meio de uma API REST.

### Características

| Item             | Definição                  |
| ---------------- | -------------------------- |
| Protocolo        | HTTP/HTTPS                 |
| Estilo           | REST                       |
| Formato de dados | JSON                       |
| Autenticação     | Token de sessão ou JWT     |
| Respostas        | JSON padronizado           |
| Erros            | JSON com código e mensagem |
| Versionamento    | Prefixo `/api/v1`          |

### Exemplo de URL base

```text
/api/v1
```

### Exemplo de requisição

```http
POST /api/v1/flows/flow-001/connections
Content-Type: application/json
Authorization: Bearer token-do-usuario
```

```json
{
  "sourceBlockId": "block-001",
  "targetBlockId": "block-002",
  "type": "DEFAULT",
  "label": "Continuar"
}
```

### Exemplo de resposta de sucesso

```json
{
  "success": true,
  "data": {
    "id": "connection-001",
    "sourceBlockId": "block-001",
    "targetBlockId": "block-002",
    "type": "DEFAULT",
    "label": "Continuar"
  },
  "message": "Conexão criada com sucesso."
}
```

### Exemplo de resposta de erro

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CONNECTION",
    "message": "O bloco de origem não pode ser igual ao bloco de destino."
  }
}
```

---

## 4. Comunicação Interna entre Camadas

### 4.1 Controller para Service

Os controllers recebem requisições REST e chamam os services correspondentes.

Exemplo:

```text
FlowController
    ↓
FlowService
```

Responsabilidade do controller:

* receber requisição;
* validar dados obrigatórios;
* chamar o service;
* retornar HTTP response.

Responsabilidade do service:

* executar caso de uso;
* aplicar regras de negócio;
* chamar validators;
* chamar repositories;
* retornar resultado para o controller.

---

### 4.2 Service para Validator

Os services usam validators para garantir que as regras de negócio sejam respeitadas.

Exemplo:

```text
FlowService
    ↓
FlowValidator
```

Exemplo de validação:

```text
Antes de criar uma conexão, validar:
- se o bloco de origem existe;
- se o bloco de destino existe;
- se os blocos pertencem ao mesmo fluxo;
- se a conexão não é uma auto-conexão.
```

---

### 4.3 Service para Repository

Os services usam repositories para buscar ou salvar dados.

Exemplo:

```text
FlowService
    ↓
FlowRepository
    ↓
Database
```

O service não deve conhecer detalhes do banco de dados.
O repository é responsável por isolar essa lógica.

---

### 4.4 Repository para Database

O repository realiza operações de persistência.

Exemplos:

* buscar fluxo por ID;
* salvar novo bot;
* atualizar conexão;
* remover bloco;
* listar leads;
* salvar integração.

---

## 5. Endpoints REST Propostos

### 5.1 Autenticação

| Método | Endpoint                | Descrição                    |
| ------ | ----------------------- | ---------------------------- |
| `POST` | `/api/v1/auth/register` | Cadastrar usuário            |
| `POST` | `/api/v1/auth/login`    | Autenticar usuário           |
| `POST` | `/api/v1/auth/logout`   | Encerrar sessão              |
| `GET`  | `/api/v1/auth/me`       | Retornar usuário autenticado |

---

### 5.2 Usuários

| Método | Endpoint           | Descrição                   |
| ------ | ------------------ | --------------------------- |
| `GET`  | `/api/v1/users/me` | Buscar dados do usuário     |
| `PUT`  | `/api/v1/users/me` | Atualizar perfil do usuário |

---

### 5.3 Bots

| Método   | Endpoint                         | Descrição              |
| -------- | -------------------------------- | ---------------------- |
| `GET`    | `/api/v1/bots`                   | Listar bots do usuário |
| `POST`   | `/api/v1/bots`                   | Criar novo bot         |
| `GET`    | `/api/v1/bots/{botId}`           | Buscar bot específico  |
| `PUT`    | `/api/v1/bots/{botId}`           | Atualizar bot          |
| `DELETE` | `/api/v1/bots/{botId}`           | Remover bot            |
| `POST`   | `/api/v1/bots/{botId}/publish`   | Publicar bot           |
| `POST`   | `/api/v1/bots/{botId}/unpublish` | Despublicar bot        |

---

### 5.4 Fluxos

| Método | Endpoint                          | Descrição                     |
| ------ | --------------------------------- | ----------------------------- |
| `GET`  | `/api/v1/bots/{botId}/flow`       | Buscar fluxo do bot           |
| `POST` | `/api/v1/bots/{botId}/flow`       | Criar fluxo para o bot        |
| `PUT`  | `/api/v1/flows/{flowId}`          | Atualizar dados do fluxo      |
| `POST` | `/api/v1/flows/{flowId}/validate` | Validar consistência do fluxo |

---

### 5.5 Blocos

| Método   | Endpoint                                           | Descrição                  |
| -------- | -------------------------------------------------- | -------------------------- |
| `POST`   | `/api/v1/flows/{flowId}/blocks`                    | Criar bloco                |
| `PUT`    | `/api/v1/flows/{flowId}/blocks/{blockId}`          | Atualizar bloco            |
| `DELETE` | `/api/v1/flows/{flowId}/blocks/{blockId}`          | Remover bloco              |
| `PATCH`  | `/api/v1/flows/{flowId}/blocks/{blockId}/position` | Atualizar posição do bloco |

---

### 5.6 Conexões

| Método   | Endpoint                                            | Descrição                  |
| -------- | --------------------------------------------------- | -------------------------- |
| `POST`   | `/api/v1/flows/{flowId}/connections`                | Criar conexão entre blocos |
| `DELETE` | `/api/v1/flows/{flowId}/connections/{connectionId}` | Remover conexão            |
| `PUT`    | `/api/v1/flows/{flowId}/connections/{connectionId}` | Atualizar conexão          |

---

### 5.7 Leads

| Método   | Endpoint                     | Descrição               |
| -------- | ---------------------------- | ----------------------- |
| `GET`    | `/api/v1/bots/{botId}/leads` | Listar leads capturados |
| `GET`    | `/api/v1/leads/{leadId}`     | Buscar lead específico  |
| `DELETE` | `/api/v1/leads/{leadId}`     | Remover lead            |

---

### 5.8 Integrações

| Método   | Endpoint                                    | Descrição                 |
| -------- | ------------------------------------------- | ------------------------- |
| `GET`    | `/api/v1/bots/{botId}/integrations`         | Listar integrações do bot |
| `POST`   | `/api/v1/bots/{botId}/integrations`         | Criar integração          |
| `PUT`    | `/api/v1/integrations/{integrationId}`      | Atualizar integração      |
| `POST`   | `/api/v1/integrations/{integrationId}/test` | Testar integração         |
| `DELETE` | `/api/v1/integrations/{integrationId}`      | Remover integração        |

---

### 5.9 Conversas

| Método | Endpoint                                       | Descrição                  |
| ------ | ---------------------------------------------- | -------------------------- |
| `POST` | `/api/v1/public/bots/{botId}/sessions`         | Iniciar conversa pública   |
| `POST` | `/api/v1/public/sessions/{sessionId}/messages` | Enviar mensagem para o bot |
| `GET`  | `/api/v1/bots/{botId}/conversations`           | Listar conversas do bot    |

---

## 6. Contratos de Dados

### 6.1 Criar Bot

#### Requisição

```json
{
  "name": "Bot da Loja",
  "description": "Chatbot para atendimento inicial de clientes"
}
```

#### Resposta

```json
{
  "success": true,
  "data": {
    "id": "bot-001",
    "name": "Bot da Loja",
    "description": "Chatbot para atendimento inicial de clientes",
    "status": "DRAFT"
  },
  "message": "Bot criado com sucesso."
}
```

---

### 6.2 Criar Bloco

#### Requisição

```json
{
  "type": "MESSAGE",
  "title": "Boas-vindas",
  "content": "Olá! Seja bem-vindo. Como posso ajudar?",
  "positionX": 120,
  "positionY": 180
}
```

#### Resposta

```json
{
  "success": true,
  "data": {
    "id": "block-001",
    "type": "MESSAGE",
    "title": "Boas-vindas",
    "content": "Olá! Seja bem-vindo. Como posso ajudar?",
    "positionX": 120,
    "positionY": 180
  },
  "message": "Bloco criado com sucesso."
}
```

---

### 6.3 Criar Conexão

#### Requisição

```json
{
  "sourceBlockId": "block-001",
  "targetBlockId": "block-002",
  "type": "DEFAULT",
  "label": "Próximo"
}
```

#### Resposta

```json
{
  "success": true,
  "data": {
    "id": "connection-001",
    "sourceBlockId": "block-001",
    "targetBlockId": "block-002",
    "type": "DEFAULT",
    "label": "Próximo"
  },
  "message": "Conexão criada com sucesso."
}
```

---

### 6.4 Validar Fluxo

#### Requisição

```json
{
  "flowId": "flow-001"
}
```

#### Resposta

```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": []
  },
  "message": "Fluxo validado com sucesso."
}
```

---

## 7. Padrão de Resposta da API

Todas as respostas da API devem seguir um padrão.

### Resposta de sucesso

```json
{
  "success": true,
  "data": {},
  "message": "Operação realizada com sucesso."
}
```

### Resposta de erro

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem explicando o erro."
  }
}
```

Esse padrão facilita o tratamento de respostas no frontend.

---

## 8. Códigos HTTP

| Código                      | Uso                                   |
| --------------------------- | ------------------------------------- |
| `200 OK`                    | Operação realizada com sucesso        |
| `201 Created`               | Recurso criado com sucesso            |
| `400 Bad Request`           | Dados inválidos enviados pelo cliente |
| `401 Unauthorized`          | Usuário não autenticado               |
| `403 Forbidden`             | Usuário sem permissão                 |
| `404 Not Found`             | Recurso não encontrado                |
| `409 Conflict`              | Conflito de regra de negócio          |
| `500 Internal Server Error` | Erro interno inesperado               |

---

## 9. Comunicação com Integrações Externas

As integrações externas devem ser isoladas por adapters.

```text
IntegrationService
    ↓
WhatsAppIntegrationAdapter
    ↓
API Externa do WhatsApp
```

```text
IntegrationService
    ↓
InstagramIntegrationAdapter
    ↓
API Externa do Instagram
```

```text
IntegrationService
    ↓
WebsiteIntegrationAdapter
    ↓
Script incorporado no site do cliente
```

### Benefício dos adapters

Os adapters evitam que o domínio do sistema dependa diretamente de APIs externas.
Se uma API externa mudar, a alteração fica concentrada no adapter correspondente.

---

## 10. Comunicação por Webhooks

Para canais externos, o sistema pode usar webhooks.

Um webhook permite que um serviço externo envie eventos para o HelloHub.

Exemplo:

```text
WhatsApp recebe uma mensagem
        ↓
WhatsApp envia evento para o webhook do HelloHub
        ↓
WebhookController recebe o evento
        ↓
ConversationService processa a mensagem
        ↓
Bot responde conforme o fluxo configurado
```

### Endpoint de webhook

```text
POST /api/v1/webhooks/whatsapp
POST /api/v1/webhooks/instagram
```

---

## 11. Comunicação no Caso de Uso Principal

### Caso: conectar dois blocos no editor visual

```text
1. Usuário arrasta uma seta entre dois blocos.
2. EditorCanvas captura o evento.
3. Frontend envia POST /api/v1/flows/{flowId}/connections.
4. FlowController recebe a requisição.
5. FlowController chama FlowService.
6. FlowService busca o fluxo no FlowRepository.
7. FlowService chama FlowValidator.
8. FlowValidator valida a conexão.
9. FlowService cria a Connection.
10. FlowRepository salva o fluxo atualizado.
11. Backend retorna resposta de sucesso.
12. Frontend renderiza a conexão definitiva.
```

---

## 12. Comunicação no Caso de Publicação do Bot

### Caso: publicar bot

```text
1. Usuário clica em publicar.
2. Frontend envia POST /api/v1/bots/{botId}/publish.
3. BotController recebe a requisição.
4. BotController chama BotService.
5. BotService carrega o fluxo do bot.
6. FlowValidator valida a consistência do fluxo.
7. Se o fluxo estiver válido, o BotService altera status para PUBLISHED.
8. BotRepository salva o novo status.
9. Backend retorna confirmação.
10. Frontend mostra mensagem de sucesso.
```

---

## 13. Segurança na Comunicação

A comunicação deve considerar medidas básicas de segurança:

* uso de HTTPS;
* autenticação por token;
* validação de permissões por usuário;
* proteção de endpoints privados;
* validação dos dados recebidos;
* não exposição de senhas;
* armazenamento de senhas com hash;
* tratamento seguro de tokens de integrações externas.

### Exemplo de regra

Um usuário só pode acessar bots que pertencem à sua própria conta.

```text
User A não pode editar Bot de User B.
```

---

## 14. Justificativa da Comunicação REST

A comunicação REST foi escolhida porque é simples, amplamente utilizada e adequada para aplicações web com frontend e backend separados.

Ela é adequada ao HelloHub porque:

1. facilita a comunicação entre interface e backend;
2. usa HTTP, que é padrão em aplicações web;
3. permite troca de dados em JSON;
4. facilita testes com ferramentas de API;
5. permite versionamento dos endpoints;
6. organiza os recursos do sistema por URLs;
7. facilita futuras integrações com aplicações externas.

---

## 15. Conclusão

A comunicação entre os componentes do HelloHub será organizada principalmente por meio de API REST entre frontend e backend, chamadas internas entre camadas e adapters para serviços externos.

Essa abordagem atende à Sprint 3 porque define claramente:

* como a interface conversa com o backend;
* como controllers, services, validators e repositories interagem;
* como o banco de dados é acessado;
* como integrações externas podem ser conectadas;
* como os principais casos de uso trafegam pelo sistema.

Com isso, a arquitetura do HelloHub fica preparada para implementação do MVP e evolução futura da plataforma.
