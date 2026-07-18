import "./compiled/realworld-banner.js";
import "./compiled/bulletproof-dashboard.js";
import "./compiled/jira-board.js";
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
