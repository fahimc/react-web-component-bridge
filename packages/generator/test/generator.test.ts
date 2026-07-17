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

  it("supports formerly unsupported React APIs through the compiler runtime", async () => {
    const tagName = `x-compiled-rich-${Math.random().toString(16).slice(2)}`;
    const result = compileReactComponentSource({
      source: `
        import React, {
          Suspense,
          createContext,
          defineComponentTag,
          forwardRef,
          lazy,
          useContext,
          useEffect,
          useImperativeHandle,
          useReducer
        } from "@fahimc/react-web-component-bridge/react";
        import { createPortal } from "react-dom";

        const Theme = createContext("base");
        const LazyBadge = lazy(() => Promise.resolve({ default: () => <strong className="lazy">Lazy ready</strong> }));

        function Label() {
          return <span className="theme">{useContext(Theme)}</span>;
        }

        const RichCard = forwardRef((props: {
          theme?: string;
          portalTarget?: HTMLElement;
          onEffect?: (phase: string) => void;
        }, ref) => {
          const [count, dispatch] = useReducer((value: number, action: { type: "inc" }) => {
            return action.type === "inc" ? value + 1 : value;
          }, 1);

          useImperativeHandle(ref, () => ({
            increment: () => dispatch({ type: "inc" })
          }), []);

          useEffect(() => {
            props.onEffect?.("mounted");
            return () => props.onEffect?.("cleanup");
          }, []);

          return (
            <Theme.Provider value={props.theme ?? "base"}>
              <button className="count" onClick={() => dispatch({ type: "inc" })}>{count}</button>
              <Label />
              <Suspense fallback={<em className="fallback">Loading</em>}>
                <LazyBadge />
              </Suspense>
              {props.portalTarget ? createPortal(<span className="portal">Portal {count}</span>, props.portalTarget) : null}
            </Theme.Provider>
          );
        });

        defineComponentTag("${tagName}", RichCard, {
          props: {
            theme: { type: "string" },
            portalTarget: { attribute: false }
          },
          events: {
            onEffect: { name: "effect-phase", detail: (phase: string) => ({ phase }) }
          },
          methods: {
            increment: { call: (instance: { increment(): void }) => instance.increment() }
          }
        });
      `
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.code).not.toContain('from "react"');
    expect(result.code).not.toContain("react-dom");

    new Function(result.code)();
    const portalTarget = document.createElement("div");
    document.body.append(portalTarget);
    const element = document.createElement(tagName) as HTMLElement & {
      theme: string;
      portalTarget: HTMLElement;
      increment(): void;
    };
    const phases: unknown[] = [];
    element.addEventListener("effect-phase", (event) => phases.push((event as CustomEvent).detail));
    element.theme = "contrast";
    element.portalTarget = portalTarget;
    document.body.append(element);
    await Promise.resolve();

    expect(element.shadowRoot?.querySelector(".theme")?.textContent).toBe("contrast");
    expect(element.shadowRoot?.querySelector(".count")?.textContent).toBe("1");
    expect(element.shadowRoot?.querySelector(".fallback")?.textContent).toBe("Loading");
    expect(portalTarget.textContent).toContain("Portal 1");
    expect(phases).toEqual([{ phase: "mounted" }]);

    element.increment();
    await Promise.resolve();
    expect(element.shadowRoot?.querySelector(".count")?.textContent).toBe("2");
    expect(portalTarget.textContent).toContain("Portal 2");

    await Promise.resolve();
    await Promise.resolve();
    expect(element.shadowRoot?.querySelector(".lazy")?.textContent).toBe("Lazy ready");
  });
});
