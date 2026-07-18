import "./compiled/realworld-banner.js";
import "./compiled/bulletproof-dashboard.js";
import "./compiled/jira-board.js";
import "./compiled/shadcn-button.js";
import "./styles.css";

type LabElement = HTMLElement & Record<string, unknown>;
type DemoId = "realworld" | "bulletproof" | "jira" | "shadcn";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app");
}

const demos: Array<{
  id: DemoId;
  title: string;
  eyebrow: string;
  description: string;
  tag: string;
  source: string;
}> = [
  {
    id: "realworld",
    title: "RealWorld React Redux",
    eyebrow: "Article app demo",
    description:
      "A focused app page built around the cloned RealWorld React Redux source, compiling its banner component with unchanged React imports.",
    tag: "lab-realworld-banner",
    source: "gothinkster/react-redux-realworld-example-app"
  },
  {
    id: "bulletproof",
    title: "Bulletproof React",
    eyebrow: "SaaS dashboard demo",
    description:
      "A dashboard-style page using Bulletproof React auth and permission patterns, compiled as a native custom element.",
    tag: "lab-bulletproof-dashboard",
    source: "alan2207/bulletproof-react"
  },
  {
    id: "jira",
    title: "Jira Clone",
    eyebrow: "Kanban workflow demo",
    description:
      "A full board page based on Jira Clone board, filter, and issue-card patterns with CustomEvent output to the host page.",
    tag: "lab-jira-board",
    source: "oldboyxx/jira_clone"
  },
  {
    id: "shadcn",
    title: "shadcn/ui",
    eyebrow: "Component library demo",
    description:
      "A component-library page based on shadcn/ui button variant patterns, compiled into reusable custom-element buttons.",
    tag: "lab-shadcn-button",
    source: "shadcn-ui/ui"
  }
];

const routeFromHash = (): DemoId | "home" => {
  const route = window.location.hash.replace(/^#\/?/, "");
  if (route === "realworld" || route === "bulletproof" || route === "jira" || route === "shadcn") {
    return route;
  }
  return "home";
};

const render = () => {
  const route = routeFromHash();
  if (route === "home") {
    renderHome();
    return;
  }
  renderDemo(route);
};

const renderHome = () => {
  app.innerHTML = `
    <main class="shell">
      <header class="page-header landing-header">
        <p>Compiler Lab</p>
        <h1>No-React Web Component demo pages</h1>
        <span>Open a full demo page for each cloned React app pattern or the cloned component-library test. The landing page stays clean and links into the demos.</span>
      </header>
      <section class="demo-grid" aria-label="Compiled demo pages">
        ${demos
          .map(
            (demo) => `
              <a class="demo-card" href="#/${demo.id}" data-demo="${demo.id}">
                <span>${demo.eyebrow}</span>
                <strong>${demo.title}</strong>
                <p>${demo.description}</p>
                <code>&lt;${demo.tag}&gt;</code>
              </a>
            `
          )
          .join("")}
      </section>
      <section class="link-band" aria-labelledby="known-apps">
        <div>
          <p>Recognizable React targets</p>
          <h2 id="known-apps">External apps to evaluate as larger compiler targets</h2>
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
    </main>
  `;
};

const renderDemo = (id: DemoId) => {
  const demo = demos.find((item) => item.id === id);
  if (!demo) {
    renderHome();
    return;
  }

  app.innerHTML = `
    <main class="shell demo-shell" data-page="${demo.id}">
      <nav class="demo-nav">
        <a href="#/">Back to demos</a>
        <code>${demo.source}</code>
      </nav>
      <header class="page-header demo-header">
        <p>${demo.eyebrow}</p>
        <h1>${demo.title}</h1>
        <span>${demo.description}</span>
      </header>
      ${renderDemoBody(id)}
    </main>
  `;

  bindDemo(id);
};

const renderDemoBody = (id: DemoId) => {
  if (id === "realworld") {
    return `
      <section class="app-frame realworld-page">
        <lab-realworld-banner appName="Conduit" token=""></lab-realworld-banner>
        <div class="content-columns">
          <article>
            <h2>Global feed</h2>
            <p>The compiled banner sits in a fuller RealWorld-style article layout so this page reads as an app demo, not a card sample.</p>
          </article>
          <article>
            <h2>Popular tags</h2>
            <p>react, web-components, compiler, angular, html</p>
          </article>
        </div>
      </section>
    `;
  }

  if (id === "bulletproof") {
    return `
      <section class="app-frame dashboard-page">
        <aside>
          <strong>Acme Console</strong>
          <span>Dashboard</span>
          <span>Teams</span>
          <span>Settings</span>
        </aside>
        <div>
          <lab-bulletproof-dashboard></lab-bulletproof-dashboard>
        </div>
      </section>
    `;
  }

  if (id === "jira") {
    return `
      <section class="app-frame jira-page">
        <lab-jira-board></lab-jira-board>
        <p class="event-log" aria-live="polite">Last event: none</p>
      </section>
    `;
  }

  return `
    <section class="app-frame component-page">
      <div class="component-toolbar">
        <strong>Button variants</strong>
        <span>Compiled component-library custom elements</span>
      </div>
      <div class="button-stack">
        <lab-shadcn-button variant="default" size="md" label="Primary action"></lab-shadcn-button>
        <lab-shadcn-button variant="outline" size="sm" label="Outline action"></lab-shadcn-button>
        <lab-shadcn-button variant="secondary" size="lg" label="Secondary action"></lab-shadcn-button>
        <lab-shadcn-button variant="default" size="md" label="Loading action" loading></lab-shadcn-button>
      </div>
      <p class="button-log" aria-live="polite">Button event: none</p>
    </section>
  `;
};

const bindDemo = (id: DemoId) => {
  if (id === "bulletproof") {
    const dashboard = document.querySelector<LabElement>("lab-bulletproof-dashboard");
    if (dashboard) {
      dashboard.user = { firstName: "Katherine", lastName: "Johnson", role: "ADMIN" };
    }
  }

  if (id === "jira") {
    const board = document.querySelector<LabElement>("lab-jira-board");
    const log = document.querySelector<HTMLElement>(".event-log");
    if (board && log) {
      board.addEventListener("issue-open", (event) => {
        const detail = (event as CustomEvent<{ key?: string; title?: string }>).detail;
        log.textContent = `Last event: ${detail.key} ${detail.title}`;
      });
    }
  }

  if (id === "shadcn") {
    const buttons = document.querySelectorAll<LabElement>("lab-shadcn-button");
    const buttonLog = document.querySelector<HTMLElement>(".button-log");
    buttons.forEach((button) => {
      button.addEventListener("action", () => {
        if (buttonLog) {
          buttonLog.textContent = `Button event: ${String(button.getAttribute("label") ?? "compiled button")}`;
        }
      });
    });
  }
};

window.addEventListener("hashchange", render);
render();
