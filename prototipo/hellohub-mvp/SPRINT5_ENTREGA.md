# Sprint 5 - Entrega do MVP funcional

## Projeto

HelloHub - plataforma no-code para criacao, configuracao e publicacao de chatbots simples.

## Caminho do MVP

Arquivo principal:

`prototipo/hellohub-mvp/index.html`

Para executar, basta abrir o arquivo `index.html` no navegador. O prototipo nao exige backend, banco de dados, servidor local ou instalacao de dependencias.

## O que existia antes

Antes desta implementacao, o repositorio continha principalmente:

- documentacao de contexto, especificacao, interface, arquitetura e planejamento;
- modelagem de classes e relacionamentos;
- planejamento do MVP na Sprint 4;
- estrutura `src/` ainda sem uma aplicacao funcional completa.

## O que foi implementado agora

Foi implementado um MVP funcional, isolado em `prototipo/hellohub-mvp`, com foco na funcionalidade principal definida pelo grupo: construtor visual de fluxo de conversa com publicacao simples.

Funcionalidades implementadas:

- login demonstrativo;
- painel de gerenciamento de chatbots;
- criacao de chatbot com nome e descricao;
- editor visual com caixas arrastaveis;
- conexao entre caixas;
- edicao de textos das caixas, entradas e saidas;
- simulador de conversa no editor;
- validacao basica do fluxo antes da publicacao;
- publicacao do bot por link local;
- tela de chat publicada para o visitante;
- aba de integracoes demonstrativas para site, WhatsApp, Instagram e API/sistema interno;
- persistencia fake em `localStorage`.

## Funcionalidade principal do MVP

A funcionalidade principal implementada foi o construtor visual de fluxo. O usuario consegue criar um chatbot, montar a logica da conversa por caixas, conectar essas caixas, testar o fluxo no simulador e publicar o bot para interacao em uma tela de chat.

Essa entrega demonstra a proposta central do HelloHub: permitir que uma pessoa crie um atendimento automatizado simples sem escrever codigo.

## Fluxo completo de entrada, processamento e saida

### Entrada

O usuario informa dados no navegador:

- login demonstrativo;
- nome e descricao do chatbot;
- textos das caixas do fluxo;
- conexoes entre caixas;
- dados demonstrativos de integracao.

### Processamento

O sistema processa os dados no proprio navegador:

- cria objetos de `User`, `Bot`, `Flow`, `Block`, `Connection` e `Integration` de forma simplificada;
- salva e recupera dados do `localStorage`;
- valida o fluxo antes da publicacao;
- interpreta as conexoes do fluxo para executar a conversa;
- gera um token/link local para acesso ao bot publicado.

### Saida

O sistema apresenta ao usuario:

- dashboard com bots criados;
- canvas visual com caixas e conexoes;
- mensagens de validacao do fluxo;
- simulador de conversa;
- link local do bot publicado;
- interface de chat para o visitante;
- exemplos de integracao com site, WhatsApp, Instagram e API.

## Relacao com a modelagem de classes

| Classe planejada | Como aparece no MVP |
|---|---|
| `User` | Objeto `state.user`, criado no login demonstrativo |
| `Bot` | Cada item de `state.bots`, com nome, descricao, status, token e integracoes |
| `Flow` | Estrutura formada por `nodes` e `connections` dentro de cada bot |
| `Block` | Cada caixa visual do canvas, representada em `nodes` |
| `Connection` | Cada ligacao entre caixas, representada em `connections` |
| `FlowValidator` | Funcao `validateFlow(bot)`, usada antes da publicacao |
| `FlowService` | Funcoes de caso de uso que criam caixas, conectam blocos, salvam e publicam |
| `FlowRepository` | Persistencia simplificada usando `localStorage` |
| `EditorCanvas` | Area visual `.canvas-shell`, caixas `.flow-box` e linhas SVG |
| `FlowEditorView` | Tela `renderFlowView`, com canvas, painel lateral e simulador |
| `Integration` | Objeto `bot.integrations`, com site, WhatsApp, Instagram e API |
| `ConversationSession` / `Message` | Simulados na tela de chat e no simulador por meio das mensagens exibidas |

## Relacao com a arquitetura definida

| Camada planejada | Implementacao no MVP |
|---|---|
| Interface Web | `index.html`, `styles.css` e funcoes de renderizacao no `app.js` |
| Controller | Eventos de clique, submit, drag and drop e navegacao por hash |
| Service | Funcoes que executam criacao de bot, criacao de caixa, conexao, publicacao e runtime |
| Domain | Objetos estruturados para usuario, bot, fluxo, caixas, conexoes e integracoes |
| Validator | `validateFlow(bot)` |
| Repository | Salvamento e carregamento por `localStorage` |
| Database | Simulado pelo armazenamento local do navegador |
| External Integration | Aba de integracoes com dados e codigos demonstrativos |

O MVP nao implementa backend real nem API REST real, porque a entrega foi mantida simples para demonstracao. Mesmo assim, a organizacao dos dados e dos fluxos segue a arquitetura em camadas planejada, de forma simplificada.

## Testes basicos

### Teste automatizado simples

Executar na pasta do repositorio:

```powershell
node prototipo\hellohub-mvp\tests\smoke-test.mjs
```

Esse teste verifica:

- existencia dos arquivos principais;
- carregamento de `styles.css` e `app.js` no HTML;
- presenca das estruturas de fluxo, conexoes e integracoes;
- existencia da validacao de fluxo;
- presenca das telas principais do MVP;
- existencia deste documento de entrega.

### Validacao de sintaxe

Executar:

```powershell
node --check prototipo\hellohub-mvp\app.js
```

### Testes manuais sugeridos

| Caso | Passos | Resultado esperado |
|---|---|---|
| Login demonstrativo | Abrir `index.html` e acessar com os dados preenchidos | Usuario entra no painel |
| Criar bot | Preencher nome e descricao e criar chatbot | Bot aparece no editor de fluxo |
| Mover caixas | Arrastar uma caixa no canvas | Posicao da caixa muda e fica salva |
| Conectar caixas | Clicar em `Conectar caixas`, escolher origem e destino | Linha aparece entre as caixas |
| Editar saida | Alterar texto em `Saidas desta caixa` | Botao do simulador usa o novo texto |
| Validar fluxo | Remover conexao obrigatoria e tentar publicar | Sistema bloqueia publicacao e mostra pendencias |
| Publicar bot | Corrigir fluxo e clicar em publicar | Bot muda para publicado e pode ser testado |
| Chat publicado | Clicar em `Testar chat` | Conversa segue as conexoes do fluxo |
| Integracoes | Abrir aba `Integracoes` e salvar dados | Dados aparecem no resumo demonstrativo |

## Evidencia de funcionamento

Para video ou demonstracao em aula, o roteiro recomendado e:

1. Abrir `prototipo/hellohub-mvp/index.html`.
2. Entrar com o login demonstrativo.
3. Criar ou abrir o bot de exemplo.
4. Arrastar caixas no canvas.
5. Criar uma conexao entre duas caixas.
6. Editar texto de entrada/saida.
7. Usar `Testar caixa selecionada` no simulador.
8. Publicar o bot.
9. Abrir o chat publicado e interagir com as opcoes.
10. Mostrar a aba `Integracoes`.

## Limites do MVP

Este MVP nao representa o sistema completo. Ele nao possui backend real, banco de dados real, autenticacao segura, API REST real ou integracoes reais com canais externos. Esses pontos permanecem como evolucao futura.

O objetivo desta entrega e demonstrar a funcionalidade principal do projeto de forma funcional, compreensivel e coerente com o planejamento das sprints anteriores.
