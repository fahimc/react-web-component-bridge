import React, { useReducer } from "react";

type CounterPanelProps = {
  initialCount?: number;
  step?: number;
  onCountChange?: (count: number) => void;
};

function reducer(count: number, action: { type: "increment" | "decrement"; step: number }) {
  return action.type === "increment" ? count + action.step : count - action.step;
}

export function CounterPanel({ initialCount = 0, step = 1, onCountChange }: CounterPanelProps) {
  const [count, dispatch] = useReducer(reducer, initialCount);

  function change(type: "increment" | "decrement") {
    const next = type === "increment" ? count + step : count - step;
    dispatch({ type, step });
    onCountChange?.(next);
  }

  return (
    <section className="counter-panel">
      <button onClick={() => change("decrement")}>-</button>
      <output>{count}</output>
      <button onClick={() => change("increment")}>+</button>
    </section>
  );
}
