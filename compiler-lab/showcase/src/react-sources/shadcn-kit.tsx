import React, { useMemo, useState, type ReactNode } from "react";

type Variant = "default" | "secondary" | "outline" | "destructive";

const variants: Record<Variant, string> = {
  default: "variant-default",
  destructive: "variant-destructive",
  outline: "variant-outline",
  secondary: "variant-secondary"
};

function cn(...items: Array<string | false | undefined>) {
  return items.filter(Boolean).join(" ");
}

function Button(props: {
  children: string;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  variant?: Variant;
}) {
  const className = useMemo(
    () => cn("ui-button", variants[props.variant ?? "default"], `size-${props.size ?? "md"}`),
    [props.size, props.variant]
  );
  return (
    <button className={className} disabled={props.disabled} onClick={props.onClick} type="button">
      {props.children}
    </button>
  );
}

function Badge(props: { children: string; tone?: "green" | "amber" | "red" }) {
  return <span className={cn("kit-badge", `tone-${props.tone ?? "green"}`)}>{props.children}</span>;
}

function Card(props: { children: ReactNode; title: string }) {
  return (
    <article className="kit-card">
      <h3>{props.title}</h3>
      <div>{props.children}</div>
    </article>
  );
}

export function ShadcnKit(props: { onAction?: (action: { name: string }) => void }) {
  const [density, setDensity] = useState<"Comfortable" | "Compact">("Comfortable");
  const [active, setActive] = useState("Components");

  return (
    <section className="kit-app">
      <header className="kit-hero">
        <div>
          <p className="origin">shadcn/ui component-library pattern</p>
          <h2>Design system workbench compiled to Web Components</h2>
          <span>
            Buttons, badges, cards, tabs, forms, and table rows are authored as React
            component-library primitives.
          </span>
        </div>
        <Button onClick={() => props.onAction?.({ name: "Publish theme" })}>Publish theme</Button>
      </header>
      <nav className="kit-tabs">
        {["Components", "Tokens", "Preview"].map((tab) => (
          <button className={active === tab ? "active" : ""} onClick={() => setActive(tab)}>
            {tab}
          </button>
        ))}
      </nav>
      <main className="kit-grid">
        <Card title="Button variants">
          <div className="button-stack">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Delete</Button>
          </div>
        </Card>
        <Card title="Release status">
          <div className="badge-row">
            <Badge>Compiled</Badge>
            <Badge tone="amber">Review</Badge>
            <Badge tone="red">Blocked</Badge>
          </div>
        </Card>
        <Card title="Form controls">
          <label>
            Density
            <select
              value={density}
              onChange={(event) =>
                setDensity(event.currentTarget.value as "Comfortable" | "Compact")
              }
            >
              <option>Comfortable</option>
              <option>Compact</option>
            </select>
          </label>
          <p>{density} layout selected for host applications.</p>
        </Card>
        <Card title="Component table">
          <div className="kit-table">
            {["Button", "Badge", "Card", "Select"].map((name) => (
              <div>
                <strong>{name}</strong>
                <span>ready</span>
                <Button size="sm" variant="outline" onClick={() => props.onAction?.({ name })}>
                  Inspect
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </section>
  );
}
