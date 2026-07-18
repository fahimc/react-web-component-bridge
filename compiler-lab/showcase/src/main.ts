import "./compiled/realworld-app.js";
import "./compiled/bulletproof-app.js";
import "./compiled/jira-app.js";
import "./compiled/shadcn-kit.js";
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
      "A full article/feed app built from RealWorld React Redux patterns, compiled from React-shaped source into one custom element.",
    tag: "lab-realworld-app",
    source: "gothinkster/react-redux-realworld-example-app"
  },
  {
    id: "bulletproof",
    title: "Bulletproof React",
    eyebrow: "SaaS dashboard demo",
    description:
      "A dashboard-style page using Bulletproof React auth and permission patterns, compiled as a native custom element.",
    tag: "lab-bulletproof-app",
    source: "alan2207/bulletproof-react"
  },
  {
    id: "jira",
    title: "Jira Clone",
    eyebrow: "Kanban workflow demo",
    description:
      "A full board page based on Jira Clone board, filter, and issue-card patterns with CustomEvent output to the host page.",
    tag: "lab-jira-app",
    source: "oldboyxx/jira_clone"
  },
  {
    id: "shadcn",
    title: "shadcn/ui",
    eyebrow: "Component library demo",
    description:
      "A component-library workbench based on shadcn/ui variant patterns, compiled into one reusable design-system custom element.",
    tag: "lab-shadcn-kit",
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
        <lab-realworld-app></lab-realworld-app>
      </section>
    `;
  }

  if (id === "bulletproof") {
    return `
      <section class="app-frame dashboard-page">
        <lab-bulletproof-app></lab-bulletproof-app>
      </section>
    `;
  }

  if (id === "jira") {
    return `
      <section class="app-frame jira-page">
        <lab-jira-app></lab-jira-app>
        <p class="event-log" aria-live="polite">Last event: none</p>
      </section>
    `;
  }

  return `
    <section class="app-frame component-page">
      <lab-shadcn-kit></lab-shadcn-kit>
      <p class="button-log" aria-live="polite">Button event: none</p>
    </section>
  `;
};

const bindDemo = (id: DemoId) => {
  if (id === "bulletproof") {
    const dashboard = document.querySelector<LabElement>("lab-bulletproof-app");
    if (dashboard) {
      dashboard.user = { firstName: "Katherine", lastName: "Johnson", role: "ADMIN" };
    }
  }

  if (id === "jira") {
    const board = document.querySelector<LabElement>("lab-jira-app");
    const log = document.querySelector<HTMLElement>(".event-log");
    if (board && log) {
      board.addEventListener("issue-open", (event) => {
        const detail = (event as CustomEvent<{ key?: string; title?: string }>).detail;
        log.textContent = `Last event: ${detail.key} ${detail.title}`;
      });
    }
  }

  if (id === "shadcn") {
    const kit = document.querySelector<LabElement>("lab-shadcn-kit");
    const buttonLog = document.querySelector<HTMLElement>(".button-log");
    kit?.addEventListener("action", (event) => {
      const detail = (event as CustomEvent<{ name?: string }>).detail;
      if (buttonLog) {
        buttonLog.textContent = `Component event: ${detail.name ?? "unknown action"}`;
      }
    });
  }
};

window.addEventListener("hashchange", render);
render();
