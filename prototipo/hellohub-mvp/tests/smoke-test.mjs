import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(testDir);

const files = {
  html: join(rootDir, "index.html"),
  css: join(rootDir, "styles.css"),
  app: join(rootDir, "app.js"),
  readme: join(rootDir, "README.md"),
  sprint5: join(rootDir, "SPRINT5_ENTREGA.md")
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function includes(source, expected, label) {
  assert(
    source.includes(expected),
    `Esperado encontrar "${expected}" em ${label}.`
  );
}

Object.entries(files).forEach(([label, path]) => {
  assert(existsSync(path), `Arquivo obrigatorio ausente: ${label} (${path})`);
});

const html = readFileSync(files.html, "utf8");
const css = readFileSync(files.css, "utf8");
const app = readFileSync(files.app, "utf8");
const readme = readFileSync(files.readme, "utf8");
const sprint5 = readFileSync(files.sprint5, "utf8");

new Function(app);

includes(html, "styles.css", "index.html");
includes(html, "app.js", "index.html");

includes(app, "const defaultState", "app.js");
includes(app, "nodes:", "app.js");
includes(app, "connections:", "app.js");
includes(app, "integrations:", "app.js");
includes(app, "localStorage", "app.js");
includes(app, "function validateFlow", "app.js");
includes(app, "function renderDashboard", "app.js");
includes(app, "function renderFlowView", "app.js");
includes(app, "function renderSimulator", "app.js");
includes(app, "function renderIntegrationsView", "app.js");
includes(app, "function renderChat", "app.js");

includes(css, ".flow-box", "styles.css");
includes(css, ".connection-layer", "styles.css");
includes(css, ".validation-panel", "styles.css");
includes(css, ".integration-card", "styles.css");

includes(readme, "Roteiro rapido de demonstracao", "README.md");
includes(readme, "Conexao entre caixas", "README.md");

includes(sprint5, "Fluxo completo de entrada, processamento e saida", "SPRINT5_ENTREGA.md");
includes(sprint5, "Relacao com a modelagem de classes", "SPRINT5_ENTREGA.md");
includes(sprint5, "Testes basicos", "SPRINT5_ENTREGA.md");

console.log("OK - Smoke test do HelloHub MVP passou.");
