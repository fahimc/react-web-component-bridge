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
  "TSX elements and fragments",
  "Function components",
  "useState",
  "useReducer",
  "useMemo",
  "useRef",
  "useEffect and useLayoutEffect",
  "useCallback and memo",
  "createContext and useContext",
  "forwardRef and useImperativeHandle",
  "createPortal",
  "lazy and Suspense fallbacks",
  "useTransition and useDeferredValue",
  "useSyncExternalStore",
  "Children, cloneElement, isValidElement",
  "props and primitive attributes",
  "property-only arrays and objects",
  "slots",
  "CustomEvent callback props",
  "public custom-element methods",
  "static styles"
];

const compatibilityItems = [
  "Effects run from the custom-element lifecycle",
  "Transitions are synchronous browser-runtime shims",
  "Lazy components resolve promises and rerender the owning element",
  "The first renderer uses replace-rendering rather than React reconciliation",
  "CustomEvents carry stable detail data instead of React SyntheticEvents",
  "CSS-in-JS runtime extraction",
  "React hydration is not used because output is browser Custom Elements"
];

const workflowSteps = [
  "Author React-shaped TSX with normal React imports.",
  "Supply a tag contract inline or through external registration metadata.",
  "Run the no-React compiler against one file or a component folder.",
  "The compiler strips React imports, lowers TSX, and injects the small DOM runtime.",
  "The emitted module defines CustomElement classes with props, attributes, slots, events, methods, and styles.",
  "Angular or HTML imports the compiled module and uses platform tags.",
  "The production bundle contains no react, react-dom, JSX runtime import, or createRoot call."
];

const architectureLayers = [
  { label: "React-shaped TSX", detail: "Component code can keep normal imports from react." },
  { label: "Compiler", detail: "React imports are removed and TSX is lowered to h(...) calls." },
  {
    label: "Tag contract",
    detail: "Props, attributes, events, slots, methods, styles, forms, portals."
  },
  {
    label: "Vanilla runtime",
    detail: "Hook cells, DOM rendering, CustomEvents, and slot projection."
  },
  {
    label: "CustomElement class",
    detail: "Browser lifecycle owns connect, attributes, and properties."
  },
  {
    label: "No React bundle",
    detail: "No react, react-dom, JSX runtime, or createRoot in output."
  },
  { label: "Platform tag", detail: "Angular, HTML, Vue, or CMS pages consume the browser element." }
];

const controllerLayers = [
  "Import stripper: removes react, react-dom, and optional facade imports",
  "TSX lowering: converts JSX into h(...) calls",
  "Hook cells: useState, useMemo, and useRef without React",
  "Property mapper: attributes and DOM properties into compiled props",
  "Event mapper: callback props into CustomEvent dispatchers",
  "Slot mapper: default and named slots into vnode props",
  "Method mapper: custom-element prototype methods",
  "DOM renderer: creates browser nodes from compiled vnodes"
];

const apiTranslations = [
  {
    api: "React default import and TSX",
    translation: "Import is stripped and TSX lowers to h(...) calls.",
    boundary: "No React object or JSX runtime import in the production module."
  },
  {
    api: "Hooks: useState, useMemo, useRef",
    translation:
      "Compiled to per-element hook cells. useReducer, effects, IDs, and refs use the same hook table.",
    boundary: "State lives on the custom element instance, not in React."
  },
  {
    api: "Context, forwardRef, imperative handles",
    translation: "Compiled to provider stacks and public handle objects.",
    boundary: "Custom-element methods can call the compiled handle without React refs."
  },
  {
    api: "Component props",
    translation: "Generated accessors map host properties and attributes to compiled props.",
    boundary:
      "Primitives can reflect to attributes; objects, arrays, functions, and nodes stay property-only."
  },
  {
    api: "Callback props",
    translation: "Compiler injects callback props from event metadata.",
    boundary: "Calling the callback dispatches a browser CustomEvent with configured detail."
  },
  {
    api: "children and named content",
    translation: "Slot metadata creates default and named slot vnodes.",
    boundary: "The consumer owns slotted DOM; the compiled runtime projects it."
  },
  {
    api: "Refs and imperative methods",
    translation: "JSX refs point at DOM nodes; public methods come from tag metadata.",
    boundary: "Consumers call methods on the custom element instance."
  },
  {
    api: "Portals, Suspense, lazy, transitions",
    translation:
      "Compiled to DOM portal containers, fallback boundaries, async rerenders, and sync transition shims.",
    boundary: "No ReactDOM portal, scheduler, or lazy runtime is bundled."
  }
];

function buildReactSource(heading: string, accent: string, metric: number, compact: boolean) {
  return `import React, { useMemo } from "react";

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
  return `{
  "tagName": "${tagName}",
  "component": "MetricCard",
  "options": {
    "shadow": { "mode": "open" },
    "props": {
      "heading": { "type": "string", "reflect": true },
      "accent": { "type": "string", "reflect": true },
      "metric": { "type": "number", "reflect": true },
      "compact": { "type": "boolean", "reflect": true }
    },
    "events": {
      "onAction": { "name": "preview-action" }
    }
  }
}

react-web-component-bridge compile \\
  --input metric-card.tsx \\
  --out-file metric-card.web-components.js \\
  --definition metric-card.rwcb.json`;
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
  return `import "./generated/metric-card.web-components.js";

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
  const [activeOutput, setActiveOutput] = useState("compile");
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
          <a
            href="https://github.com/fahimc/react-web-component-bridge"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">React-shaped TSX to no-React browser tags</p>
          <h1>Keep React authoring. Ship Web Components without React.</h1>
          <p className="lede">
            Keep normal React imports, provide a Web Component tag contract, and compile the result
            into browser-native JavaScript that Angular, plain HTML, Vue, or any standards-based
            host can consume without React in the production bundle.
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
              <dt>Authoring</dt>
              <dd>React-shaped TSX subset</dd>
            </div>
            <div>
              <dt>Output</dt>
              <dd>No-React Custom Elements</dd>
            </div>
            <div>
              <dt>Consumers</dt>
              <dd>Angular, HTML, Vue, CMS pages</dd>
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
          <h2>React-shaped source, compiler contract, and rendered custom element.</h2>
          <p>
            The editor shows the authoring model the compiler is built around. Component code stays
            React-shaped; the tag contract controls how props, attributes, and events become browser
            behavior.
          </p>
        </div>

        <div className="editor-shell">
          <section className="editor-pane" aria-label="React component editor">
            <div className="pane-header">
              <span>React-shaped component</span>
              <span>react</span>
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
              <span>Live Custom Element preview</span>
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
              {["compile", "html", "angular"].map((tab) => (
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
              A compiler and tiny DOM runtime that turns existing React-shaped TSX component
              definitions into browser Custom Elements. Angular users import the compiled output
              without installing React.
            </p>
          </article>
          <article>
            <h3>Authoring API</h3>
            <pre>
              <code>{`import React, { useState } from "react";

export function CustomerCard({ customer, onSelect }) {
  const [selected, setSelected] = useState(false);
  return <button onClick={() => onSelect?.(customer)}>{customer.name}</button>;
}`}</code>
            </pre>
          </article>
          <article>
            <h3>Angular consumption</h3>
            <p>
              Import the compiled bundle once, add <code>CUSTOM_ELEMENTS_SCHEMA</code>, and render
              the tag. Assign arrays and objects as DOM properties. Listen for native{" "}
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
          <article>
            <h3>No-React compile</h3>
            <p>
              Compile one component file or a folder of TSX files. Existing imports from{" "}
              <code>react</code> can stay unchanged. The emitted browser module has no{" "}
              <code>react</code>, <code>react-dom</code>, JSX runtime import, or{" "}
              <code>createRoot</code>.
            </p>
            <pre>
              <code>{`react-web-component-bridge compile --input src/card.tsx --tag acme-card --component Card
react-web-component-bridge compile --input src/card.tsx --definition card.rwcb.json
react-web-component-bridge compile-folder --dir src/components --out-dir dist/components`}</code>
            </pre>
          </article>
          <article>
            <h3>Import replacement</h3>
            <p>
              Import replacement is optional. Run it only when component authors want bridge-only
              helpers inline in source. Use <code>--dry-run</code> first to review changed files.
            </p>
            <pre>
              <code>{`react-web-component-bridge replace-react-imports --dir src/components --dry-run
react-web-component-bridge replace-react-imports --dir src/components`}</code>
            </pre>
          </article>
        </div>
      </section>

      <section className="band support-band" id="support">
        <div className="section-heading">
          <p className="eyebrow">Supported compiler subset</p>
          <h2>React-shaped authoring without React in production.</h2>
          <p>
            The compiler supports the previously unsupported React authoring APIs through a
            standalone browser runtime. Compatibility differences are documented here and must not
            become hidden React bundle dependencies.
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
            <h3>Compatibility notes</h3>
            <ul className="plain-list">
              {compatibilityItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="band architecture-band" id="architecture">
        <div className="section-heading">
          <p className="eyebrow">Architecture and translation workflow</p>
          <h2>Compile-time adaptation, not a hidden React root.</h2>
          <p>
            The workflow translates a React-shaped component contract into platform behavior. The
            emitted bundle is vanilla JavaScript that defines Custom Elements.
          </p>
        </div>
        <div className="architecture-layout">
          <ol className="workflow-list">
            {workflowSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="architecture-map" aria-label="Bridge architecture map">
            <div>TSX source</div>
            <span>props</span>
            <div>No-React compiler</div>
            <span>lower</span>
            <div>DOM runtime</div>
            <span>events</span>
            <div>Angular or HTML tag</div>
          </div>
        </div>

        <div className="architecture-diagrams" aria-label="Detailed architecture diagrams">
          <section className="diagram-panel">
            <h3>Runtime pipeline</h3>
            <div className="pipeline-diagram">
              {architectureLayers.map((layer, index) => (
                <React.Fragment key={layer.label}>
                  <div>
                    <strong>{layer.label}</strong>
                    <span>{layer.detail}</span>
                  </div>
                  {index < architectureLayers.length - 1 ? <b>down</b> : null}
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className="diagram-panel">
            <h3>Controller stack</h3>
            <ul className="controller-stack">
              {controllerLayers.map((layer) => (
                <li key={layer}>{layer}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="translation-matrix" aria-label="React API translation matrix">
          <div>
            <p className="eyebrow">React API translation</p>
            <h3>What is passed through, what is adapted, and what crosses the browser boundary.</h3>
          </div>
          <div className="translation-table">
            {apiTranslations.map((row) => (
              <article key={row.api}>
                <h4>{row.api}</h4>
                <p>
                  <strong>Bridge behavior:</strong> {row.translation}
                </p>
                <p>
                  <strong>Boundary result:</strong> {row.boundary}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="band install-band">
        <div className="section-heading">
          <p className="eyebrow">Install</p>
          <h2>Compile React-shaped TSX into browser Custom Elements.</h2>
        </div>
        <pre className="install-command">
          <code>pnpm add -D @codedia/react-web-component-bridge-generator</code>
        </pre>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
