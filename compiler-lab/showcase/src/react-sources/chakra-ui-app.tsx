import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ColorMode = "Light" | "Dark";
type Variant = "solid" | "subtle" | "outline";

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
  const context = useMemo(() => ({ accent, mode }), [accent, mode]);

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
              <Button>Solid</Button>
              <Button variant="subtle">Subtle</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </Card>
          <Card title="Composition registry">
            <div className="chakra-table">
              {["Accordion", "Dialog", "Menu", "Toast"].map((name) => (
                <div>
                  <strong>{name}</strong>
                  <span>{activeTab}</span>
                  <Button size="sm" variant="outline" onClick={() => props.onAction?.({ name })}>
                    Inspect
                  </Button>
                </div>
              ))}
            </div>
          </Card>
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
