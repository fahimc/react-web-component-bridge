import { defineComponentTag, h } from "./scaffold.js";

function AlertBanner({ title = "System notice", message = "The deployment completed successfully.", tone = "info", onDismiss }) {
    return (h("aside", { className: `alert-banner alert-banner--${tone}`, role: "status" },
        h("div", null,
            h("strong", null, title),
            h("p", null, message)),
        h("button", { "aria-label": "Dismiss alert", onClick: () => onDismiss?.() }, "Close")));
}


defineComponentTag("demo-alert-banner", AlertBanner, {"shadow":{"mode":"open"},"props":{"title":{"type":"string","reflect":true},"message":{"type":"string"},"tone":{"type":"string","reflect":true}},"events":{"onDismiss":{"name":"dismiss"}},"styles":":host{display:block}.alert-banner{display:flex;justify-content:space-between;gap:1rem;border:1px solid #d9e2ec;padding:1rem;border-radius:.5rem}.alert-banner--danger{border-color:#ef4444}.alert-banner--success{border-color:#10b981}"});
