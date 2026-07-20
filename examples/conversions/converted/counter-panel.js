import { defineComponentTag, h, useReducer } from "./scaffold.js";

function reducer(count, action) {
    return action.type === "increment" ? count + action.step : count - action.step;
}
function CounterPanel({ initialCount = 0, step = 1, onCountChange }) {
    const [count, dispatch] = useReducer(reducer, initialCount);
    function change(type) {
        const next = type === "increment" ? count + step : count - step;
        dispatch({ type, step });
        onCountChange?.(next);
    }
    return (h("section", { className: "counter-panel" },
        h("button", { onClick: () => change("decrement") }, "-"),
        h("output", null, count),
        h("button", { onClick: () => change("increment") }, "+")));
}


defineComponentTag("demo-counter-panel", CounterPanel, {"shadow":{"mode":"open"},"props":{"initialCount":{"attribute":"initial-count","type":"number"},"step":{"type":"number","reflect":true}},"events":{"onCountChange":{"name":"count-change"}},"styles":":host{display:inline-block}.counter-panel{display:inline-grid;grid-template-columns:2rem 4rem 2rem;gap:.5rem;align-items:center}output{text-align:center;font-weight:700}"});
