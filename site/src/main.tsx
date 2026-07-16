import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import heroImage from "./assets/react-web-component-bridge-hero.png";
import type { PreviewAction } from "./preview-element";
import "./preview-element";
import "./styles.css";

type CustomPreviewElement = HTMLElement & {
  heading: string;
  accent: string;
  metric: number;
  compact: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "rwcb-site-preview": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        heading?: string;
        accent?: string;
        metric?: number;
        compact?: boolean;
      };
    }
  }
}

const supportedApis = [
  "default React export",
  "createElement",
  "Fragment",
  "StrictMode",
  "Suspense",
  "memo",
  "forwardRef",
  "lazy",
  "createContext",
  "createRef",
  "Children",
  "cloneElement",
  "isValidElement",
  "startTransition",
  "useState",
  "useReducer",
  "useEffect",
  "useLayoutEffect",
  "useMemo",
  "useCallback",
  "useRef",
  "useContext",
  "useId",
  "useImperativeHandle",
  "useInsertionEffect",
  "useDeferredValue",
  "useSyncExternalStore",
  "useTransition",
  "useDebugValue"
];

const unsupportedItems = [
  "Source-to-source conversion from React into Angular components",
  "Server-side registration of custom elements without a browser customElements registry",
  "Passing React SyntheticEvent objects across the Web Component boundary",
  "Serializing functions, class instances, React nodes, or large object graphs into HTML attributes",
  "Automatically rewriting CSS modules, runtime CSS-in-JS caches, or app-level routing assumptions",
  "Sharing one React root across every element instance",
  "Hydrating a server-rendered custom element tree as if it were a native React root"
];

const workflowSteps = [
  "Author ordinary React component code through the facade import.",
  "Attach a tag contract with defineComponentTag or export a deferred createComponentTag definition.",
  "Bundle the component package once for the browser.",
  "The bridge creates a CustomElement class and installs lifecycle, props, style, slot, method, form, and event controllers.",
  "When Angular or HTML adds the tag, the element receives attributes and properties like any browser element.",
  "The bridge batches updates, renders the React component into the configured shadow or light DOM root, and converts callback props into CustomEvent dispatches.",
  "Consumer frameworks handle the result as a platform custom element, not as a React subtree."
];

function buildReactSource(heading: string, accent: string, metric: number, compact: boolean) {
  return `import React, { defineComponentTag, useMemo } from "@fahimc/react-web-component-bridge/react";

type MetricCardProps = {
  heading?: string;
  accent?: "emerald" | "amber" | "blue" | "graphite";
  metric?: number;
  compact?: boolean;
  onAction?: (payload: { label: string; metric: number }) => void;
};

export function MetricCard({
  heading = "${heading}",
  accent = "${accent}",
  metric = ${metric},
  compact = ${compact},
  onAction
}: MetricCardProps) {
  const label = useMemo(() => heading.toUpperCase(), [heading]);

  return (
    <article data-accent={accent} data-compact={compact}>
      <strong>{label}</strong>
      <p>{metric} updates bridged through a CustomEvent-ready tag.</p>
      <button onClick={() => onAction?.({ label: heading, metric })}>
        Dispatch CustomEvent
      </button>
    </article>
  );
}`;
}

function buildBridgeSource(tagName: string) {
  return `defineComponentTag("${tagName}", MetricCard, {
  shadow: { mode: "open" },
  props: {
    heading: { type: "string", reflect: true },
    accent: { type: "string", reflect: true },
    metric: { type: "number", reflect: true },
    compact: { type: "boolean", reflect: true }
  },
  events: {
    onAction: {
      name: "preview-action",
      detail: (payload) => payload
    }
  }
});`;
}

function buildHtmlUsage(
  tagName: string,
  heading: string,
  accent: string,
  metric: number,
  compact: boolean
) {
  const compactAttribute = compact ? "\n  compact" : "";
  return `<script type="module" src="/metric-card.web-components.js"></script>

<${tagName}
  heading="${heading}"
  accent="${accent}"
  metric="${metric}"${compactAttribute}
></${tagName}>

<script type="module">
  const card = document.querySelector("${tagName}");
  card.addEventListener("preview-action", (event) => {
    console.log(event.detail);
  });
</script>`;
}

function buildAngularUsage(tagName: string) {
  return `import "@acme/metric-card/web-components";

@Component({
  selector: "app-root",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`
    <${tagName}
      heading="Release health"
      accent="emerald"
      [metric]="98"
      (preview-action)="track($event)"
    ></${tagName}>
  \`
})
export class AppComponent {
  track(event: Event) {
    console.log((event as CustomEvent).detail);
  }
}`;
}

function App() {
  const [tagName, setTagName] = useState("acme-metric-card");
  const [heading, setHeading] = useState("Release health");
  const [accent, setAccent] = useState("emerald");
  const [metric, setMetric] = useState(98);
  const [compact, setCompact] = useState(false);
  const [source, setSource] = useState(() =>
    buildReactSource("Release health", "emerald", 98, false)
  );
  const [activeOutput, setActiveOutput] = useState("bridge");
  const [lastEvent, setLastEvent] = useState("No CustomEvent captured yet.");
  const previewRef = useRef<CustomPreviewElement>(null);

  useEffect(() => {
    setSource(buildReactSource(heading, accent, metric, compact));
  }, [accent, compact, heading, metric]);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) {
      return;
    }

    const listener = (event: Event) => {
      const detail = (event as CustomEvent<PreviewAction>).detail;
      setLastEvent(`${detail.label}: ${detail.metric}`);
    };

    element.addEventListener("preview-action", listener);
    return () => element.removeEventListener("preview-action", listener);
  }, []);

  useEffect(() => {
    if (!previewRef.current) {
      return;
    }

    previewRef.current.heading = heading;
    previewRef.current.accent = accent;
    previewRef.current.metric = metric;
    previewRef.current.compact = compact;
  }, [accent, compact, heading, metric]);

  const output = useMemo(() => {
    if (activeOutput === "html") {
      return buildHtmlUsage(tagName, heading, accent, metric, compact);
    }
    if (activeOutput === "angular") {
      return buildAngularUsage(tagName);
    }
    return buildBridgeSource(tagName);
  }, [accent, activeOutput, compact, heading, metric, tagName]);

  return (
    <main>
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#top">
          React Web Component Bridge
        </a>
        <div className="navlinks">
          <a href="#editor">Editor</a>
          <a href="#docs">Docs</a>
          <a href="#support">Support</a>
          <a href="#architecture">Architecture</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">React API facade for browser-native tags</p>
          <h1>Keep React components intact. Ship them as Web Components.</h1>
          <p className="lede">
            Import React authoring APIs from the bridge facade, define a custom-element tag, and let
            Angular, plain HTML, Vue, or any standards-based host consume the result without
            rewriting the original React component.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#editor">
              Open editor
            </a>
            <a className="button secondary" href="#docs">
              Read docs
            </a>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>React</dt>
              <dd>18.3+ and 19.x peer support</dd>
            </div>
            <div>
              <dt>Output</dt>
              <dd>Custom Elements with optional Shadow DOM</dd>
            </div>
            <div>
              <dt>Consumers</dt>
              <dd>Angular, HTML, Vue, React, CMS pages</dd>
            </div>
          </dl>
        </div>
        <div className="hero-media">
          <img src={heroImage} alt="React component code adapting into Web Component panels" />
        </div>
      </section>

      <section className="band editor-band" id="editor">
        <div className="section-heading">
          <p className="eyebrow">Live conversion preview</p>
          <h2>React source, bridge contract, and rendered custom element in one workspace.</h2>
          <p>
            The editor shows the authoring model the package is built around. React code stays
            React-shaped; the tag contract controls how props, attributes, and events cross the
            browser boundary.
          </p>
        </div>

        <div className="editor-shell">
          <section className="editor-pane" aria-label="React component editor">
            <div className="pane-header">
              <span>React component</span>
              <span>@fahimc/react-web-component-bridge/react</span>
            </div>
            <textarea
              aria-label="React source editor"
              spellCheck={false}
              value={source}
              onChange={(event) => setSource(event.currentTarget.value)}
            />
          </section>

          <section className="controls-pane" aria-label="Preview controls">
            <label>
              Tag name
              <input value={tagName} onChange={(event) => setTagName(event.currentTarget.value)} />
            </label>
            <label>
              Heading
              <input value={heading} onChange={(event) => setHeading(event.currentTarget.value)} />
            </label>
            <label>
              Accent
              <select value={accent} onChange={(event) => setAccent(event.currentTarget.value)}>
                <option value="emerald">emerald</option>
                <option value="amber">amber</option>
                <option value="blue">blue</option>
                <option value="graphite">graphite</option>
              </select>
            </label>
            <label>
              Metric
              <input
                type="number"
                min="0"
                max="999"
                value={metric}
                onChange={(event) => setMetric(Number(event.currentTarget.value))}
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={compact}
                onChange={(event) => setCompact(event.currentTarget.checked)}
              />
              Compact element
            </label>
          </section>

          <section className="preview-pane" aria-label="Custom element preview">
            <div className="pane-header">
              <span>&lt;rwcb-site-preview&gt;</span>
              <span>Live Custom Element</span>
            </div>
            <rwcb-site-preview
              ref={previewRef}
              heading={heading}
              accent={accent}
              metric={metric}
              compact={compact}
            />
            <p className="event-readout">Last event: {lastEvent}</p>
          </section>

          <section className="output-pane" aria-label="Generated usage output">
            <div className="tabs" role="tablist" aria-label="Generated output">
              {["bridge", "html", "angular"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={activeOutput === tab ? "active" : ""}
                  onClick={() => setActiveOutput(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <pre>
              <code>{output}</code>
            </pre>
          </section>
        </div>
      </section>

      <section className="band docs-band" id="docs">
        <div className="section-heading">
          <p className="eyebrow">Documentation</p>
          <h2>The module in practical terms.</h2>
        </div>
        <div className="doc-grid">
          <article>
            <h3>What it is</h3>
            <p>
              A small TypeScript runtime and React facade that turns React component definitions
              into browser Custom Elements. It does not ask teams to rewrite UI in Angular or
              duplicate component libraries.
            </p>
          </article>
          <article>
            <h3>Authoring API</h3>
            <pre>
              <code>{`import React, { defineComponentTag } from "@fahimc/react-web-component-bridge/react";

defineComponentTag("acme-customer-card", CustomerCard, {
  props: { customer: { attribute: false } },
  events: { onSelect: { name: "customer-select" } }
});`}</code>
            </pre>
          </article>
          <article>
            <h3>Angular consumption</h3>
            <p>
              Import the generated bundle once, add <code>CUSTOM_ELEMENTS_SCHEMA</code>, and render
              the tag. Assign arrays, objects, and functions as DOM properties. Listen for native{" "}
              <code>CustomEvent</code> objects through Angular handlers.
            </p>
          </article>
          <article>
            <h3>HTML consumption</h3>
            <p>
              Load the web-component bundle with a module script, place the tag in markup, then set
              property-only values from JavaScript. Attribute reflection handles primitive values
              where configured.
            </p>
          </article>
        </div>
      </section>

      <section className="band support-band" id="support">
        <div className="section-heading">
          <p className="eyebrow">Supported React API and versions</p>
          <h2>Facade coverage for current component authoring.</h2>
          <p>
            The package declares React and ReactDOM as peer dependencies and supports React 18.3 or
            newer and React 19.x. The facade re-exports common React authoring APIs so component
            files can keep a familiar import surface.
          </p>
        </div>
        <div className="support-layout">
          <div>
            <h3>Facade exports</h3>
            <ul className="pill-list">
              {supportedApis.map((api) => (
                <li key={api}>{api}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Not supported</h3>
            <ul className="plain-list">
              {unsupportedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="band architecture-band" id="architecture">
        <div className="section-heading">
          <p className="eyebrow">Architecture and translation workflow</p>
          <h2>Runtime adaptation, not framework transpilation.</h2>
          <p>
            The workflow translates a component contract into platform behavior. React still renders
            the component. The bridge owns the custom-element shell around it.
          </p>
        </div>
        <div className="architecture-layout">
          <ol className="workflow-list">
            {workflowSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="architecture-map" aria-label="Bridge architecture map">
            <div>React facade</div>
            <span>props</span>
            <div>CustomElement class</div>
            <span>render</span>
            <div>React root</div>
            <span>events</span>
            <div>Angular or HTML tag</div>
          </div>
        </div>
      </section>

      <section className="band install-band">
        <div className="section-heading">
          <p className="eyebrow">Install</p>
          <h2>Use the bridge package with your existing React runtime.</h2>
        </div>
        <pre className="install-command">
          <code>pnpm add @fahimc/react-web-component-bridge react react-dom</code>
        </pre>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
