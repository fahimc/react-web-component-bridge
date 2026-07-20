import { Suspense, defineComponentTag, h, lazy, useState } from "./scaffold.js";

const LoadedMessage = lazy(async () => ({
    default: function LoadedMessage() {
        return h("strong", null, "Async content loaded");
    }
}));
function AsyncStatus({ label = "Service status", onRefresh }) {
    const [refreshes, setRefreshes] = useState(0);
    return (h("section", { className: "async-status" },
        h("h3", null, label),
        h(Suspense, { fallback: h("span", null, "Loading status...") },
            h(LoadedMessage, null)),
        h("button", { onClick: () => {
                setRefreshes(refreshes + 1);
                onRefresh?.();
            } },
            "Refresh ",
            refreshes)));
}


defineComponentTag("demo-async-status", AsyncStatus, {"shadow":{"mode":"open"},"props":{"label":{"type":"string","reflect":true}},"events":{"onRefresh":{"name":"refresh"}},"styles":":host{display:block}.async-status{border:1px solid #d9e2ec;padding:1rem;border-radius:.5rem;display:grid;gap:.75rem}"});
