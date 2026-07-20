import { defineComponentTag, h, useMemo } from "./scaffold.js";

function MetricCard({ label = "Revenue", value = 128, delta = 12, onInspect }) {
    const tone = useMemo(() => (delta >= 0 ? "positive" : "negative"), [delta]);
    return (h("article", { className: `metric-card metric-card--${tone}` },
        h("span", { className: "metric-card__label" }, label),
        h("strong", { className: "metric-card__value" }, value),
        h("small", { className: "metric-card__delta" },
            delta >= 0 ? "+" : "",
            delta,
            "%"),
        h("button", { onClick: () => onInspect?.({ label, value }) }, "Inspect")));
}


defineComponentTag("demo-metric-card", MetricCard, {"shadow":{"mode":"open"},"props":{"label":{"type":"string","reflect":true},"value":{"type":"number","reflect":true},"delta":{"type":"number","reflect":true}},"events":{"onInspect":{"name":"inspect"}},"styles":":host{display:block}.metric-card{border:1px solid #d9e2ec;padding:1rem;border-radius:.5rem}.metric-card--positive{border-color:#10b981}.metric-card--negative{border-color:#ef4444}"});
