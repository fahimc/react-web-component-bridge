import { performance } from "node:perf_hooks";
import React from "react";
import { createReactElement } from "../../packages/core/src/core/create-react-element";

type BenchmarkResult = {
  name: string;
  iterations: number;
  durationMs: number;
};

function measure(name: string, iterations: number, task: () => void): BenchmarkResult {
  const start = performance.now();
  for (let index = 0; index < iterations; index += 1) {
    task();
  }
  return {
    name,
    iterations,
    durationMs: Number((performance.now() - start).toFixed(2))
  };
}

function SimpleComponent(props: { label?: string }) {
  return React.createElement("span", undefined, props.label);
}

const results = [
  measure("create 1,000 metadata-backed definitions", 1_000, () => {
    createReactElement(`perf-card-${Math.random().toString(36).slice(2)}`, SimpleComponent, {
      props: {
        label: { type: "string", reflect: true }
      },
      events: {
        onSelect: { name: "select" }
      }
    } as never);
  }),
  measure("serialize 1,000-row grid payloads", 250, () => {
    JSON.stringify(
      Array.from({ length: 1_000 }, (_, index) => ({
        id: `c${index}`,
        name: `Customer ${index}`,
        email: `customer${index}@example.com`
      }))
    );
  })
];

console.table(results);
