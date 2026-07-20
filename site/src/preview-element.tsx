import React from "react";
import { defineComponentTag } from "@codedia/react-to-web-component-runtime/react";

type PreviewAction = {
  label: string;
  metric: number;
};

type PreviewElementProps = {
  heading?: string;
  accent?: string;
  metric?: number;
  compact?: boolean;
  onAction?: (payload: PreviewAction) => void;
};

const palette: Record<string, string> = {
  emerald: "#0f9f6e",
  amber: "#c88405",
  blue: "#2563eb",
  graphite: "#343a40"
};

function SitePreviewCard({
  heading = "Pipeline monitor",
  accent = "emerald",
  metric = 42,
  compact = false,
  onAction
}: PreviewElementProps) {
  const color = palette[accent] ?? palette.emerald;

  return (
    <article className={compact ? "preview-card compact" : "preview-card"}>
      <div className="preview-topline">
        <span style={{ backgroundColor: color }} />
        <strong>{accent}</strong>
      </div>
      <h3>{heading}</h3>
      <p>
        This React component is rendered inside a Custom Element boundary, then consumed as a normal
        browser tag.
      </p>
      <div className="preview-metric">
        <b>{metric}</b>
        <span>updates bridged</span>
      </div>
      <button type="button" onClick={() => onAction?.({ label: heading, metric })}>
        Dispatch CustomEvent
      </button>
    </article>
  );
}

if (typeof customElements !== "undefined" && !customElements.get("rwcb-site-preview")) {
  defineComponentTag("rwcb-site-preview", SitePreviewCard, {
    shadow: { mode: "open" },
    props: {
      heading: { type: "string", reflect: true, default: "Pipeline monitor" },
      accent: { type: "string", reflect: true, default: "emerald" },
      metric: { type: "number", reflect: true, default: 42 },
      compact: { type: "boolean", reflect: true, default: false }
    },
    events: {
      onAction: {
        name: "preview-action",
        detail: (payload: PreviewAction) => payload
      }
    },
    styles: `
      :host {
        display: block;
        color: #111827;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .preview-card {
        min-height: 320px;
        display: grid;
        align-content: start;
        gap: 16px;
        border: 1px solid #d9e0e7;
        border-radius: 8px;
        background: #ffffff;
        padding: 24px;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
      }

      .preview-card.compact {
        min-height: 240px;
        gap: 10px;
        padding: 18px;
      }

      .preview-topline {
        display: flex;
        align-items: center;
        gap: 8px;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0;
        color: #4b5563;
      }

      .preview-topline span {
        width: 12px;
        height: 12px;
        border-radius: 999px;
      }

      h3 {
        margin: 0;
        font-size: 28px;
        line-height: 1.08;
      }

      p {
        margin: 0;
        color: #4b5563;
        line-height: 1.6;
      }

      .preview-metric {
        display: flex;
        align-items: baseline;
        gap: 10px;
      }

      .preview-metric b {
        font-size: 44px;
        line-height: 1;
      }

      button {
        width: fit-content;
        border: 0;
        border-radius: 6px;
        background: #111827;
        color: white;
        padding: 10px 14px;
        font: inherit;
        cursor: pointer;
      }

      button:focus-visible {
        outline: 3px solid #f2b84b;
        outline-offset: 2px;
      }
    `
  });
}

export type { PreviewAction };
