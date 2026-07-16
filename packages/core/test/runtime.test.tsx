import React, { forwardRef, useImperativeHandle, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  configureReactElements,
  createReactElement,
  defineReactElements,
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

  it("creates SSR-safe definitions when HTMLElement is unavailable", () => {
    const originalHTMLElement = globalThis.HTMLElement;
    vi.stubGlobal("HTMLElement", undefined);
    try {
      const definition = createReactElement("x-ssr-safe", () => React.createElement("span"), {});
      expect(definition.metadata.tagName).toBe("x-ssr-safe");
      expect(() => new definition.elementClass()).not.toThrow();
    } finally {
      vi.stubGlobal("HTMLElement", originalHTMLElement);
    }
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

  it("defines multiple pre-created definitions and skips existing registrations", () => {
    const first = createReactElement(uniqueTag("x-batch-a"), () => <span>A</span>, {});
    const second = createReactElement(uniqueTag("x-batch-b"), () => <span>B</span>, {});
    expect(defineReactElements([first, second])).toEqual([first, second]);
    expect(defineReactElements([first])).toEqual([first]);
  });

  it("rejects public methods that conflict with HTMLElement lifecycle names", () => {
    expect(() =>
      createReactElement("x-conflict-method", () => <span />, {
        methods: {
          connectedCallback: { call: () => undefined }
        }
      })
    ).toThrow("already exists");
  });

  it("resets form-associated values to configured defaults", () => {
    const tag = uniqueTag("x-form-reset");
    defineReactElement(tag, () => <span />, {
      props: {
        value: { type: "string", default: "initial" }
      },
      form: { valueProp: "value" }
    });
    const element = document.createElement(tag) as HTMLElement & {
      value: string;
      formResetCallback(): void;
    };
    document.body.append(element);
    element.value = "changed";
    element.formResetCallback();
    expect(element.value).toBe("initial");
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
