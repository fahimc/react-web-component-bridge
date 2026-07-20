import { defineComponentTag, h, useDeferredValue, useMemo, useState } from "./scaffold.js";

function FilterToolbar({ filters = ["Open", "Closed", "Mine"], onFilterChange }) {
    const [active, setActive] = useState(filters[0] ?? "");
    const deferredActive = useDeferredValue(active);
    const summary = useMemo(() => `Showing ${deferredActive || "all"} items`, [deferredActive]);
    return (h("nav", { className: "filter-toolbar", "aria-label": "Filters" },
        filters.map((filter) => (h("button", { key: filter, "aria-current": filter === active ? "page" : undefined, onClick: () => {
                setActive(filter);
                onFilterChange?.(filter);
            } }, filter))),
        h("span", null, summary)));
}


defineComponentTag("demo-filter-toolbar", FilterToolbar, {"shadow":{"mode":"open"},"props":{"filters":{"attribute":false,"default":["Open","Closed","Mine"]}},"events":{"onFilterChange":{"name":"filter-change"}},"styles":":host{display:block}.filter-toolbar{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}button[aria-current=page]{background:#111827;color:white}"});
