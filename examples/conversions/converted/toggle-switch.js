import { defineComponentTag, h, useState } from "./scaffold.js";

function ToggleSwitch({ label = "Enabled", defaultChecked = false, onToggle }) {
    const [checked, setChecked] = useState(defaultChecked);
    function toggle() {
        const next = !checked;
        setChecked(next);
        onToggle?.(next);
    }
    return (h("button", { className: "toggle-switch", "aria-pressed": checked, onClick: toggle },
        h("span", null, label),
        h("span", { className: "toggle-switch__track", "data-checked": checked },
            h("span", { className: "toggle-switch__thumb" }))));
}


defineComponentTag("demo-toggle-switch", ToggleSwitch, {"shadow":{"mode":"open"},"props":{"label":{"type":"string","reflect":true},"defaultChecked":{"attribute":"default-checked","type":"boolean"}},"events":{"onToggle":{"name":"toggle"}},"styles":":host{display:inline-block}.toggle-switch{display:inline-flex;gap:.75rem;align-items:center}.toggle-switch__track{width:2.5rem;height:1.25rem;border-radius:999px;background:#cbd5e1}.toggle-switch__track[data-checked=true]{background:#0f766e}.toggle-switch__thumb{display:block;width:1rem;height:1rem;margin:.125rem;border-radius:999px;background:white}"});
