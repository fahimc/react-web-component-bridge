import "./compiled/large-project-demo-app.js";
import "./compiled/jira-app.js";
import "./compiled/chakra-ui-app.js";
import "./styles.css";

type LabElement = HTMLElement & Record<string, unknown>;
type DemoId = "large-project" | "jira" | "chakra";

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
    id: "large-project",
    title: "react-large-project-demo",
    eyebrow: "Large React app demo",
    description:
      "Compiled from a React-shaped fixture based on packages/app and packages/friends: feature boundaries, friend search, reducer state, notifications, favorites, and load-more behavior.",
    tag: "lab-large-project-app",
    source: "mucsi96/react-large-project-demo"
  },
  {
    id: "jira",
    title: "jira_clone",
    eyebrow: "Jira app demo",
    description:
      "Compiled from a React-shaped fixture based on the client Project/Board app: sidebar, filters, Kanban columns, issue cards, detail panel, and issue-open events.",
    tag: "lab-jira-app",
    source: "oldboyxx/jira_clone"
  },
  {
    id: "chakra",
    title: "chakra-ui",
    eyebrow: "Component library demo",
    description:
      "Compiled from a React-shaped fixture based on apps/www, apps/compositions, and packages/react: theme context, recipes, tabs, cards, stats, and composed button primitives.",
    tag: "lab-chakra-ui-app",
    source: "chakra-ui/chakra-ui"
  }
];

const routeFromHash = (): DemoId | "home" => {
  const route = window.location.hash.replace(/^#\/?/, "");
  if (route === "large-project" || route === "jira" || route === "chakra") {
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
        <h1>Compiled full-app demo pages</h1>
        <span>Each link opens a separate page running a generated Web Component bundle from our compiler. The landing page only links to the compiled demos.</span>
      </header>
      <section class="demo-grid three-up" aria-label="Compiled demo pages">
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
  if (id === "large-project") {
    return `
      <section class="app-frame large-project-page">
        <lab-large-project-app></lab-large-project-app>
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
      <lab-chakra-ui-app></lab-chakra-ui-app>
      <p class="button-log" aria-live="polite">Component event: none</p>
    </section>
  `;
};

const bindDemo = (id: DemoId) => {
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

  if (id === "chakra") {
    const kit = document.querySelector<LabElement>("lab-chakra-ui-app");
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
