const STORAGE_KEY = "hellohub-mvp-state";
const CANVAS_WIDTH = 980;
const CANVAS_HEIGHT = 650;
const NODE_WIDTH = 230;
const NODE_HEIGHT = 118;

const nodeKindLabels = {
  start: "Inicio",
  message: "Mensagem",
  question: "Pergunta",
  action: "Acao",
  end: "Final"
};

const defaultState = {
  user: null,
  bots: [
    {
      id: "demo-bot",
      token: "hello-demo",
      name: "Atendimento da Loja",
      description: "Bot simples para responder duvidas frequentes de clientes.",
      status: "published",
      createdAt: "2026-06-24",
      nodes: [
        {
          id: "start",
          kind: "start",
          title: "Boas-vindas",
          body: "Ola! Sou o assistente da loja. Como posso ajudar voce hoje?",
          x: 50,
          y: 245
        },
        {
          id: "hours",
          kind: "message",
          title: "Ver horarios",
          body: "Atendemos de segunda a sexta, das 9h as 18h.",
          x: 370,
          y: 110
        },
        {
          id: "delivery",
          kind: "question",
          title: "Entrega",
          body: "Enviamos para todo o Brasil. Voce quer saber prazo ou valor de frete?",
          x: 370,
          y: 390
        },
        {
          id: "deadline",
          kind: "end",
          title: "Prazo",
          body: "O prazo medio de entrega e de 3 a 7 dias uteis.",
          x: 690,
          y: 310
        },
        {
          id: "shipping",
          kind: "end",
          title: "Frete",
          body: "O frete e calculado automaticamente no fechamento do pedido.",
          x: 690,
          y: 470
        }
      ],
      connections: [
        { id: "conn-start-hours", from: "start", to: "hours", label: "Ver horarios" },
        { id: "conn-start-delivery", from: "start", to: "delivery", label: "Saber sobre entrega" },
        { id: "conn-delivery-deadline", from: "delivery", to: "deadline", label: "Prazo" },
        { id: "conn-delivery-shipping", from: "delivery", to: "shipping", label: "Valor do frete" }
      ],
      integrations: {
        website: {
          enabled: true,
          url: "https://minhaloja.com.br"
        },
        whatsapp: {
          enabled: false,
          number: "+55 31 99999-0000"
        },
        instagram: {
          enabled: false,
          account: "@minhaloja"
        },
        api: {
          enabled: true,
          accountId: "conta-demo-001",
          webhook: "https://minhaloja.com.br/webhooks/hellohub"
        }
      }
    }
  ]
};

let state = normalizeState(loadState());
let ui = {
  selectedNodeId: "start",
  connecting: false,
  connectFrom: null,
  preview: {}
};

saveState();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return clone(defaultState);
  }

  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : clone(defaultState);
  } catch (error) {
    return clone(defaultState);
  }
}

function normalizeState(rawState) {
  const normalized = {
    user: rawState.user || null,
    bots: Array.isArray(rawState.bots) && rawState.bots.length
      ? rawState.bots.map(normalizeBot)
      : clone(defaultState.bots)
  };

  return normalized;
}

function normalizeBot(bot) {
  const normalized = {
    id: bot.id || makeId("bot"),
    token: bot.token || makeToken(bot.name || "bot"),
    name: bot.name || "Chatbot sem nome",
    description: bot.description || "Bot demonstrativo do HelloHub.",
    status: bot.status || "draft",
    createdAt: bot.createdAt || new Date().toISOString().slice(0, 10),
    nodes: Array.isArray(bot.nodes) && bot.nodes.length
      ? bot.nodes.map((node, index) => ({
          id: node.id || makeId("node"),
          kind: node.kind || (index === 0 ? "start" : "message"),
          title: node.title || node.label || `Caixa ${index + 1}`,
          body: node.body || node.response || node.text || "Mensagem do chatbot.",
          x: Number.isFinite(node.x) ? node.x : 80 + index * 260,
          y: Number.isFinite(node.y) ? node.y : 160 + index * 40
        }))
      : createNodesFromOldOptions(bot),
    connections: Array.isArray(bot.connections) && bot.connections.length
      ? bot.connections.map((connection) => ({
          id: connection.id || makeId("conn"),
          from: connection.from,
          to: connection.to,
          label: connection.label || "Continuar"
        }))
      : createConnectionsFromOldOptions(bot),
    integrations: {
      website: {
        enabled: Boolean(bot.integrations && bot.integrations.website && bot.integrations.website.enabled),
        url: (bot.integrations && bot.integrations.website && bot.integrations.website.url) || "https://meusite.com.br"
      },
      whatsapp: {
        enabled: Boolean(bot.integrations && bot.integrations.whatsapp && bot.integrations.whatsapp.enabled),
        number: (bot.integrations && bot.integrations.whatsapp && bot.integrations.whatsapp.number) || "+55 31 99999-0000"
      },
      instagram: {
        enabled: Boolean(bot.integrations && bot.integrations.instagram && bot.integrations.instagram.enabled),
        account: (bot.integrations && bot.integrations.instagram && bot.integrations.instagram.account) || "@minhaconta"
      },
      api: {
        enabled: Boolean(bot.integrations && bot.integrations.api && bot.integrations.api.enabled),
        accountId: (bot.integrations && bot.integrations.api && bot.integrations.api.accountId) || "conta-demo-001",
        webhook: (bot.integrations && bot.integrations.api && bot.integrations.api.webhook) || "https://meusistema.com.br/webhook"
      }
    }
  };

  if (!normalized.nodes.some((node) => node.kind === "start")) {
    normalized.nodes.unshift({
      id: "start",
      kind: "start",
      title: "Boas-vindas",
      body: bot.greeting || "Ola! Como posso ajudar?",
      x: 50,
      y: 245
    });
  }

  normalized.connections = normalized.connections.filter((connection) => {
    return getNodeFromList(normalized.nodes, connection.from) && getNodeFromList(normalized.nodes, connection.to);
  });

  return normalized;
}

function createNodesFromOldOptions(bot) {
  const greeting = bot.greeting || "Ola! Como posso ajudar voce hoje?";
  const nodes = [
    {
      id: "start",
      kind: "start",
      title: "Boas-vindas",
      body: greeting,
      x: 50,
      y: 245
    }
  ];

  const options = Array.isArray(bot.options) && bot.options.length ? bot.options : [
    {
      id: makeId("op"),
      label: "Quero saber mais",
      response: "Claro! Me diga qual informacao voce procura."
    }
  ];

  options.forEach((option, index) => {
    nodes.push({
      id: `node-${option.id || index}`,
      kind: index === options.length - 1 ? "end" : "message",
      title: option.label || `Opcao ${index + 1}`,
      body: option.response || "Resposta do chatbot.",
      x: 380,
      y: 90 + index * 160
    });
  });

  return nodes;
}

function createConnectionsFromOldOptions(bot) {
  const options = Array.isArray(bot.options) && bot.options.length ? bot.options : [
    {
      id: makeId("op"),
      label: "Quero saber mais"
    }
  ];

  return options.map((option, index) => ({
    id: makeId("conn"),
    from: "start",
    to: `node-${option.id || index}`,
    label: option.label || `Opcao ${index + 1}`
  }));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function makeToken(name) {
  const base = String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 28);

  return `${base || "bot"}-${Math.random().toString(16).slice(2, 6)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getNodeFromList(nodes, nodeId) {
  return nodes.find((node) => node.id === nodeId);
}

function getBotById(id) {
  return state.bots.find((bot) => bot.id === id);
}

function getBotByToken(token) {
  return state.bots.find((bot) => bot.token === token && bot.status === "published");
}

function getStartNode(bot) {
  return bot.nodes.find((node) => node.kind === "start") || bot.nodes[0];
}

function getOutgoing(bot, nodeId) {
  return bot.connections.filter((connection) => connection.from === nodeId);
}

function getIncoming(bot, nodeId) {
  return bot.connections.filter((connection) => connection.to === nodeId);
}

function getIntegrationCount(bot) {
  return Object.values(bot.integrations || {}).filter((integration) => integration.enabled).length;
}

function navigate(hash) {
  window.location.hash = hash;
}

function renderShell(content) {
  const userName = state.user ? escapeHtml(state.user.name) : "";
  document.querySelector("#app").innerHTML = `
    <header class="topbar">
      <button class="brand brand-button" data-action="home" type="button">
        <span class="brand-mark">H</span>
        <span>HelloHub MVP</span>
      </button>
      <div class="topbar-actions">
        ${state.user ? `<span class="user-chip">${userName}</span>` : ""}
        ${state.user ? `<button class="btn ghost" data-action="logout">Sair</button>` : ""}
      </div>
    </header>
    ${content}
  `;

  const homeButton = document.querySelector('[data-action="home"]');
  if (homeButton) {
    homeButton.addEventListener("click", () => {
      navigate(state.user ? "#dashboard" : "#login");
      render();
    });
  }

  const logoutButton = document.querySelector('[data-action="logout"]');
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      state.user = null;
      saveState();
      navigate("#login");
      render();
    });
  }
}

function renderLogin() {
  document.querySelector("#app").innerHTML = `
    <section class="login-page">
      <div class="intro-panel">
        <p class="eyebrow">No-code para atendimento</p>
        <h1>HelloHub</h1>
        <p>
          Crie automacoes por caixas, conecte respostas e publique um chatbot
          simples para demonstrar o funcionamento do projeto.
        </p>
        <div class="value-list">
          <div class="value-item">
            <strong>Caixas visuais</strong>
            <span>Arraste blocos de conversa em um canvas simples.</span>
          </div>
          <div class="value-item">
            <strong>Conexoes</strong>
            <span>Clique em duas caixas para criar o caminho do atendimento.</span>
          </div>
          <div class="value-item">
            <strong>Integracoes</strong>
            <span>Veja exemplos fake para site, WhatsApp, Instagram e API.</span>
          </div>
        </div>
      </div>

      <form class="card login-card" id="loginForm">
        <h2>Entrar no prototipo</h2>
        <p>Login demonstrativo. Nenhum dado sai do navegador.</p>
        <div class="form-grid">
          <label class="field">
            <span>Nome</span>
            <input name="name" required value="Usuario Demo" />
          </label>
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" required value="demo@hellohub.com" />
          </label>
          <button class="btn" type="submit">Acessar painel</button>
        </div>
      </form>
    </section>
  `;

  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.user = {
      name: String(form.get("name")).trim(),
      email: String(form.get("email")).trim()
    };
    saveState();
    navigate("#dashboard");
    render();
  });
}

function renderDashboard() {
  const total = state.bots.length;
  const published = state.bots.filter((bot) => bot.status === "published").length;
  const totalNodes = state.bots.reduce((sum, bot) => sum + bot.nodes.length, 0);
  const totalIntegrations = state.bots.reduce((sum, bot) => sum + getIntegrationCount(bot), 0);

  renderShell(`
    <section class="page">
      <div class="section-title">
        <div>
          <p class="eyebrow">Painel</p>
          <h1>Seus chatbots</h1>
          <p>Crie bots com caixas, conexoes e canais de integracao para apresentar a proposta do HelloHub.</p>
        </div>
        <button class="btn" data-action="focus-create">Novo chatbot</button>
      </div>

      <div class="stats-row">
        <div class="card stat">
          <strong>${total}</strong>
          <span>Bots criados</span>
        </div>
        <div class="card stat">
          <strong>${published}</strong>
          <span>Bots publicados</span>
        </div>
        <div class="card stat">
          <strong>${totalNodes}</strong>
          <span>Caixas no fluxo</span>
        </div>
        <div class="card stat">
          <strong>${totalIntegrations}</strong>
          <span>Integracoes ativas</span>
        </div>
      </div>

      <div class="dashboard-grid">
        <form class="card panel-pad" id="createBotForm">
          <h2>Novo chatbot</h2>
          <div class="form-grid">
            <label class="field">
              <span>Nome</span>
              <input name="name" required placeholder="Ex: Atendimento da cafeteria" />
            </label>
            <label class="field">
              <span>Descricao</span>
              <textarea name="description" required placeholder="Explique rapidamente para que o bot serve."></textarea>
            </label>
            <button class="btn" type="submit">Criar e editar fluxo</button>
          </div>
        </form>

        <div class="card panel-pad">
          <h2>Bots cadastrados</h2>
          <div class="bot-list">
            ${state.bots.length ? state.bots.map(renderBotCard).join("") : `
              <div class="empty-state">Nenhum chatbot criado ainda.</div>
            `}
          </div>
        </div>
      </div>
    </section>
  `);

  document.querySelector('[data-action="focus-create"]').addEventListener("click", () => {
    document.querySelector("#createBotForm input").focus();
  });

  document.querySelector("#createBotForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const description = String(form.get("description")).trim();

    const firstNodeId = makeId("node");
    const bot = normalizeBot({
      id: makeId("bot"),
      token: makeToken(name),
      name,
      description,
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      nodes: [
        {
          id: "start",
          kind: "start",
          title: "Boas-vindas",
          body: "Ola! Como posso ajudar voce hoje?",
          x: 60,
          y: 250
        },
        {
          id: firstNodeId,
          kind: "message",
          title: "Quero saber mais",
          body: "Claro! Me diga qual informacao voce procura.",
          x: 390,
          y: 250
        }
      ],
      connections: [
        {
          id: makeId("conn"),
          from: "start",
          to: firstNodeId,
          label: "Quero saber mais"
        }
      ]
    });

    state.bots.unshift(bot);
    ui.selectedNodeId = getStartNode(bot).id;
    resetPreview(bot);
    saveState();
    navigate(`#builder/${bot.id}/flow`);
    render();
  });

  document.querySelectorAll("[data-edit-bot]").forEach((button) => {
    button.addEventListener("click", () => {
      navigate(`#builder/${button.dataset.editBot}/flow`);
      render();
    });
  });

  document.querySelectorAll("[data-integrate-bot]").forEach((button) => {
    button.addEventListener("click", () => {
      navigate(`#builder/${button.dataset.integrateBot}/integrations`);
      render();
    });
  });

  document.querySelectorAll("[data-test-bot]").forEach((button) => {
    button.addEventListener("click", () => {
      navigate(`#chat/${button.dataset.testBot}`);
      render();
    });
  });

  document.querySelectorAll("[data-delete-bot]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteBot;
      state.bots = state.bots.filter((bot) => bot.id !== id);
      saveState();
      renderDashboard();
    });
  });
}

function renderBotCard(bot) {
  const isLive = bot.status === "published";
  return `
    <article class="bot-card">
      <div class="bot-card-header">
        <div>
          <h3>${escapeHtml(bot.name)}</h3>
          <p>${escapeHtml(bot.description)}</p>
        </div>
        <span class="status ${isLive ? "live" : ""}">${isLive ? "Publicado" : "Rascunho"}</span>
      </div>
      <div class="bot-meta">
        <span>${bot.nodes.length} caixas</span>
        <span>${bot.connections.length} conexoes</span>
        <span>${getIntegrationCount(bot)} integracoes</span>
      </div>
      <div class="bot-actions">
        <button class="btn secondary" data-edit-bot="${bot.id}">Editar fluxo</button>
        <button class="btn secondary" data-integrate-bot="${bot.id}">Integracoes</button>
        ${isLive ? `<button class="btn secondary" data-test-bot="${bot.token}">Testar chat</button>` : ""}
        <button class="btn ghost" data-delete-bot="${bot.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderBuilder(botId, tab = "flow") {
  const bot = getBotById(botId);
  if (!bot) {
    navigate("#dashboard");
    render();
    return;
  }

  const selectedNode = getNodeFromList(bot.nodes, ui.selectedNodeId) || getStartNode(bot);
  ui.selectedNodeId = selectedNode.id;

  renderShell(`
    <section class="page page-wide">
      <div class="section-title">
        <div>
          <p class="eyebrow">Editor do chatbot</p>
          <h1>${escapeHtml(bot.name)}</h1>
          <p>${escapeHtml(bot.description)}</p>
        </div>
        <div class="topbar-actions action-stack">
          <button class="btn secondary" data-action="back-dashboard">Voltar</button>
          ${bot.status === "published" ? `<button class="btn secondary" data-action="test-chat">Testar chat</button>` : ""}
          <button class="btn" data-action="publish">Publicar bot</button>
        </div>
      </div>

      ${renderBuilderTabs(bot, tab)}
      ${tab === "integrations" ? renderIntegrationsView(bot) : renderFlowView(bot, selectedNode)}
    </section>
  `);

  wireCommonBuilderEvents(bot);

  if (tab === "integrations") {
    wireIntegrationsEvents(bot);
  } else {
    wireFlowEvents(bot);
  }
}

function renderBuilderTabs(bot, tab) {
  return `
    <div class="builder-tabs">
      <button class="tab-button ${tab === "flow" ? "active" : ""}" data-builder-tab="flow" type="button">
        Fluxo por caixas
      </button>
      <button class="tab-button ${tab === "integrations" ? "active" : ""}" data-builder-tab="integrations" type="button">
        Integracoes
      </button>
      ${bot.status === "published" ? `<span class="status live">Link publicado</span>` : `<span class="status">Rascunho</span>`}
    </div>
  `;
}

function renderFlowView(bot, selectedNode) {
  return `
    <div class="automation-layout">
      <aside class="card panel-pad flow-tools">
        <h2>Caixa selecionada</h2>
        ${renderNodeEditor(bot, selectedNode)}
      </aside>

      <section class="card automation-board">
        <div class="board-toolbar">
          <div>
            <strong>Canvas do fluxo</strong>
            <p class="helper-text">Arraste as caixas. Para conectar, ative o modo e clique na origem e no destino.</p>
          </div>
          <div class="board-actions">
            <button class="btn secondary ${ui.connecting ? "active-mode" : ""}" data-action="toggle-connect" type="button">
              ${ui.connecting ? "Conectando..." : "Conectar caixas"}
            </button>
            <button class="btn secondary" data-action="auto-layout" type="button">Organizar</button>
          </div>
        </div>
        ${ui.connecting ? renderConnectHint(bot) : ""}
        <div class="canvas-shell" id="flowCanvas">
          ${renderConnectionLayer(bot)}
          ${bot.nodes.map((node) => renderCanvasNode(node)).join("")}
        </div>
      </section>

      <aside class="card panel-pad simulator-panel">
        ${renderSimulator(bot)}
      </aside>
    </div>
  `;
}

function renderNodeEditor(bot, selectedNode) {
  const outgoing = getOutgoing(bot, selectedNode.id);
  const incoming = getIncoming(bot, selectedNode.id);
  const canDelete = selectedNode.kind !== "start";
  return `
    <form class="node-form" id="nodeForm">
      <label class="field">
        <span>Tipo da caixa</span>
        <select name="kind" ${selectedNode.kind === "start" ? "disabled" : ""}>
          ${Object.entries(nodeKindLabels).filter(([value]) => value !== "start" || selectedNode.kind === "start").map(([value, label]) => `
            <option value="${value}" ${selectedNode.kind === value ? "selected" : ""}>${label}</option>
          `).join("")}
        </select>
      </label>
      <label class="field">
        <span>Titulo</span>
        <input name="title" required value="${escapeHtml(selectedNode.title)}" />
      </label>
      <label class="field">
        <span>Texto exibido ao cliente</span>
        <textarea name="body" required>${escapeHtml(selectedNode.body)}</textarea>
      </label>

      <div class="connection-list">
        <h3>Entradas desta caixa</h3>
        ${incoming.length ? incoming.map((connection) => renderConnectionEditor(bot, connection, "incoming")).join("") : `
          <p class="helper-text">Esta caixa ainda nao recebe conexoes de outras caixas.</p>
        `}
      </div>

      <div class="connection-list">
        <h3>Saidas desta caixa</h3>
        ${outgoing.length ? outgoing.map((connection) => renderConnectionEditor(bot, connection, "outgoing")).join("") : `
          <p class="helper-text">Sem saidas. Use "Conectar caixas" ou adicione uma nova caixa abaixo.</p>
        `}
      </div>

      <button class="btn" type="submit">Salvar caixa</button>
      <button class="btn secondary" type="button" data-action="duplicate-node">Duplicar caixa</button>
      <button class="btn ghost" type="button" data-action="delete-node" ${canDelete ? "" : "disabled"}>Excluir caixa</button>
    </form>

    <div class="quick-actions">
      <h3>Adicionar nova saida</h3>
      <p class="helper-text">Cria uma nova caixa ja conectada a caixa selecionada.</p>
      <button class="btn secondary" type="button" data-add-node="message">Saida com mensagem</button>
      <button class="btn secondary" type="button" data-add-node="question">Saida com pergunta</button>
      <button class="btn secondary" type="button" data-add-node="end">Saida final</button>
    </div>
  `;
}

function renderConnectionEditor(bot, connection, mode) {
  const source = getNodeFromList(bot.nodes, connection.from);
  const target = getNodeFromList(bot.nodes, connection.to);
  const relationLabel = mode === "incoming"
    ? `Botao vindo de: ${source ? source.title : "caixa removida"}`
    : `Botao para: ${target ? target.title : "caixa removida"}`;

  return `
    <div class="connection-editor">
      <label class="field">
        <span>${escapeHtml(relationLabel)}</span>
        <input name="conn-${connection.id}" value="${escapeHtml(connection.label)}" />
      </label>
      <button class="btn ghost" type="button" data-remove-connection="${connection.id}">Remover conexao</button>
    </div>
  `;
}

function renderConnectHint(bot) {
  if (!ui.connectFrom) {
    return `<div class="connect-hint">Clique na caixa de origem da conexao.</div>`;
  }

  const fromNode = getNodeFromList(bot.nodes, ui.connectFrom);
  return `<div class="connect-hint">Origem: <strong>${escapeHtml(fromNode.title)}</strong>. Agora clique na caixa de destino.</div>`;
}

function renderCanvasNode(node) {
  const selected = ui.selectedNodeId === node.id ? "selected" : "";
  const connectSource = ui.connectFrom === node.id ? "connect-source" : "";
  return `
    <article
      class="flow-box ${selected} ${connectSource} kind-${node.kind}"
      data-node-id="${node.id}"
      style="left: ${node.x}px; top: ${node.y}px;"
    >
      <div class="flow-box-head">
        <span class="drag-handle">::</span>
        <span class="node-kind">${nodeKindLabels[node.kind] || "Caixa"}</span>
      </div>
      <h3>${escapeHtml(node.title)}</h3>
      <p>${escapeHtml(node.body)}</p>
      <div class="node-ports">
        <span>entrada</span>
        <span>saida</span>
      </div>
    </article>
  `;
}

function renderConnectionLayer(bot) {
  return `
    <svg class="connection-layer" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" aria-hidden="true">
      ${renderConnectionSvgContent(bot)}
    </svg>
  `;
}

function renderConnectionSvgContent(bot) {
  const nodesById = Object.fromEntries(bot.nodes.map((node) => [node.id, node]));
  const paths = bot.connections.map((connection) => {
    const from = nodesById[connection.from];
    const to = nodesById[connection.to];
    if (!from || !to) {
      return "";
    }

    const x1 = from.x + NODE_WIDTH;
    const y1 = from.y + NODE_HEIGHT / 2;
    const x2 = to.x;
    const y2 = to.y + NODE_HEIGHT / 2;
    const curve = Math.max(70, Math.abs(x2 - x1) * 0.45);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const safeLabel = escapeHtml(connection.label);

    return `
      <path class="connection-path" d="M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}" marker-end="url(#arrow)" />
      <text class="connection-label" x="${midX}" y="${midY - 10}" text-anchor="middle">${safeLabel}</text>
    `;
  }).join("");

  return `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#0b7a68"></path>
      </marker>
    </defs>
    ${paths}
  `;
}

function renderSimulator(bot) {
  const preview = ensurePreview(bot);
  const currentNode = getNodeFromList(bot.nodes, preview.currentNodeId) || getStartNode(bot);
  const outgoing = getOutgoing(bot, currentNode.id);
  const selectedNode = getNodeFromList(bot.nodes, ui.selectedNodeId) || getStartNode(bot);

  return `
    <div class="simulator-head">
      <div>
        <h2>Simulador</h2>
        <p class="helper-text">Caixa atual: ${escapeHtml(currentNode.title)}</p>
      </div>
      <div class="simulator-actions">
        <button class="btn ghost" data-action="preview-selected" type="button">Testar caixa selecionada</button>
        <button class="btn ghost" data-action="reset-preview" type="button">Recomecar</button>
      </div>
    </div>
    ${selectedNode.id !== currentNode.id ? `<p class="helper-text simulator-note">Selecione "Testar caixa selecionada" para ver as saidas de ${escapeHtml(selectedNode.title)}.</p>` : ""}
    <div class="mini-chat" id="miniChat">
      ${preview.messages.map((message) => `
        <div class="bubble ${message.from}">${escapeHtml(message.text)}</div>
      `).join("")}
    </div>
    <div class="mini-options">
      ${outgoing.length ? outgoing.map((connection) => `
        <button class="btn secondary" data-preview-choice="${connection.id}" type="button">
          ${escapeHtml(connection.label)}
        </button>
      `).join("") : `<div class="helper-text">Fim do caminho. Recomece para testar novamente.</div>`}
    </div>
  `;
}

function renderIntegrationsView(bot) {
  const publicUrl = `${location.href.split("#")[0]}#chat/${bot.token}`;
  return `
    <div class="integrations-layout">
      <form class="card panel-pad integrations-form" id="integrationsForm">
        <h2>Canais e contas</h2>
        <p class="helper-text">Tudo aqui e demonstrativo. Os dados ficam apenas no navegador.</p>

        <div class="integration-card">
          <label class="check-row">
            <input type="checkbox" name="websiteEnabled" ${bot.integrations.website.enabled ? "checked" : ""} />
            <span>Site proprio</span>
          </label>
          <label class="field">
            <span>URL do site ou sistema</span>
            <input name="websiteUrl" value="${escapeHtml(bot.integrations.website.url)}" />
          </label>
        </div>

        <div class="integration-card">
          <label class="check-row">
            <input type="checkbox" name="whatsappEnabled" ${bot.integrations.whatsapp.enabled ? "checked" : ""} />
            <span>WhatsApp Business</span>
          </label>
          <label class="field">
            <span>Numero de atendimento</span>
            <input name="whatsappNumber" value="${escapeHtml(bot.integrations.whatsapp.number)}" />
          </label>
        </div>

        <div class="integration-card">
          <label class="check-row">
            <input type="checkbox" name="instagramEnabled" ${bot.integrations.instagram.enabled ? "checked" : ""} />
            <span>Instagram</span>
          </label>
          <label class="field">
            <span>Conta conectada</span>
            <input name="instagramAccount" value="${escapeHtml(bot.integrations.instagram.account)}" />
          </label>
        </div>

        <div class="integration-card">
          <label class="check-row">
            <input type="checkbox" name="apiEnabled" ${bot.integrations.api.enabled ? "checked" : ""} />
            <span>API / sistema interno</span>
          </label>
          <label class="field">
            <span>ID da conta no sistema</span>
            <input name="apiAccountId" value="${escapeHtml(bot.integrations.api.accountId)}" />
          </label>
          <label class="field">
            <span>Webhook de recebimento</span>
            <input name="apiWebhook" value="${escapeHtml(bot.integrations.api.webhook)}" />
          </label>
        </div>

        <button class="btn" type="submit">Salvar integracoes</button>
      </form>

      <aside class="card panel-pad integration-output">
        <h2>Como integrar</h2>
        <p class="helper-text">Exemplos fake para mostrar como o cliente conectaria o bot.</p>

        <div class="code-block">
          <strong>Link publico</strong>
          <code>${escapeHtml(publicUrl)}</code>
        </div>

        <div class="code-block">
          <strong>Widget para site</strong>
          <code>&lt;script src="https://cdn.hellohub.demo/widget.js" data-bot="${escapeHtml(bot.token)}"&gt;&lt;/script&gt;</code>
        </div>

        <div class="code-block">
          <strong>API de mensagem</strong>
          <code>POST https://api.hellohub.demo/chat/${escapeHtml(bot.token)}/mensagem</code>
        </div>

        <div class="integration-summary">
          <h3>Resumo conectado</h3>
          <p><strong>Conta:</strong> ${escapeHtml(bot.integrations.api.accountId)}</p>
          <p><strong>WhatsApp:</strong> ${escapeHtml(bot.integrations.whatsapp.number)}</p>
          <p><strong>Instagram:</strong> ${escapeHtml(bot.integrations.instagram.account)}</p>
          <p><strong>Status:</strong> ${getIntegrationCount(bot)} canal(is) ativo(s)</p>
        </div>
      </aside>
    </div>
  `;
}

function wireCommonBuilderEvents(bot) {
  document.querySelector('[data-action="back-dashboard"]').addEventListener("click", () => {
    ui.connecting = false;
    ui.connectFrom = null;
    navigate("#dashboard");
    render();
  });

  document.querySelector('[data-action="publish"]').addEventListener("click", () => {
    const nodeForm = document.querySelector("#nodeForm");
    if (nodeForm) {
      if (!nodeForm.reportValidity()) {
        return;
      }
      saveSelectedNodeForm(bot, nodeForm);
    }

    bot.status = "published";
    if (!bot.token) {
      bot.token = makeToken(bot.name);
    }
    saveState();
    renderBuilder(bot.id, getActiveBuilderTab());
  });

  const testButton = document.querySelector('[data-action="test-chat"]');
  if (testButton) {
    testButton.addEventListener("click", () => {
      navigate(`#chat/${bot.token}`);
      render();
    });
  }

  document.querySelectorAll("[data-builder-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      ui.connecting = false;
      ui.connectFrom = null;
      navigate(`#builder/${bot.id}/${button.dataset.builderTab}`);
      render();
    });
  });
}

function wireFlowEvents(bot) {
  const nodeForm = document.querySelector("#nodeForm");
  if (nodeForm) {
    nodeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveSelectedNodeForm(bot, event.currentTarget);
      bot.status = "draft";
      setPreviewAtNode(bot, ui.selectedNodeId);
      saveState();
      renderBuilder(bot.id, "flow");
    });
  }

  document.querySelectorAll("[data-add-node]").forEach((button) => {
    button.addEventListener("click", () => addNode(bot, button.dataset.addNode));
  });

  document.querySelector('[data-action="duplicate-node"]').addEventListener("click", () => duplicateSelectedNode(bot));

  document.querySelector('[data-action="delete-node"]').addEventListener("click", () => deleteSelectedNode(bot));

  document.querySelectorAll("[data-remove-connection]").forEach((button) => {
    button.addEventListener("click", () => {
      bot.connections = bot.connections.filter((connection) => connection.id !== button.dataset.removeConnection);
      bot.status = "draft";
      setPreviewAtNode(bot, ui.selectedNodeId);
      saveState();
      renderBuilder(bot.id, "flow");
    });
  });

  document.querySelectorAll('input[name^="conn-"]').forEach((input) => {
    input.addEventListener("change", () => {
      const connectionId = input.name.replace("conn-", "");
      const connection = bot.connections.find((item) => item.id === connectionId);
      if (!connection) {
        return;
      }

      connection.label = input.value.trim() || "Continuar";
      bot.status = "draft";
      setPreviewAtNode(bot, ui.selectedNodeId);
      saveState();
      renderBuilder(bot.id, "flow");
    });
  });

  document.querySelector('[data-action="toggle-connect"]').addEventListener("click", () => {
    ui.connecting = !ui.connecting;
    ui.connectFrom = null;
    renderBuilder(bot.id, "flow");
  });

  document.querySelector('[data-action="auto-layout"]').addEventListener("click", () => {
    autoLayout(bot);
    saveState();
    renderBuilder(bot.id, "flow");
  });

  document.querySelector('[data-action="reset-preview"]').addEventListener("click", () => {
    resetPreview(bot);
    renderBuilder(bot.id, "flow");
  });

  document.querySelector('[data-action="preview-selected"]').addEventListener("click", () => {
    const activeForm = document.querySelector("#nodeForm");
    if (activeForm) {
      saveSelectedNodeForm(bot, activeForm);
      bot.status = "draft";
      saveState();
    }
    setPreviewAtNode(bot, ui.selectedNodeId);
    renderBuilder(bot.id, "flow");
  });

  document.querySelectorAll("[data-preview-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      advancePreview(bot, button.dataset.previewChoice);
      renderBuilder(bot.id, "flow");
    });
  });

  wireDragAndConnect(bot);
}

function wireIntegrationsEvents(bot) {
  document.querySelector("#integrationsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    bot.integrations.website.enabled = form.get("websiteEnabled") === "on";
    bot.integrations.website.url = String(form.get("websiteUrl")).trim();
    bot.integrations.whatsapp.enabled = form.get("whatsappEnabled") === "on";
    bot.integrations.whatsapp.number = String(form.get("whatsappNumber")).trim();
    bot.integrations.instagram.enabled = form.get("instagramEnabled") === "on";
    bot.integrations.instagram.account = String(form.get("instagramAccount")).trim();
    bot.integrations.api.enabled = form.get("apiEnabled") === "on";
    bot.integrations.api.accountId = String(form.get("apiAccountId")).trim();
    bot.integrations.api.webhook = String(form.get("apiWebhook")).trim();
    saveState();
    renderBuilder(bot.id, "integrations");
  });
}

function saveSelectedNodeForm(bot, formElement) {
  const selectedNode = getNodeFromList(bot.nodes, ui.selectedNodeId);
  if (!selectedNode) {
    return;
  }

  const form = new FormData(formElement);
  selectedNode.kind = selectedNode.kind === "start" ? "start" : String(form.get("kind"));
  selectedNode.title = String(form.get("title")).trim();
  selectedNode.body = String(form.get("body")).trim();

  bot.connections.forEach((connection) => {
    const newLabel = form.get(`conn-${connection.id}`);
    if (newLabel !== null) {
      connection.label = String(newLabel).trim() || "Continuar";
    }
  });
}

function getActiveBuilderTab() {
  const active = document.querySelector(".tab-button.active");
  return active ? active.dataset.builderTab : "flow";
}

function addNode(bot, kind) {
  const selectedNode = getNodeFromList(bot.nodes, ui.selectedNodeId) || getStartNode(bot);
  const node = {
    id: makeId("node"),
    kind,
    title: kind === "end" ? "Resposta final" : kind === "question" ? "Nova pergunta" : "Nova mensagem",
    body: kind === "end"
      ? "Obrigado pelo contato! Em breve continuaremos o atendimento."
      : "Escreva aqui o texto que o chatbot deve enviar.",
    x: clamp(selectedNode.x + 320, 20, CANVAS_WIDTH - NODE_WIDTH - 20),
    y: clamp(selectedNode.y + 40, 20, CANVAS_HEIGHT - NODE_HEIGHT - 20)
  };

  bot.nodes.push(node);
  bot.connections.push({
    id: makeId("conn"),
    from: selectedNode.id,
    to: node.id,
    label: node.title
  });
  ui.selectedNodeId = node.id;
  bot.status = "draft";
  setPreviewAtNode(bot, selectedNode.id);
  saveState();
  renderBuilder(bot.id, "flow");
}

function duplicateSelectedNode(bot) {
  const selectedNode = getNodeFromList(bot.nodes, ui.selectedNodeId);
  if (!selectedNode) {
    return;
  }

  const node = {
    ...clone(selectedNode),
    id: makeId("node"),
    kind: selectedNode.kind === "start" ? "message" : selectedNode.kind,
    title: `${selectedNode.title} copia`,
    x: clamp(selectedNode.x + 280, 20, CANVAS_WIDTH - NODE_WIDTH - 20),
    y: clamp(selectedNode.y + 80, 20, CANVAS_HEIGHT - NODE_HEIGHT - 20)
  };

  bot.nodes.push(node);
  ui.selectedNodeId = node.id;
  bot.status = "draft";
  saveState();
  renderBuilder(bot.id, "flow");
}

function deleteSelectedNode(bot) {
  const selectedNode = getNodeFromList(bot.nodes, ui.selectedNodeId);
  if (!selectedNode || selectedNode.kind === "start") {
    return;
  }

  bot.nodes = bot.nodes.filter((node) => node.id !== selectedNode.id);
  bot.connections = bot.connections.filter((connection) => {
    return connection.from !== selectedNode.id && connection.to !== selectedNode.id;
  });
  ui.selectedNodeId = getStartNode(bot).id;
  bot.status = "draft";
  resetPreview(bot);
  saveState();
  renderBuilder(bot.id, "flow");
}

function autoLayout(bot) {
  const start = getStartNode(bot);
  start.x = 50;
  start.y = 250;

  const otherNodes = bot.nodes.filter((node) => node.id !== start.id);
  otherNodes.forEach((node, index) => {
    const column = Math.floor(index / 3) + 1;
    const row = index % 3;
    node.x = 70 + column * 300;
    node.y = 80 + row * 180;
  });
}

function wireDragAndConnect(bot) {
  const canvas = document.querySelector("#flowCanvas");
  const boxes = document.querySelectorAll("[data-node-id]");

  boxes.forEach((box) => {
    box.addEventListener("pointerdown", (event) => {
      const nodeId = box.dataset.nodeId;
      const node = getNodeFromList(bot.nodes, nodeId);

      if (ui.connecting) {
        event.preventDefault();
        handleConnectClick(bot, nodeId);
        return;
      }

      ui.selectedNodeId = nodeId;
      const canvasRect = canvas.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const originX = node.x;
      const originY = node.y;
      let moved = false;

      box.setPointerCapture(event.pointerId);
      box.classList.add("dragging");

      const onMove = (moveEvent) => {
        moved = true;
        const scaleX = CANVAS_WIDTH / canvasRect.width;
        const scaleY = CANVAS_HEIGHT / canvasRect.height;
        const nextX = originX + (moveEvent.clientX - startX) * scaleX;
        const nextY = originY + (moveEvent.clientY - startY) * scaleY;
        node.x = clamp(nextX, 10, CANVAS_WIDTH - NODE_WIDTH - 10);
        node.y = clamp(nextY, 10, CANVAS_HEIGHT - NODE_HEIGHT - 10);
        box.style.left = `${node.x}px`;
        box.style.top = `${node.y}px`;
        redrawConnections(bot);
      };

      const onUp = () => {
        box.classList.remove("dragging");
        box.removeEventListener("pointermove", onMove);
        box.removeEventListener("pointerup", onUp);
        box.removeEventListener("pointercancel", onUp);
        bot.status = moved ? "draft" : bot.status;
        saveState();
        renderBuilder(bot.id, "flow");
      };

      box.addEventListener("pointermove", onMove);
      box.addEventListener("pointerup", onUp);
      box.addEventListener("pointercancel", onUp);
    });
  });
}

function handleConnectClick(bot, nodeId) {
  if (!ui.connectFrom) {
    ui.connectFrom = nodeId;
    ui.selectedNodeId = nodeId;
    renderBuilder(bot.id, "flow");
    return;
  }

  if (ui.connectFrom === nodeId) {
    ui.connectFrom = null;
    renderBuilder(bot.id, "flow");
    return;
  }

  const alreadyExists = bot.connections.some((connection) => {
    return connection.from === ui.connectFrom && connection.to === nodeId;
  });

  if (!alreadyExists) {
    const target = getNodeFromList(bot.nodes, nodeId);
    bot.connections.push({
      id: makeId("conn"),
      from: ui.connectFrom,
      to: nodeId,
      label: target ? target.title : "Continuar"
    });
    bot.status = "draft";
  }

  const sourceId = ui.connectFrom;
  ui.selectedNodeId = sourceId;
  setPreviewAtNode(bot, sourceId);
  ui.connecting = false;
  ui.connectFrom = null;
  saveState();
  renderBuilder(bot.id, "flow");
}

function redrawConnections(bot) {
  const svg = document.querySelector(".connection-layer");
  if (svg) {
    svg.innerHTML = renderConnectionSvgContent(bot);
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function ensurePreview(bot) {
  const start = getStartNode(bot);
  const preview = ui.preview[bot.id];
  if (!preview || !getNodeFromList(bot.nodes, preview.currentNodeId)) {
    resetPreview(bot);
  }

  if (!ui.preview[bot.id].messages.length) {
    ui.preview[bot.id].messages.push({
      from: "bot",
      text: start.body
    });
  }

  return ui.preview[bot.id];
}

function resetPreview(bot) {
  const start = getStartNode(bot);
  setPreviewAtNode(bot, start.id);
}

function setPreviewAtNode(bot, nodeId) {
  const node = getNodeFromList(bot.nodes, nodeId) || getStartNode(bot);
  ui.preview[bot.id] = {
    currentNodeId: node.id,
    messages: [
      {
        from: "bot",
        text: node.body
      }
    ]
  };
}

function advancePreview(bot, connectionId) {
  const preview = ensurePreview(bot);
  const connection = bot.connections.find((item) => item.id === connectionId);
  if (!connection) {
    return;
  }

  const target = getNodeFromList(bot.nodes, connection.to);
  if (!target) {
    return;
  }

  preview.messages.push({ from: "user", text: connection.label });
  preview.messages.push({ from: "bot", text: target.body });
  preview.currentNodeId = target.id;
}

function renderPublishBox(bot) {
  const url = `${location.href.split("#")[0]}#chat/${bot.token}`;
  return `
    <div class="publish-box">
      <strong>Link publicado</strong>
      <code>${escapeHtml(url)}</code>
      <button class="btn secondary" type="button" data-test-bot="${bot.token}">Abrir chat publicado</button>
    </div>
  `;
}

function renderChat(token) {
  const bot = getBotByToken(token);
  if (!bot) {
    document.querySelector("#app").innerHTML = `
      <section class="chat-page">
        <div class="card panel-pad">
          <h1>Bot nao encontrado</h1>
          <p class="helper-text">Publique o bot no painel antes de abrir o link.</p>
          <button class="btn" data-action="go-login">Voltar para o HelloHub</button>
        </div>
      </section>
    `;
    document.querySelector('[data-action="go-login"]').addEventListener("click", () => {
      navigate(state.user ? "#dashboard" : "#login");
      render();
    });
    return;
  }

  const start = getStartNode(bot);

  document.querySelector("#app").innerHTML = `
    <section class="chat-page">
      <div class="card chat-window">
        <header class="chat-header">
          <div>
            <h1>${escapeHtml(bot.name)}</h1>
            <p>Chatbot publicado pelo HelloHub</p>
          </div>
          <button class="chat-close" data-action="back-dashboard" type="button">x</button>
        </header>
        <div class="chat-body" id="chatBody">
          <div class="bubble bot">${escapeHtml(start.body)}</div>
        </div>
        <div class="chat-options" id="chatOptions"></div>
      </div>
    </section>
  `;

  wireChatOptions(bot, start.id);
  wireChatFooter(bot.token);
}

function wireChatOptions(bot, currentNodeId) {
  const options = document.querySelector("#chatOptions");
  const outgoing = getOutgoing(bot, currentNodeId);

  if (!outgoing.length) {
    options.innerHTML = `
      <button class="btn secondary" data-action="restart-chat">Recomecar conversa</button>
      <button class="btn ghost" data-action="back-dashboard">Voltar ao painel</button>
    `;
    wireChatFooter(bot.token);
    return;
  }

  options.innerHTML = `
    ${outgoing.map((connection) => `
      <button class="btn secondary" data-chat-connection="${connection.id}">
        ${escapeHtml(connection.label)}
      </button>
    `).join("")}
    <button class="btn ghost" data-action="back-dashboard">Voltar ao painel</button>
  `;

  document.querySelectorAll("[data-chat-connection]").forEach((button) => {
    button.addEventListener("click", () => {
      const connection = bot.connections.find((item) => item.id === button.dataset.chatConnection);
      const target = getNodeFromList(bot.nodes, connection.to);
      const body = document.querySelector("#chatBody");
      body.insertAdjacentHTML("beforeend", `
        <div class="bubble user">${escapeHtml(connection.label)}</div>
        <div class="bubble bot">${escapeHtml(target.body)}</div>
      `);
      body.scrollTop = body.scrollHeight;
      wireChatOptions(bot, target.id);
    });
  });

  wireChatFooter(bot.token);
}

function wireChatFooter(token) {
  const restart = document.querySelector('[data-action="restart-chat"]');
  if (restart) {
    restart.addEventListener("click", () => renderChat(token));
  }

  const back = document.querySelectorAll('[data-action="back-dashboard"]');
  back.forEach((button) => {
    button.addEventListener("click", () => {
      navigate(state.user ? "#dashboard" : "#login");
      render();
    });
  });
}

function requireLogin() {
  if (!state.user) {
    navigate("#login");
    return false;
  }

  return true;
}

function render() {
  const hash = window.location.hash || "#login";
  const [route, param, subRoute] = hash.replace("#", "").split("/");

  if (route === "chat") {
    renderChat(param);
    return;
  }

  if (!requireLogin() && route !== "login") {
    renderLogin();
    return;
  }

  if (route === "dashboard") {
    renderDashboard();
    return;
  }

  if (route === "builder") {
    renderBuilder(param, subRoute || "flow");
    return;
  }

  renderLogin();
}

window.addEventListener("hashchange", render);
render();
