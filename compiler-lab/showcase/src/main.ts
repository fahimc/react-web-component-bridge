import "./compiled/realworld-banner.js";
import "./compiled/bulletproof-dashboard.js";
import "./compiled/jira-board.js";
import "./compiled/shadcn-button.js";
import "./styles.css";

type LabElement = HTMLElement & Record<string, unknown>;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app");
}

app.innerHTML = `
  <section class="shell">
    <header class="page-header">
      <p>Compiler Lab</p>
      <h1>Real React project patterns running as no-React Web Components</h1>
      <span>Compiled from cloned GitHub sources and adapter fixtures. The page itself imports only browser custom-element bundles.</span>
    </header>
    <section class="link-band" aria-labelledby="known-apps">
      <div>
        <p>Known React apps to benchmark next</p>
        <h2 id="known-apps">Large React products people already recognize</h2>
      </div>
      <div class="app-links">
        <a href="https://excalidraw.com" target="_blank" rel="noreferrer">
          <strong>Excalidraw</strong>
          <span>whiteboard app</span>
        </a>
        <a href="https://cal.com" target="_blank" rel="noreferrer">
          <strong>Cal.com</strong>
          <span>scheduling app</span>
        </a>
        <a href="https://storybook.js.org" target="_blank" rel="noreferrer">
          <strong>Storybook</strong>
          <span>component workshop</span>
        </a>
        <a href="https://appsmith.com" target="_blank" rel="noreferrer">
          <strong>Appsmith</strong>
          <span>internal tools builder</span>
        </a>
      </div>
    </section>
    <section class="grid">
      <article class="panel" data-source="realworld">
        <div class="panel-top">
          <strong>RealWorld React Redux</strong>
          <code>lab-realworld-banner</code>
        </div>
        <lab-realworld-banner appName="Conduit" token=""></lab-realworld-banner>
      </article>
      <article class="panel" data-source="bulletproof">
        <div class="panel-top">
          <strong>Bulletproof React</strong>
          <code>lab-bulletproof-dashboard</code>
        </div>
        <lab-bulletproof-dashboard></lab-bulletproof-dashboard>
      </article>
      <article class="panel" data-source="shadcn">
        <div class="panel-top">
          <strong>shadcn/ui component-library pattern</strong>
          <code>lab-shadcn-button</code>
        </div>
        <div class="button-stack">
          <lab-shadcn-button variant="default" size="md" label="Primary action"></lab-shadcn-button>
          <lab-shadcn-button variant="outline" size="sm" label="Outline action"></lab-shadcn-button>
          <lab-shadcn-button variant="secondary" size="lg" label="Secondary action"></lab-shadcn-button>
        </div>
        <p class="button-log" aria-live="polite">Button event: none</p>
      </article>
      <article class="panel wide" data-source="jira">
        <div class="panel-top">
          <strong>Jira Clone</strong>
          <code>lab-jira-board</code>
        </div>
        <lab-jira-board></lab-jira-board>
        <p class="event-log" aria-live="polite">Last event: none</p>
      </article>
    </section>
  </section>
`;

const dashboard = document.querySelector<LabElement>("lab-bulletproof-dashboard");
if (dashboard) {
  dashboard.user = { firstName: "Katherine", lastName: "Johnson", role: "ADMIN" };
}

const board = document.querySelector<LabElement>("lab-jira-board");
const log = document.querySelector<HTMLElement>(".event-log");
if (board && log) {
  board.addEventListener("issue-open", (event) => {
    const detail = (event as CustomEvent<{ key?: string; title?: string }>).detail;
    log.textContent = `Last event: ${detail.key} ${detail.title}`;
  });
}

const buttons = document.querySelectorAll<LabElement>("lab-shadcn-button");
const buttonLog = document.querySelector<HTMLElement>(".button-log");
buttons.forEach((button) => {
  button.addEventListener("action", () => {
    if (buttonLog) {
      buttonLog.textContent = `Button event: ${String(button.getAttribute("label") ?? "compiled button")}`;
    }
  });
});
