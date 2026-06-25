# HelloHub MVP

Prototipo simples e isolado do projeto HelloHub.

## Como rodar

Abra o arquivo `index.html` no navegador.

Nao precisa instalar dependencias, rodar servidor, configurar banco ou executar backend.

## Roteiro rapido de demonstracao

1. Entre com o login demonstrativo.
2. Abra o bot de exemplo ou crie um novo chatbot.
3. Arraste as caixas no canvas para reorganizar o fluxo.
4. Clique em `Conectar caixas`, escolha uma caixa de origem e depois uma caixa de destino.
5. Edite o texto da caixa selecionada no painel lateral.
6. Edite as `Entradas desta caixa` e `Saidas desta caixa` para mudar os textos dos botoes.
7. Use `Testar caixa selecionada` no simulador para ver imediatamente os botoes da caixa atual.
8. Publique o bot e teste o chat publicado.
9. Abra a aba `Integracoes` para ver exemplos de site, WhatsApp, Instagram e API.

## Entrega da Sprint 5

A descricao da implementacao, relacao com modelagem/arquitetura e roteiro de evidencia estao em:

`SPRINT5_ENTREGA.md`

## Testes basicos

Validar sintaxe do JavaScript:

```powershell
node --check prototipo\hellohub-mvp\app.js
```

Rodar smoke test sem dependencias:

```powershell
node prototipo\hellohub-mvp\tests\smoke-test.mjs
```

## O que o MVP demonstra

- Login demonstrativo.
- Painel com chatbots criados.
- Criacao de chatbot com nome e descricao.
- Construtor visual com caixas arrastaveis.
- Conexao entre caixas clicando na origem e depois no destino.
- Edicao dos textos de entrada e saida das conexoes.
- Validacao basica do fluxo antes da publicacao.
- Simulador de conversa que segue as conexoes criadas.
- Publicacao do chatbot com link local.
- Tela de chat para testar o bot publicado.
- Aba de integracoes fake para site, WhatsApp, Instagram e API/sistema interno.

## Observacao

Os dados ficam salvos apenas no `localStorage` do navegador. Este prototipo serve para demonstracao academica do fluxo principal, nao para uso em producao.
