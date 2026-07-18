import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ColorMode = "Light" | "Dark";
type Variant = "solid" | "subtle" | "outline";
type ComponentName = "Accordion" | "Dialog" | "Menu" | "Toast";

const registry: Array<{
  name: ComponentName;
  status: string;
  exports: string;
  notes: string;
}> = [
  {
    name: "Accordion",
    status: "Ready",
    exports: "Root, Item, Trigger, Content",
    notes: "Composes disclosure state, keyboard navigation, and animated content regions."
  },
  {
    name: "Dialog",
    status: "Interactive",
    exports: "Root, Trigger, Content, Close",
    notes: "Shows modal state, focus-safe controls, backdrop content, and close actions."
  },
  {
    name: "Menu",
    status: "Ready",
    exports: "Root, Trigger, Positioner, Item",
    notes: "Covers roving item selection, grouped commands, and layered popover markup."
  },
  {
    name: "Toast",
    status: "Ready",
    exports: "Provider, Viewport, Title, Description",
    notes: "Demonstrates provider-driven notifications and composition recipes."
  }
];

const ThemeContext = createContext<{ mode: ColorMode; accent: string }>({
  accent: "teal",
  mode: "Light"
});

function cx(...items: Array<string | false | undefined>) {
  return items.filter(Boolean).join(" ");
}

function Button(props: {
  children: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  variant?: Variant;
}) {
  const theme = useContext(ThemeContext);
  const className = useMemo(
    () =>
      cx(
        "chakra-button",
        `chakra-${props.variant ?? "solid"}`,
        `chakra-${props.size ?? "md"}`,
        `accent-${theme.accent}`
      ),
    [props.size, props.variant, theme.accent]
  );
  return (
    <button className={className} onClick={props.onClick} type="button">
      {props.children}
    </button>
  );
}

function Card(props: { children: ReactNode; title: string }) {
  return (
    <article className="chakra-card">
      <h3>{props.title}</h3>
      <div>{props.children}</div>
    </article>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <article className="chakra-stat">
      <strong>{props.value}</strong>
      <span>{props.label}</span>
    </article>
  );
}

export function ChakraUiApp(props: { onAction?: (action: { name: string }) => void }) {
  const [mode, setMode] = useState<ColorMode>("Light");
  const [activeTab, setActiveTab] = useState("Compositions");
  const [accent, setAccent] = useState("teal");
  const [selectedName, setSelectedName] = useState<ComponentName>("Dialog");
  const [dialogOpen, setDialogOpen] = useState(false);
  const context = useMemo(() => ({ accent, mode }), [accent, mode]);
  const selected = useMemo(
    () => registry.find((item) => item.name === selectedName) ?? registry[0],
    [selectedName]
  );
  const inspect = (name: ComponentName) => {
    setSelectedName(name);
    setDialogOpen(name === "Dialog");
    props.onAction?.({ name: `Inspect ${name}` });
  };

  return (
    <ThemeContext.Provider value={context}>
      <section className={mode === "Dark" ? "chakra-app dark" : "chakra-app"}>
        <header className="chakra-hero">
          <div>
            <p className="origin">chakra-ui / apps/www + packages/react</p>
            <h2>Chakra UI system console compiled as a Web Component</h2>
            <span>
              Theme context, composed primitives, responsive cards, token controls, and component
              previews run inside one generated custom element.
            </span>
          </div>
          <Button onClick={() => props.onAction?.({ name: "Publish Chakra theme" })}>
            Publish theme
          </Button>
        </header>
        <nav className="chakra-tabs">
          {["Compositions", "Tokens", "Recipes", "Examples"].map((tab) => (
            <button className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>
        <main className="chakra-grid">
          <Card title="Theme controls">
            <label>
              Color mode
              <select
                value={mode}
                onChange={(event) => setMode(event.currentTarget.value as ColorMode)}
              >
                <option>Light</option>
                <option>Dark</option>
              </select>
            </label>
            <label>
              Accent token
              <select value={accent} onChange={(event) => setAccent(event.currentTarget.value)}>
                <option>teal</option>
                <option>blue</option>
                <option>purple</option>
              </select>
            </label>
          </Card>
          <Card title="Button recipe">
            <div className="chakra-actions">
              <Button onClick={() => props.onAction?.({ name: "Solid button recipe" })}>
                Solid
              </Button>
              <Button
                variant="subtle"
                onClick={() => props.onAction?.({ name: "Subtle button recipe" })}
              >
                Subtle
              </Button>
              <Button
                variant="outline"
                onClick={() => props.onAction?.({ name: "Outline button recipe" })}
              >
                Outline
              </Button>
            </div>
          </Card>
          <Card title="Composition registry">
            <div className="chakra-table">
              {registry.map((item) => (
                <div className={selectedName === item.name ? "selected" : ""}>
                  <strong>{item.name}</strong>
                  <span>{activeTab}</span>
                  <Button size="sm" variant="outline" onClick={() => inspect(item.name)}>
                    Inspect
                  </Button>
                </div>
              ))}
            </div>
          </Card>
          <Card title={`${selected.name} inspector`}>
            <div className="chakra-inspector">
              <dl>
                <div>
                  <dt>Status</dt>
                  <dd>{selected.status}</dd>
                </div>
                <div>
                  <dt>Exports</dt>
                  <dd>{selected.exports}</dd>
                </div>
              </dl>
              <p>{selected.notes}</p>
              {selected.name === "Dialog" ? (
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                  Open dialog preview
                </Button>
              ) : (
                <Button variant="subtle" onClick={() => props.onAction?.({ name: selected.name })}>
                  Run preview
                </Button>
              )}
            </div>
          </Card>
          {dialogOpen ? (
            <section className="chakra-dialog" role="dialog" aria-modal="true">
              <div className="chakra-dialog-panel">
                <span>Composition preview</span>
                <h3>Dialog composition</h3>
                <p>
                  The compiled component is managing open state, close actions, and nested
                  composition content without React in the browser bundle.
                </p>
                <div className="chakra-actions">
                  <Button size="sm" onClick={() => props.onAction?.({ name: "Confirm Dialog" })}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </section>
          ) : null}
          <section className="chakra-stats">
            <Stat label="packages/react exports" value="120+" />
            <Stat label="composition demos" value="40+" />
            <Stat label="theme tokens" value="300+" />
          </section>
        </main>
      </section>
    </ThemeContext.Provider>
  );
}
