import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  BRIDGE_REACT_IMPORT,
  compileReactComponentSource,
  generateArtifacts,
  rewriteReactImportsInFolder,
  rewriteReactImportsInText
} from "../src";

describe("generator", () => {
  it("generates metadata artifacts", () => {
    const output = generateArtifacts([
      {
        tagName: "acme-picker",
        properties: [{ name: "value", type: "string" }],
        attributes: [{ name: "value", property: "value" }],
        events: [{ name: "value-change", prop: "onValueChange", bubbles: true, composed: true }],
        slots: [{ prop: "children", name: null }],
        methods: [{ name: "focus" }],
        formAssociated: true,
        shadow: true
      }
    ]);
    expect(output.customElementsJson).toContain("acme-picker");
    expect(output.declarations).toContain("HTMLElementTagNameMap");
    expect(output.markdown).toContain("| event | value-change |");
  });

  it("rewrites exact react module import specifiers", () => {
    const output = rewriteReactImportsInText(`
import React, { useState } from "react";
import type { ReactNode } from 'react';
import "react";
const lazyType = import("react");
export { memo } from "react";
import { createRoot } from "react-dom/client";
import jsx from "react/jsx-runtime";
`);

    expect(output.replacements).toBe(5);
    expect(output.code).toContain(`from "${BRIDGE_REACT_IMPORT}"`);
    expect(output.code).toContain(`from '${BRIDGE_REACT_IMPORT}'`);
    expect(output.code).toContain(`import "${BRIDGE_REACT_IMPORT}"`);
    expect(output.code).toContain(`import("${BRIDGE_REACT_IMPORT}")`);
    expect(output.code).toContain('from "react-dom/client"');
    expect(output.code).toContain('from "react/jsx-runtime"');
  });

  it("rewrites react imports in a folder and supports dry run", async () => {
    const root = await mkdtemp(join(tmpdir(), "rwcb-imports-"));
    try {
      const src = join(root, "src");
      const ignored = join(root, "node_modules");
      await mkdir(src);
      await mkdir(ignored);
      const component = join(src, "component.tsx");
      const helper = join(src, "helper.ts");
      const ignoredFile = join(ignored, "ignored.tsx");

      await writeFile(component, 'import React, { useId } from "react";\n');
      await writeFile(helper, 'export type { ReactNode } from "react";\n');
      await writeFile(ignoredFile, 'import React from "react";\n');

      const dryRun = await rewriteReactImportsInFolder({ rootDir: root, dryRun: true });
      expect(dryRun.scannedFiles).toBe(2);
      expect(dryRun.changedFiles).toHaveLength(2);
      expect(await readFile(component, "utf8")).toContain('from "react"');

      const result = await rewriteReactImportsInFolder({ rootDir: root });
      expect(result.changedFiles.map((file) => file.replacements).sort()).toEqual([1, 1]);
      expect(await readFile(component, "utf8")).toContain(`from "${BRIDGE_REACT_IMPORT}"`);
      expect(await readFile(helper, "utf8")).toContain(`from "${BRIDGE_REACT_IMPORT}"`);
      expect(await readFile(ignoredFile, "utf8")).toContain('from "react"');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("no-React compiler", () => {
  it("compiles React-shaped TSX into executable Custom Elements without React imports", async () => {
    const tagName = `x-compiled-counter-${Math.random().toString(16).slice(2)}`;
    const result = compileReactComponentSource({
      source: `
        import React, { defineComponentTag, useMemo, useState } from "@fahimc/react-web-component-bridge/react";

        function Counter(props: { label?: string; onIncrement?: (value: number) => void }) {
          const [count, setCount] = useState(1);
          const label = useMemo(() => props.label ?? "Count", [props.label]);
          return (
            <button
              className="counter"
              onClick={() => {
                const next = count + 1;
                setCount(next);
                props.onIncrement?.(next);
              }}
            >
              {label}: {count}
            </button>
          );
        }

        defineComponentTag("${tagName}", Counter, {
          props: { label: { type: "string", reflect: true, default: "Count" } },
          events: { onIncrement: { name: "increment", detail: (value: number) => ({ value }) } },
          styles: ".counter{display:block}"
        });
      `
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.code).not.toContain('from "react"');
    expect(result.code).not.toContain("react-dom");

    new Function(result.code)();
    const element = document.createElement(tagName) as HTMLElement & { label: string };
    const events: unknown[] = [];
    element.addEventListener("increment", (event) => events.push((event as CustomEvent).detail));
    document.body.append(element);
    element.label = "Clicks";
    await Promise.resolve();

    const button = element.shadowRoot?.querySelector("button");
    expect(button?.textContent).toContain("Clicks: 1");
    button?.click();
    await Promise.resolve();
    expect(element.shadowRoot?.querySelector("button")?.textContent).toContain("Clicks: 2");
    expect(events).toEqual([{ value: 2 }]);
  });

  it("reports unsupported React APIs instead of silently bundling React", () => {
    const result = compileReactComponentSource({
      source: `
        import React, { createContext, useContext } from "react";
        const Theme = createContext("light");
        export function Card() {
          return <div>{useContext(Theme)}</div>;
        }
      `
    });

    expect(result.diagnostics).toContain(
      "React context is not supported by the no-React compiler yet."
    );
    expect(result.diagnostics).toContain(
      "useContext is not supported by the no-React compiler yet."
    );
    expect(result.code).not.toContain('from "react"');
  });
});
