import React, { forwardRef, useImperativeHandle, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  configureReactElements,
  createReactElement,
  defineReactElement,
  getReactElementDefinition,
  isReactElementDefined
} from "../src";

const tags: string[] = [];
const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 0));

function uniqueTag(base: string): string {
  const tag = `${base}-${Math.random().toString(36).slice(2)}`;
  tags.push(tag);
  return tag;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("runtime", () => {
  it("creates definitions without registering them", () => {
    const tag = uniqueTag("x-create");
    const definition = createReactElement(tag, () => React.createElement("span"), {
      props: { label: { type: "string" } }
    });
    expect(definition.tagName).toBe(tag);
    expect(customElements.get(tag)).toBeUndefined();
  });

  it("defines a React-backed custom element and preserves state across prop updates", async () => {
    const tag = uniqueTag("x-counter");
    function Counter(props: { label?: string }) {
      const [count, setCount] = useState(0);
      return (
        <button onClick={() => setCount((value) => value + 1)}>
          {props.label}:{count}
        </button>
      );
    }
    defineReactElement(tag, Counter, {
      props: { label: { type: "string", reflect: true } }
    });
    const element = document.createElement(tag) as HTMLElement & { label: string };
    document.body.append(element);
    element.label = "A";
    await nextFrame();
    element.shadowRoot
      ?.querySelector("button")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextFrame();
    element.label = "B";
    await nextFrame();
    expect(element.getAttribute("label")).toBe("B");
    expect(element.shadowRoot?.textContent).toContain("B:1");
  });

  it("maps callback props to CustomEvents", async () => {
    const tag = uniqueTag("x-events");
    function Button(props: { onCustomerSelect?: (id: string, index: number) => void }) {
      return <button onClick={() => props.onCustomerSelect?.("c1", 2)}>select</button>;
    }
    defineReactElement(tag, Button, {
      events: {
        onCustomerSelect: {
          name: "customer-select",
          detail: (id, index) => ({ id, index }),
          cancelable: true
        }
      }
    });
    const element = document.createElement(tag);
    const listener = vi.fn((event: Event) => {
      expect((event as CustomEvent).detail).toEqual({ id: "c1", index: 2 });
    });
    element.addEventListener("customer-select", listener);
    document.body.append(element);
    await nextFrame();
    element.shadowRoot
      ?.querySelector("button")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("exposes public methods through refs", async () => {
    const tag = uniqueTag("x-method");
    const Search = forwardRef<{ focusSearch(): string }>(() => <input aria-label="search" />);
    Search.displayName = "Search";
    const WithHandle = forwardRef<{ focusSearch(): string }>((_, ref) => {
      useImperativeHandle(ref, () => ({ focusSearch: () => "focused" }));
      return <Search />;
    });
    WithHandle.displayName = "WithHandle";
    defineReactElement(tag, WithHandle, {
      methods: {
        focusSearch: { call: (instance) => (instance as { focusSearch(): string }).focusSearch() }
      }
    });
    const element = document.createElement(tag) as HTMLElement & { focusSearch(): string };
    document.body.append(element);
    await nextFrame();
    expect(element.focusSearch()).toBe("focused");
  });

  it("tracks registry state", () => {
    const tag = uniqueTag("x-registry");
    defineReactElement(tag, () => <span />, {});
    expect(isReactElementDefined(tag)).toBe(true);
    expect(getReactElementDefinition(tag)?.tagName).toBe(tag);
  });

  it("composes global and local wrappers", async () => {
    const tag = uniqueTag("x-wrapper");
    configureReactElements({
      wrap: (component) => <section data-global="true">{component}</section>
    });
    defineReactElement(tag, () => <span>wrapped</span>, {
      wrap: (component) => <article data-local="true">{component}</article>
    });
    const element = document.createElement(tag);
    document.body.append(element);
    await nextFrame();
    expect(element.shadowRoot?.querySelector("section article span")?.textContent).toBe("wrapped");
    configureReactElements({ wrap: undefined });
  });
});
